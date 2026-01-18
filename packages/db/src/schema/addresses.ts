import { pgTable, text, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";

import { user } from "./auth";
import { primaryId, timestamps } from "./common";
import { order } from "./orders";

export const address = pgTable(
  "address",
  {
    id: primaryId(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    label: text("label").notNull(), // e.g., "Home", "Work"
    street: text("street").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    postalCode: text("postal_code").notNull(),
    phone: text("phone").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    ...timestamps,
  },
  (table) => [
    index("address_user_id_idx").on(table.userId),
    index("address_is_default_idx").on(table.isDefault),
    index("address_deleted_at_idx").on(table.deletedAt),
  ],
);

export const addressRelations = relations(address, ({ one, many }) => ({
  user: one(user, {
    fields: [address.userId],
    references: [user.id],
  }),
  orders: many(order),
}));

export type Address = typeof address.$inferSelect;
export type NewAddress = typeof address.$inferInsert;
