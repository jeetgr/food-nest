import { relations } from "drizzle-orm";
import { pgTable, text, integer, numeric, pgEnum, index } from "drizzle-orm/pg-core";
import { primaryId, timestamps } from "./common";
import { user } from "./auth";
import { address } from "./addresses";
import { food } from "./foods";
import { payment } from "./payments";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export const order = pgTable(
  "order",
  {
    id: primaryId(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    addressId: text("address_id")
      .notNull()
      .references(() => address.id, { onDelete: "restrict" }),
    status: orderStatusEnum("status").default("pending").notNull(),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("order_user_id_idx").on(table.userId),
    index("order_status_idx").on(table.status),
    index("order_created_at_idx").on(table.createdAt),
  ],
);

export const orderItem = pgTable(
  "order_item",
  {
    id: primaryId(),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    foodId: text("food_id")
      .notNull()
      .references(() => food.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [
    index("order_item_order_id_idx").on(table.orderId),
    index("order_item_food_id_idx").on(table.foodId),
  ],
);

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  address: one(address, {
    fields: [order.addressId],
    references: [address.id],
  }),
  items: many(orderItem),
  payment: one(payment),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
  food: one(food, {
    fields: [orderItem.foodId],
    references: [food.id],
  }),
}));

export type Order = typeof order.$inferSelect;
export type NewOrder = typeof order.$inferInsert;
export type OrderItem = typeof orderItem.$inferSelect;
export type NewOrderItem = typeof orderItem.$inferInsert;
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
