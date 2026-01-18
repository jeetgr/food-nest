import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  numeric,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

import { primaryId, timestamps } from "./common";
import { order } from "./orders";

export const paymentMethodEnum = pgEnum("payment_method", ["cod", "stripe"]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const payment = pgTable(
  "payment",
  {
    id: primaryId(),
    orderId: text("order_id")
      .notNull()
      .unique()
      .references(() => order.id, { onDelete: "cascade" }),
    method: paymentMethodEnum("method").notNull(),
    status: paymentStatusEnum("status").default("pending").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    // Nullable for COD, populated for Stripe
    providerTransactionId: text("provider_transaction_id"),
    // Store provider-specific data (e.g., Stripe payment intent, webhook data)
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestamps,
  },
  (table) => [
    index("payment_order_id_idx").on(table.orderId),
    index("payment_status_idx").on(table.status),
    index("payment_provider_tx_idx").on(table.providerTransactionId),
  ],
);

export const paymentRelations = relations(payment, ({ one }) => ({
  order: one(order, {
    fields: [payment.orderId],
    references: [order.id],
  }),
}));

export type Payment = typeof payment.$inferSelect;
export type NewPayment = typeof payment.$inferInsert;
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
