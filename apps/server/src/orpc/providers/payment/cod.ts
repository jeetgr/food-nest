import type { CreatePaymentInput, PaymentProvider, PaymentResult, RefundResult } from "./index";

/**
 * Cash on Delivery payment provider
 * - createPayment: immediately returns pending (no external call)
 * - verifyPayment: always true (manual verification by delivery person)
 * - refund: no-op for COD
 */
export class CodPaymentProvider implements PaymentProvider {
  readonly name = "cod" as const;

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    // COD doesn't require external payment processing
    // Payment is collected on delivery
    return {
      success: true,
      transactionId: `cod_${input.orderId}`,
      status: "pending",
    };
  }

  async verifyPayment(_transactionId: string): Promise<boolean> {
    // COD verification happens manually when delivery is complete
    return true;
  }

  async refund(_transactionId: string, _amount: number): Promise<RefundResult> {
    // COD refunds are handled manually
    return {
      success: true,
      refundId: undefined,
    };
  }
}

export const codPaymentProvider = new CodPaymentProvider();
