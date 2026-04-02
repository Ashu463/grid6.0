import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SessionService } from '../session/session.service';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
/**
 * BASE_URL points to the monolith running on port 9000.
 * All service calls are routed through here.
 */
const BASE_URL = process.env.SERVICE_BASE_URL || 'http://localhost:9000';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    private readonly http: HttpService,
    private readonly sessionService: SessionService,
  ) {}

  // ─────────────────────────────────────────────
  // INTERNAL HELPERS
  // ─────────────────────────────────────────────

  private headers(token?: string, userId?: string) {
    return {
      'Content-Type': 'application/json',
      ...(token && { 'jwt-token': token }),
      ...(userId && { 'x-user-id': userId }),
    };
  }

  private resolveSession(token?: string, userId?: string): string {
    return token ?? userId ?? 'anonymous';
  }

  private async forward<T = any>(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    data?: any,
    token?: string,
    userId?: string
  ): Promise<T> {
    const url = `${BASE_URL}${path}`;
    this.logger.log(`[GATEWAY] ${method.toUpperCase()} → ${url}`);
    try {
      const config = { headers: this.headers(token, userId) };
      let response$: Observable<AxiosResponse<T>>;
      if (method === 'get') response$ = this.http.get<T>(url, config);
      else if (method === 'post') response$ = this.http.post<T>(url, data, config);
      else if (method === 'put') response$ = this.http.put<T>(url, data, config);
      else response$ = this.http.delete<T>(url, config);

      const res = await firstValueFrom(response$);
      return res.data;
    } catch (err) {
      const status = err?.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
      const message = err?.response?.data?.message ?? err.message ?? 'Gateway error';
      this.logger.error(`[GATEWAY] Error forwarding to ${url}: ${message}`);
      throw new HttpException({ message, upstream: url }, status);
    }
  }

  // ─────────────────────────────────────────────
  // USER MANAGEMENT
  // ─────────────────────────────────────────────

  async register(body: any) {
    const result = await this.forward('post', '/auth/register', { data: body });
    // On successful registration auto-create a session placeholder
    if (result?.data?.userId) {
      this.sessionService.create(result.data.userId, { userId: result.data.userId });
    }
    return result;
  }

  async login(body: any, token?: string) {
    const result = await this.forward('post', '/auth/login', { data: body }, token);
    // Hydrate session with returned token + userId
    if (result?.data) {
      const sessionId = result.data.token ?? result.data.userId;
      this.sessionService.create(sessionId, {
        userId: result.data.userId,
        token: result.data.token,
      });
    }
    return result;
  }

  async logout(body: any, token?: string) {
    const sessionId = this.resolveSession(token, body?.userId);
    const result = await this.forward('post', '/auth/logout', { data: body }, token);
    this.sessionService.destroy(sessionId);
    return result;
  }

  async getUser(userId: string, token?: string) {
    return this.forward('get', `/auth/users/${userId}`, undefined, token);
  }

  async updateUser(userId: string, body: any, token?: string) {
    return this.forward('put', `/auth/users/${userId}`, { data: body }, token);
  }

  async updatePassword(userId: string, body: any, token?: string) {
    return this.forward('put', `/auth/reset-password/${userId}`, { data: body }, token);
  }

  async deleteUser(userId: string, token?: string) {
    const result = await this.forward('delete', `/auth/users/${userId}`, undefined, token);
    this.sessionService.destroy(token ?? userId);
    return result;
  }

  // ─────────────────────────────────────────────
  // PRODUCT MANAGEMENT
  // ─────────────────────────────────────────────

  async createProduct(body: any, token?: string) {
    return this.forward('post', '/products/', body, token);
  }

  async getAllProducts(token?: string) {
    return this.forward('get', '/products/', undefined, token);
  }

  async getProduct(id: string, token?: string) {
    return this.forward('get', `/products/${id}`, undefined, token);
  }

  async updateProduct(id: string, body: any, token?: string) {
    return this.forward('put', `/products/${id}`, body, token);
  }

  async deleteProduct(id: string, token?: string) {
    return this.forward('delete', `/products/${id}`, undefined, token);
  }

  // ─────────────────────────────────────────────
  // CATEGORIES MANAGEMENT
  // ─────────────────────────────────────────────

  async createCategory(body: any, token?: string) {
    return this.forward('post', '/categories', { data: body }, token);
  }

  async getAllCategories(token?: string) {
    return this.forward('get', '/categories', undefined, token);
  }

  async getCategory(id: string, token?: string) {
    return this.forward('get', `/categories/${id}`, undefined, token);
  }

  async updateCategory(id: string, body: any, token?: string) {
    return this.forward('put', `/categories/${id}`, { data: body }, token);
  }

  async deleteCategory(id: string, token?: string) {
    return this.forward('delete', `/categories/${id}`, undefined, token);
  }

  // ─────────────────────────────────────────────
  // CART MANAGEMENT
  // ─────────────────────────────────────────────

  async createCart(body: any, token?: string) {
    const result = await this.forward('post', '/cart', { data: body }, token);
    // Track cartId in session
    const sessionId = this.resolveSession(token, body?.userId);
    if (result?.data?.cartId) {
      this.sessionService.update(sessionId, { cartId: result.data.cartId });
    }
    return result;
  }

  async getCart(body: any, token?: string) {
    return this.forward('get', '/cart', { data: body }, token);
  }

  async addItemToCart(body: any, token?: string) {
    return this.forward('post', '/cart/items', { data: body }, token);
  }

  async updateCartItem(itemId: string, body: any, token?: string) {
    return this.forward('put', `/cart/items/${itemId}`, { data: body }, token);
  }

  async removeCartItem(itemId: string, token?: string) {
    return this.forward('delete', `/cart/items/${itemId}`, undefined, token);
  }

  // ─────────────────────────────────────────────
  // ORDER MANAGEMENT  ← intelligent chaining starts here
  // ─────────────────────────────────────────────

  /**
   * FLOW: Create Order → mark session as awaitingPayment
   * The gateway instructs the client to proceed to payment
   * and includes the payment hint in the response envelope.
   */
  async createOrder(body: any, token?: string) {
    const result = await this.forward('post', '/orders', { data: body }, token);

    const sessionId = this.resolveSession(token, body?.userId);
    const orderId = result?.data?.orderId ?? result?.data?.id;

    if (orderId) {
      this.sessionService.update(sessionId, {
        lastOrderId: orderId,
        awaitingPayment: true,
        pendingShippingCheck: false,
      });
    }

    // Intelligent hint: tell the consumer what to do next
    return {
      ...result,
      _gateway: {
        nextStep: 'payment',
        message: 'Order created. Please proceed to payment to confirm your order.',
        suggestedEndpoint: 'POST /gateway/payments',
        orderId,
      },
    };
  }

  async getOrder(orderId: string, token?: string) {
    return this.forward('get', `/orders/${orderId}`, undefined, token);
  }

  async getUserOrders(userId: string, token?: string) {
    return this.forward('get', `/orders/user/${userId}`, undefined, token);
  }

  async updateOrderStatus(orderId: string, body: any, token?: string) {
    return this.forward('put', `/orders/${orderId}`, { data: body }, token);
  }

  async deleteOrder(orderId: string, token?: string) {
    return this.forward('delete', `/orders/${orderId}`, undefined, token);
  }

  // ─────────────────────────────────────────────
  // PAYMENT PROCESSING  ← orchestrated post-order
  // ─────────────────────────────────────────────

  /**
   * FLOW: Create Payment
   *   1. Validate session has a pending order (awaitingPayment)
   *   2. Forward to payment service
   *   3. On success → mark awaitingPayment=false, pendingShippingCheck=true
   *   4. Auto-fetch available shipping methods & embed in response
   */
  async createPayment(body: any, token?: string) {
    const sessionId = this.resolveSession(token, body?.userId);
    const session = this.sessionService.get(sessionId);

    // Guard: must have an active order
    if (session && !session.awaitingPayment && !body?.orderId) {
      throw new HttpException(
        {
          message: 'No pending order found. Please create an order before initiating payment.',
          _gateway: { nextStep: 'createOrder', suggestedEndpoint: 'POST /gateway/orders' },
        },
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    // Ensure orderId flows through if session has it
    const enrichedBody = {
      ...body,
      orderId: body?.orderId ?? session?.lastOrderId,
    };

    const result = await this.forward('post', '/payments', { data: enrichedBody }, token);

    const paymentId = result?.data?.paymentId ?? result?.data?.id;
    const paymentSuccess =
      result?.data?.status === 'SUCCESS' ||
      result?.data?.status === 'COMPLETED' ||
      result?.success === true;

    if (paymentId) {
      this.sessionService.update(sessionId, {
        lastPaymentId: paymentId,
        awaitingPayment: false,
        pendingShippingCheck: paymentSuccess,
      });
    }

    let shippingMethods: any = null;
    if (paymentSuccess) {
      try {
        // Auto-chain: fetch shipping methods so user can immediately pick one
        const shippingRes = await this.forward('get', '/shipping/methods', undefined, token);
        shippingMethods = shippingRes?.data ?? shippingRes;
      } catch {
        this.logger.warn('Could not auto-fetch shipping methods after payment.');
      }
    }

    return {
      ...result,
      _gateway: paymentSuccess
        ? {
            nextStep: 'shipping',
            message: 'Payment successful! Select a shipping method to complete your order.',
            suggestedEndpoint: 'POST /gateway/shipping/estimate',
            orderId: enrichedBody.orderId,
            paymentId,
            availableShippingMethods: shippingMethods,
          }
        : {
            nextStep: 'retryPayment',
            message: 'Payment not confirmed. Please retry or use a different payment method.',
            suggestedEndpoint: 'POST /gateway/payments',
          },
    };
  }

  async getPayment(paymentId: string, token?: string) {
    return this.forward('get', `/payments/${paymentId}`, undefined, token);
  }

  /**
   * FLOW: Refund
   *   1. Process refund
   *   2. Auto-update the associated order status to REFUNDED
   */
  async processRefund(body: any, token?: string) {
    const result = await this.forward('post', '/payments/refund', { data: body }, token);

    const refundSuccess =
      result?.data?.status === 'REFUNDED' ||
      result?.success === true;

    if (refundSuccess && body?.orderId) {
      try {
        await this.forward(
          'put',
          `/orders/${body.orderId}`,
          { data: { status: 'REFUNDED' } },
          token,
        );
        this.logger.log(`[GATEWAY] Order ${body.orderId} auto-updated to REFUNDED`);
      } catch {
        this.logger.warn(`[GATEWAY] Could not auto-update order status after refund`);
      }
    }

    return {
      ...result,
      _gateway: {
        message: refundSuccess
          ? 'Refund processed and order status updated.'
          : 'Refund initiated. Monitor payment status.',
        orderId: body?.orderId,
      },
    };
  }

  // ─────────────────────────────────────────────
  // SHIPPING MANAGEMENT  ← orchestrated post-payment
  // ─────────────────────────────────────────────

  async getShippingMethods(token?: string) {
    return this.forward('get', '/shipping/methods', undefined, token);
  }

  /**
   * FLOW: Estimate Shipping
   *   1. Validate session has completed payment (pendingShippingCheck)
   *   2. Forward to shipping estimate
   *   3. Mark pendingShippingCheck=false once handled
   */
  async estimateShipping(body: any, token?: string) {
    const sessionId = this.resolveSession(token, body?.userId);
    const session = this.sessionService.get(sessionId);

    if (session && !session.pendingShippingCheck && !body?.orderId) {
      throw new HttpException(
        {
          message: 'No confirmed payment found. Please complete payment before requesting shipping.',
          _gateway: { nextStep: 'payment', suggestedEndpoint: 'POST /gateway/payments' },
        },
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    const enrichedBody = {
      ...body,
      orderId: body?.orderId ?? session?.lastOrderId,
    };

    const result = await this.forward('post', '/shipping/estimate', enrichedBody, token);

    this.sessionService.update(sessionId, { pendingShippingCheck: false });

    return {
      ...result,
      _gateway: {
        nextStep: 'done',
        message: 'Shipping estimated. Your order is now fully confirmed.',
        orderId: enrichedBody.orderId,
        paymentId: session?.lastPaymentId,
      },
    };
  }

  // ─────────────────────────────────────────────
  // REVIEWS MANAGEMENT  ← intelligent: only after delivered order
  // ─────────────────────────────────────────────

  /**
   * FLOW: Create Review
   *   Gateway checks session has a completed order for this product.
   *   If no session context, it still forwards but adds a soft warning.
   */
  async createReview(productId: string, body: any, token?: string) {
    const sessionId = this.resolveSession(token, body?.userId);
    const session = this.sessionService.get(sessionId);

    let warning: string | undefined;
    if (!session?.lastOrderId) {
      warning = 'Note: No purchase record found in current session. Reviews are ideally submitted after a confirmed purchase.';
    }

    const result = await this.forward('post', `/reviews/${productId}`, body, token);

    return {
      ...result,
      ...(warning ? { _gateway: { warning } } : {}),
    };
  }

  async getReviews(productId: string, token?: string) {
    return this.forward('get', `/reviews/${productId}`, undefined, token);
  }

  async deleteReview(reviewId: string, token?: string) {
    return this.forward('delete', `/reviews/${reviewId}`, undefined, token);
  }

  // ─────────────────────────────────────────────
  // SESSION INTROSPECTION (Admin/Debug)
  // ─────────────────────────────────────────────

  getSession(sessionId: string) {
    const session = this.sessionService.get(sessionId);
    if (!session) throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    return { sessionId, session };
  }

  getAllSessions() {
    return this.sessionService.listAll();
  }
}
