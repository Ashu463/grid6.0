import { Injectable, Logger } from '@nestjs/common';

export interface GatewaySession {
  userId?: string;
  token?: string;
  cartId?: string;
  lastOrderId?: string;
  lastPaymentId?: string;
  pendingShippingCheck?: boolean;
  awaitingPayment?: boolean;
  createdAt: Date;
  updatedAt: Date;
  meta?: Record<string, any>;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private sessions = new Map<string, GatewaySession>();

  /**
   * Creates or resets a session for a given token/sessionId
   */
  create(sessionId: string, data: Partial<GatewaySession> = {}): GatewaySession {
    const session: GatewaySession = {
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.sessions.set(sessionId, session);
    this.logger.log(`Session created: ${sessionId}`);
    return session;
  }

  /**
   * Retrieves a session by sessionId (usually the JWT token or userId)
   */
  get(sessionId: string): GatewaySession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Merges partial data into an existing session
   */
  update(sessionId: string, data: Partial<GatewaySession>): GatewaySession | null {
    const existing = this.sessions.get(sessionId);
    if (!existing) {
      this.logger.warn(`Session not found for update: ${sessionId}`);
      return null;
    }
    const updated: GatewaySession = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.sessions.set(sessionId, updated);
    return updated;
  }

  /**
   * Destroys a session
   */
  destroy(sessionId: string): boolean {
    const existed = this.sessions.has(sessionId);
    this.sessions.delete(sessionId);
    if (existed) this.logger.log(`Session destroyed: ${sessionId}`);
    return existed;
  }

  /**
   * Returns all active sessions (for admin/debug purposes)
   */
  listAll(): Record<string, GatewaySession> {
    const result: Record<string, GatewaySession> = {};
    this.sessions.forEach((v, k) => (result[k] = v));
    return result;
  }
}
