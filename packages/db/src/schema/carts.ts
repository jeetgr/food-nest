import { eq, relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { primaryId, timestamps } from "./common";
import { food } from "./foods";

export const cart = pgTable(
  "cart",
  {
    id: primaryId(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    guestId: text("guest_id"), // For unauthenticated users
    isActive: boolean("is_active").default(true).notNull(), // To soft-delete/archive carts if needed
    ...timestamps,
  },
  (table) => [
    // A user can have only one active cart
    uniqueIndex("cart_user_id_idx")
      .on(table.userId)
      .where(eq(table.isActive, sql.raw("true"))),
    // A guest ID can have only one active cart
    uniqueIndex("cart_guest_id_idx")
      .on(table.guestId)
      .where(eq(table.isActive, sql.raw("true"))),
  ],
);

export const cartRelations = relations(cart, ({ one, many }) => ({
  user: one(user, {
    fields: [cart.userId],
    references: [user.id],
  }),
  items: many(cartItem),
}));

export const cartItem = pgTable(
  "cart_item",
  {
    id: primaryId(),
    cartId: text("cart_id")
      .notNull()
      .references(() => cart.id, { onDelete: "cascade" }),
    foodId: text("food_id")
      .notNull()
      .references(() => food.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    index("cart_item_cart_id_idx").on(table.cartId),
    index("cart_item_food_id_idx").on(table.foodId),
    // Prevent duplicate items in same cart - update quantity instead
    uniqueIndex("cart_item_cart_food_idx").on(table.cartId, table.foodId),
  ],
);

export const cartItemRelations = relations(cartItem, ({ one }) => ({
  cart: one(cart, {
    fields: [cartItem.cartId],
    references: [cart.id],
  }),
  food: one(food, {
    fields: [cartItem.foodId],
    references: [food.id],
  }),
}));

export type Cart = typeof cart.$inferSelect;
export type NewCart = typeof cart.$inferInsert;
export type CartItem = typeof cartItem.$inferSelect;
export type NewCartItem = typeof cartItem.$inferInsert;
