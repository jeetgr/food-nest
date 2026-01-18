import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  boolean,
  numeric,
  index,
} from "drizzle-orm/pg-core";

import { category } from "./categories";
import { primaryId, timestamps } from "./common";
import { orderItem } from "./orders";

export const food = pgTable(
  "food",
  {
    id: primaryId(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    image: text("image").notNull(),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "restrict" }),
    stock: integer("stock").default(0).notNull(),
    isAvailable: boolean("is_available").default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    index("food_slug_idx").on(table.slug),
    index("food_category_id_idx").on(table.categoryId),
    index("food_is_available_idx").on(table.isAvailable),
  ],
);

export const foodRelations = relations(food, ({ one, many }) => ({
  category: one(category, {
    fields: [food.categoryId],
    references: [category.id],
  }),
  orderItems: many(orderItem),
}));

export type Food = typeof food.$inferSelect;
export type NewFood = typeof food.$inferInsert;
