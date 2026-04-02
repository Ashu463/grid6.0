import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { GatewayService } from './gateway.service';

/**
 * API GATEWAY CONTROLLER
 *
 * Single entry point for all service calls. This controller:
 *  - Extracts the JWT token from the `jwt-token` header for session lookup
 *  - Delegates to GatewayService which handles routing + intelligent chaining
 *  - All responses include an optional `_gateway` envelope with nextStep hints
 *
 * Intelligent Orchestration Flows:
 *  POST /gateway/orders  →  creates order, hints → POST /gateway/payments
 *  POST /gateway/payments  →  processes payment, auto-fetches shipping methods on success
 *  POST /gateway/shipping/estimate  →  validates payment done, estimates shipping
 *  POST /gateway/payments/refund  →  refund + auto-updates order to REFUNDED
 *  POST /gateway/reviews/:productId  →  warns if no purchase in session
 */
@ApiTags('🔀 API Gateway')
@ApiHeader({ name: 'jwt-token', description: 'Session token (required for authenticated routes)', required: false })
@Controller('gateway')
export class GatewayController {
  private readonly logger = new Logger(GatewayController.name);

  constructor(private readonly gatewayService: GatewayService) {}

  // ─────────────────────────────────────────────
  // USER MANAGEMENT
  // ─────────────────────────────────────────────

  @Post('auth/register')
  @ApiOperation({ summary: 'Register a new user (creates gateway session)' })
  @ApiBody({ description: 'Registration payload' })
  @ApiResponse({ status: 201, description: 'User registered and session initialized.' })
  register(@Body() body: any) {
    return this.gatewayService.register(body);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Login (creates gateway session with token)' })
  @ApiBody({ description: 'Login credentials' })
  @ApiResponse({ status: 200, description: 'User logged in, session hydrated.' })
  login(@Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.login(body, token);
  }

  @Post('auth/logout')
  @ApiOperation({ summary: 'Logout (destroys gateway session)' })
  @ApiBody({ description: 'Logout payload' })
  @ApiResponse({ status: 200, description: 'User logged out, session destroyed.' })
  logout(@Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.logout(body, token);
  }

  @Get('auth/users/:userId')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  getUser(@Param('userId') userId: string, @Headers('jwt-token') token?: string) {
    return this.gatewayService.getUser(userId, token);
  }

  @Put('auth/users/:userId')
  @ApiOperation({ summary: 'Update user details' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  updateUser(@Param('userId') userId: string, @Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.updateUser(userId, body, token);
  }

  @Put('auth/reset-password/:userId')
  @ApiOperation({ summary: 'Reset/update user password' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  updatePassword(@Param('userId') userId: string, @Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.updatePassword(userId, body, token);
  }

  @Delete('auth/users/:userId')
  @ApiOperation({ summary: 'Delete user and destroy session' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  deleteUser(@Param('userId') userId: string, @Headers('jwt-token') token?: string) {
    return this.gatewayService.deleteUser(userId, token);
  }

  // ─────────────────────────────────────────────
  // PRODUCTS
  // ─────────────────────────────────────────────

  @Post('products')
  @ApiOperation({ summary: 'Create a new product' })
  createProduct(@Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.createProduct(body, token);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get all products' })
  getAllProducts(@Headers('jwt-token') token?: string) {
    return this.gatewayService.getAllProducts(token);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  getProduct(@Param('id') id: string, @Headers('jwt-token') token?: string) {
    return this.gatewayService.getProduct(id, token);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Update product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  updateProduct(@Param('id') id: string, @Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.updateProduct(id, body, token);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  deleteProduct(@Param('id') id: string, @Headers('jwt-token') token?: string) {
    return this.gatewayService.deleteProduct(id, token);
  }

  // ─────────────────────────────────────────────
  // CATEGORIES
  // ─────────────────────────────────────────────

  @Post('categories')
  @ApiOperation({ summary: 'Create a new category' })
  createCategory(@Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.createCategory(body, token);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  getAllCategories(@Headers('jwt-token') token?: string) {
    return this.gatewayService.getAllCategories(token);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  getCategory(@Param('id') id: string, @Headers('jwt-token') token?: string) {
    return this.gatewayService.getCategory(id, token);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  updateCategory(@Param('id') id: string, @Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.updateCategory(id, body, token);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  deleteCategory(@Param('id') id: string, @Headers('jwt-token') token?: string) {
    return this.gatewayService.deleteCategory(id, token);
  }

  // ─────────────────────────────────────────────
  // CART
  // ─────────────────────────────────────────────

  @Post('cart')
  @ApiOperation({ summary: 'Create cart (tracks cartId in session)' })
  createCart(@Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.createCart(body, token);
  }

  @Get('cart')
  @ApiOperation({ summary: 'Get user cart' })
  getCart(@Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.getCart(body, token);
  }

  @Post('cart/items')
  @ApiOperation({ summary: 'Add item to cart' })
  addItemToCart(@Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.addItemToCart(body, token);
  }

  @Put('cart/items/:itemId')
  @ApiOperation({ summary: 'Update cart item' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID' })
  updateCartItem(@Param('itemId') itemId: string, @Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.updateCartItem(itemId, body, token);
  }

  @Delete('cart/items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID' })
  removeCartItem(@Param('itemId') itemId: string, @Headers('jwt-token') token?: string) {
    return this.gatewayService.removeCartItem(itemId, token);
  }

  // ─────────────────────────────────────────────
  // ORDERS  ← triggers payment hint
  // ─────────────────────────────────────────────

  @Post('orders')
  @ApiOperation({
    summary: '🔗 Create order → hints to proceed to POST /gateway/payments',
    description:
      'Creates an order and updates the gateway session with awaitingPayment=true. ' +
      'Response includes a _gateway.nextStep hint directing to payment.',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created. Response includes _gateway with nextStep=payment.',
  })
  createOrder(@Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.createOrder(body, token);
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  getOrder(@Param('orderId') orderId: string, @Headers('jwt-token') token?: string) {
    return this.gatewayService.getOrder(orderId, token);
  }

  @Get('orders/user/:userId')
  @ApiOperation({ summary: 'Get all orders for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  getUserOrders(@Param('userId') userId: string, @Headers('jwt-token') token?: string) {
    return this.gatewayService.getUserOrders(userId, token);
  }

  @Put('orders/:orderId')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  updateOrderStatus(@Param('orderId') orderId: string, @Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.updateOrderStatus(orderId, body, token);
  }

  @Delete('orders/:orderId')
  @ApiOperation({ summary: 'Delete order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  deleteOrder(@Param('orderId') orderId: string, @Headers('jwt-token') token?: string) {
    return this.gatewayService.deleteOrder(orderId, token);
  }

  // ─────────────────────────────────────────────
  // PAYMENTS  ← auto-chains to shipping on success
  // ─────────────────────────────────────────────

  @Post('payments')
  @ApiOperation({
    summary: '🔗 Process payment → auto-fetches shipping methods on success',
    description:
      'Validates session has a pending order (awaitingPayment=true). ' +
      'On successful payment, auto-fetches /shipping/methods and embeds them in the response. ' +
      'Sets pendingShippingCheck=true in session.',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment processed. On success, _gateway includes availableShippingMethods.',
  })
  createPayment(@Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.createPayment(body, token);
  }

  @Get('payments/:paymentId')
  @ApiOperation({ summary: 'Get payment details by ID' })
  @ApiParam({ name: 'paymentId', description: 'Payment ID' })
  getPayment(@Param('paymentId') paymentId: string, @Headers('jwt-token') token?: string) {
    return this.gatewayService.getPayment(paymentId, token);
  }

  @Post('payments/refund')
  @ApiOperation({
    summary: '🔗 Process refund → auto-updates associated order to REFUNDED',
    description:
      'Processes the refund and automatically updates the order status to REFUNDED ' +
      'if the orderId is present in the request body.',
  })
  processRefund(@Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.processRefund(body, token);
  }

  // ─────────────────────────────────────────────
  // SHIPPING  ← gated behind payment confirmation
  // ─────────────────────────────────────────────

  @Get('shipping/methods')
  @ApiOperation({ summary: 'Get available shipping methods' })
  getShippingMethods(@Headers('jwt-token') token?: string) {
    return this.gatewayService.getShippingMethods(token);
  }

  @Post('shipping/estimate')
  @ApiOperation({
    summary: '🔗 Estimate shipping → validates payment was completed first',
    description:
      'Checks session for pendingShippingCheck=true. ' +
      'If payment has not been completed, returns 412 with a nextStep hint. ' +
      'On success, clears shipping flag and marks order as fully confirmed.',
  })
  @ApiResponse({ status: 200, description: 'Shipping estimated. Order fully confirmed.' })
  @ApiResponse({ status: 412, description: 'Payment not completed. Cannot estimate shipping.' })
  estimateShipping(@Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.estimateShipping(body, token);
  }

  // ─────────────────────────────────────────────
  // REVIEWS  ← soft-gated: warns if no purchase in session
  // ─────────────────────────────────────────────

  @Post('reviews/:productId')
  @ApiOperation({
    summary: '🔗 Create review → warns if no purchase in session',
    description:
      'Creates a product review. If session has no lastOrderId, ' +
      'a soft warning is included in the _gateway envelope (review still goes through).',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  createReview(@Param('productId') productId: string, @Body() body: any, @Headers('jwt-token') token?: string) {
    return this.gatewayService.createReview(productId, body, token);
  }

  @Get('reviews/:productId')
  @ApiOperation({ summary: 'Get all reviews for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  getReviews(@Param('productId') productId: string, @Headers('jwt-token') token?: string) {
    return this.gatewayService.getReviews(productId, token);
  }

  @Delete('reviews/:reviewId')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  deleteReview(@Param('reviewId') reviewId: string, @Headers('jwt-token') token?: string) {
    return this.gatewayService.deleteReview(reviewId, token);
  }

  // ─────────────────────────────────────────────
  // SESSION INTROSPECTION  (Admin / Debug)
  // ─────────────────────────────────────────────

  @Get('_sessions/:sessionId')
  @ApiOperation({ summary: '[Admin] Inspect a specific gateway session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID (token or userId)' })
  getSession(@Param('sessionId') sessionId: string) {
    return this.gatewayService.getSession(sessionId);
  }

  @Get('_sessions')
  @ApiOperation({ summary: '[Admin] List all active gateway sessions' })
  getAllSessions() {
    return this.gatewayService.getAllSessions();
  }
}
