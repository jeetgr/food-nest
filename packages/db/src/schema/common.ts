import { timestamp, text } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

/**
 * Shared timestamp columns for all tables
 */
export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
};

/**
 * Generate a unique ID using crypto
 * Use this for all primary keys instead of auto-increment
 */
export function generateId(): string {
  return uuidv7();
}

/**
 * Primary key column helper
 */
export const primaryId = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => generateId());
