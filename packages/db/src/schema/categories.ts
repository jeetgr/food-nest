import { pgTable, text, integer, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";

import { primaryId, timestamps } from "./common";
import { food } from "./foods";

export const category = pgTable(
  "category",
  {
    id: primaryId(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    image: text("image").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps,
  },
  (table) => [
    index("category_slug_idx").on(table.slug),
    index("category_is_active_idx").on(table.isActive),
    index("category_deleted_at_idx").on(table.deletedAt),
  ],
);

export const categoryRelations = relations(category, ({ many }) => ({
  foods: many(food),
}));

export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;
