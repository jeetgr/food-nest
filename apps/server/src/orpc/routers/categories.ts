import { db } from "@foodnest/db";
import { category } from "@foodnest/db/schema/categories";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure, adminProcedure } from "../index";

const categoryInput = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  image: z.string().url().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const categoriesRouter = {
  list: publicProcedure.route({ method: "GET" }).handler(async () => {
    return db.query.category.findMany({
      where: eq(category.isActive, true),
      orderBy: [asc(category.sortOrder), asc(category.name)],
    });
  }),

  getBySlug: publicProcedure
    .route({ method: "GET" })
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      return db.query.category.findFirst({
        where: eq(category.slug, input.slug),
        with: {
          foods: {
            where: (food, { eq }) => eq(food.isAvailable, true),
          },
        },
      });
    }),

  create: adminProcedure.input(categoryInput).handler(async ({ input }) => {
    const [created] = await db.insert(category).values(input).returning();
    return created;
  }),

  update: adminProcedure
    .input(z.object({ id: z.string(), data: categoryInput.partial() }))
    .handler(async ({ input }) => {
      const [updated] = await db
        .update(category)
        .set(input.data)
        .where(eq(category.id, input.id))
        .returning();
      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      await db.delete(category).where(eq(category.id, input.id));
      return { success: true };
    }),
};
