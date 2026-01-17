import type { PaymentMethod, PaymentStatus } from "@foodnest/db/schema/payments";

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status: PaymentStatus;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  metadata?: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: PaymentMethod;

  /**
   * Create/initiate a payment for an order
   * For COD: immediately marks as pending
   * For Stripe: creates payment intent, returns client secret in metadata
   */
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;

  /**
   * Verify a payment (e.g., after Stripe webhook or manual COD confirmation)
   */
  verifyPayment(transactionId: string): Promise<boolean>;

  /**
   * Process a refund
   */
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}
