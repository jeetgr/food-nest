import { db } from "@foodnest/db";
import { food } from "@foodnest/db/schema/foods";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, publicProcedure } from "../index";

const foodInput = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/), // Numeric as string for precision
  image: z.string().url().optional(),
  categoryId: z.string(),
  stock: z.number().int().min(0).default(0),
  isAvailable: z.boolean().default(true),
});

export const foodsRouter = {
  list: publicProcedure
    .route({ method: "GET" })
    .input(
      z.object({
        categoryId: z.string().optional(),
        onlyAvailable: z.boolean().default(true),
      }),
    )
    .handler(async ({ input }) => {
      const conditions = [];

      if (input.onlyAvailable) {
        conditions.push(eq(food.isAvailable, true));
      }
      if (input.categoryId) {
        conditions.push(eq(food.categoryId, input.categoryId));
      }

      return db.query.food.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: [asc(food.name)],
        with: { category: true },
      });
    }),

  getBySlug: publicProcedure
    .route({ method: "GET" })
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      return db.query.food.findFirst({
        where: eq(food.slug, input.slug),
        with: { category: true },
      });
    }),

  create: adminProcedure.input(foodInput).handler(async ({ input }) => {
    const [created] = await db.insert(food).values(input).returning();
    return created;
  }),

  update: adminProcedure
    .input(z.object({ id: z.string(), data: foodInput.partial() }))
    .handler(async ({ input }) => {
      const [updated] = await db
        .update(food)
        .set(input.data)
        .where(eq(food.id, input.id))
        .returning();
      return updated;
    }),

  toggleAvailability: adminProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const existing = await db.query.food.findFirst({
        where: eq(food.id, input.id),
      });

      if (!existing) {
        throw new Error("Food not found");
      }

      const [updated] = await db
        .update(food)
        .set({ isAvailable: !existing.isAvailable })
        .where(eq(food.id, input.id))
        .returning();

      return updated;
    }),

  updateStock: adminProcedure
    .input(z.object({ id: z.string(), stock: z.number().int().min(0) }))
    .handler(async ({ input }) => {
      const [updated] = await db
        .update(food)
        .set({ stock: input.stock })
        .where(eq(food.id, input.id))
        .returning();
      return updated;
    }),
};
