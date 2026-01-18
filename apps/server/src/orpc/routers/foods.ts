import { db } from "@foodnest/db";
import { food } from "@foodnest/db/schema/foods";
import { ORPCError } from "@orpc/server";
import { eq, and, asc, isNull, ilike } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, publicProcedure } from "../index";
import { localStorageProvider } from "../providers/storage/local";
import { validateBase64Image, generateSlug } from "../utils/image";

// Input schemas
const foodInput = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  image: z.string(),
  categoryId: z.string(),
  stock: z.number().int().min(0).default(0),
  isAvailable: z.boolean().default(true),
});

const foodUpdateInput = z.object({
  id: z.string(),
  data: z.object({
    name: z.string().min(1).max(200).optional(),
    slug: z.string().max(200).optional(),
    description: z.string().max(1000).optional(),
    price: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .optional(),
    image: z.string().optional(),
    categoryId: z.string().optional(),
    stock: z.number().int().min(0).optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const foodsRouter = {
  list: publicProcedure
    .route({ method: "GET" })
    .input(
      z.object({
        categoryId: z.string().optional(),
        query: z.string().optional(),
        onlyAvailable: z.boolean().default(true),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(12),
      }),
    )
    .handler(async ({ input }) => {
      const { categoryId, query, onlyAvailable, page, limit } = input;
      const conditions = [isNull(food.deletedAt)];

      if (onlyAvailable) {
        conditions.push(eq(food.isAvailable, true));
      }
      if (categoryId && categoryId !== "all") {
        conditions.push(eq(food.categoryId, categoryId));
      }
      if (query) {
        conditions.push(ilike(food.name, `%${query}%`));
      }

      const whereClause = and(...conditions);

      const offset = (page - 1) * limit;

      // Parallel fetch: count + paginated items
      const [total, items] = await Promise.all([
        db.$count(food, whereClause),
        db.query.food.findMany({
          where: whereClause,
          orderBy: [asc(food.name)],
          with: { category: true },
          limit,
          offset,
        }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  getBySlug: publicProcedure
    .route({ method: "GET" })
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      const result = await db.query.food.findFirst({
        where: and(eq(food.slug, input.slug), isNull(food.deletedAt)),
        with: { category: true },
      });

      if (!result) {
        throw new ORPCError("NOT_FOUND", { message: "Food not found" });
      }

      return result;
    }),

  getById: adminProcedure
    .route({ method: "GET" })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const result = await db.query.food.findFirst({
        where: and(eq(food.id, input.id), isNull(food.deletedAt)),
        with: { category: true },
      });

      if (!result) {
        throw new ORPCError("NOT_FOUND", { message: "Food not found" });
      }

      return result;
    }),

  create: adminProcedure.input(foodInput).handler(async ({ input }) => {
    const slug = input.slug || generateSlug(input.name);

    // Check for duplicate slug
    const existing = await db.query.food.findFirst({
      where: eq(food.slug, slug),
    });

    if (existing) {
      throw new ORPCError("CONFLICT", {
        message: "Food with this slug already exists",
      });
    }

    // Validate and upload image
    const { buffer, extension } = validateBase64Image(input.image, true);

    const uploadResult = await localStorageProvider.upload(
      buffer!,
      `${slug}.${extension}`,
      "foods",
    );

    if (!uploadResult.success) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: uploadResult.error || "Failed to upload image",
      });
    }

    const [created] = await db
      .insert(food)
      .values({
        name: input.name,
        slug,
        description: input.description,
        price: input.price,
        image: uploadResult.url!,
        categoryId: input.categoryId,
        stock: input.stock,
        isAvailable: input.isAvailable,
      })
      .returning();

    if (!created) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create food",
      });
    }

    return created;
  }),

  update: adminProcedure.input(foodUpdateInput).handler(async ({ input }) => {
    const existing = await db.query.food.findFirst({
      where: eq(food.id, input.id),
    });

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "Food not found" });
    }

    const updateData: Partial<typeof food.$inferInsert> = {};

    if (input.data.name !== undefined) {
      updateData.name = input.data.name;
    }

    if (input.data.slug !== undefined) {
      updateData.slug = input.data.slug;
    } else if (input.data.name !== undefined) {
      updateData.slug = generateSlug(input.data.name);
    }

    if (input.data.description !== undefined) {
      updateData.description = input.data.description;
    }

    if (input.data.price !== undefined) {
      updateData.price = input.data.price;
    }

    if (input.data.categoryId !== undefined) {
      updateData.categoryId = input.data.categoryId;
    }

    if (input.data.stock !== undefined) {
      updateData.stock = input.data.stock;
    }

    if (input.data.isAvailable !== undefined) {
      updateData.isAvailable = input.data.isAvailable;
    }

    // Handle image upload if new base64 image provided
    if (input.data.image?.startsWith("data:")) {
      const { buffer, extension } = validateBase64Image(input.data.image, true);

      const slug = updateData.slug || existing.slug;
      const uploadResult = await localStorageProvider.upload(
        buffer!,
        `${slug}.${extension}`,
        "foods",
      );

      if (!uploadResult.success) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: uploadResult.error || "Failed to upload image",
        });
      }

      // Delete old image
      if (existing.image) {
        await localStorageProvider.delete(existing.image);
      }

      updateData.image = uploadResult.url!;
    }

    const [updated] = await db
      .update(food)
      .set(updateData)
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
        throw new ORPCError("NOT_FOUND", { message: "Food not found" });
      }

      const [updated] = await db
        .update(food)
        .set({ isAvailable: !existing.isAvailable })
        .where(eq(food.id, input.id))
        .returning();

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const existing = await db.query.food.findFirst({
        where: eq(food.id, input.id),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Food not found" });
      }

      const [updated] = await db
        .update(food)
        .set({ deletedAt: new Date() })
        .where(eq(food.id, input.id))
        .returning();

      return { success: !!updated };
    }),
};
