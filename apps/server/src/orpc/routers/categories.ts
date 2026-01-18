import { db } from "@foodnest/db";
import { category } from "@foodnest/db/schema/categories";
import { ORPCError } from "@orpc/server";
import { eq, asc, isNull, and } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure, adminProcedure } from "../index";
import { localStorageProvider } from "../providers/storage/local";
import { validateBase64Image, generateSlug } from "../utils/image";

// Input schemas
const categoryInput = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  image: z.string(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

const categoryUpdateInput = z.object({
  id: z.string(),
  data: z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).optional(),
    image: z.string().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const categoriesRouter = {
  list: publicProcedure
    .route({ method: "GET" })
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(10),
        all: z.boolean().default(false), // For dropdowns - return all active without pagination
        includeInactive: z.boolean().default(false), // For admin - include inactive categories
      }),
    )
    .handler(async ({ input }) => {
      const { page, limit, all, includeInactive } = input;

      // Build where clause - only filter by isActive if NOT including inactive
      const whereClause = includeInactive
        ? isNull(category.deletedAt)
        : and(eq(category.isActive, true), isNull(category.deletedAt));

      // If all=true, return everything active (for dropdowns)
      if (all) {
        const items = await db.query.category.findMany({
          where: and(eq(category.isActive, true), isNull(category.deletedAt)), // Dropdowns always only show active
          orderBy: [asc(category.sortOrder), asc(category.name)],
        });
        return {
          items,
          total: items.length,
          page: 1,
          limit: items.length,
          totalPages: 1,
        };
      }

      const offset = (page - 1) * limit;

      // Parallel fetch: count + paginated items
      const [total, items] = await Promise.all([
        db.$count(category, whereClause),
        db.query.category.findMany({
          where: whereClause,
          orderBy: [asc(category.sortOrder), asc(category.name)],
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
      const result = await db.query.category.findFirst({
        where: and(eq(category.slug, input.slug), isNull(category.deletedAt)),
        with: {
          foods: {
            where: (food, { eq }) => eq(food.isAvailable, true),
          },
        },
      });

      if (!result) {
        throw new ORPCError("NOT_FOUND", { message: "Category not found" });
      }

      return result;
    }),

  getById: adminProcedure
    .route({ method: "GET" })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const result = await db.query.category.findFirst({
        where: and(eq(category.id, input.id), isNull(category.deletedAt)),
      });

      if (!result) {
        throw new ORPCError("NOT_FOUND", { message: "Category not found" });
      }

      return result;
    }),

  create: adminProcedure.input(categoryInput).handler(async ({ input }) => {
    console.log(input);
    const slug = input.slug || generateSlug(input.name);

    // Check for duplicate slug
    const existing = await db.query.category.findFirst({
      where: eq(category.slug, slug),
    });

    if (existing) {
      throw new ORPCError("CONFLICT", {
        message: "Category with this slug already exists",
      });
    }

    // Validate and upload image
    const { buffer, extension } = validateBase64Image(input.image, true);

    const uploadResult = await localStorageProvider.upload(
      buffer!,
      `${slug}.${extension}`,
      "categories",
    );

    if (!uploadResult.success) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: uploadResult.error || "Failed to upload image",
      });
    }

    const [created] = await db
      .insert(category)
      .values({
        name: input.name,
        slug,
        image: uploadResult.url!,
        isActive: input.isActive,
        sortOrder: input.sortOrder,
      })
      .returning();

    if (!created) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create category",
      });
    }

    return created;
  }),

  update: adminProcedure
    .input(categoryUpdateInput)
    .handler(async ({ input }) => {
      // Check if category exists
      const existing = await db.query.category.findFirst({
        where: eq(category.id, input.id),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Category not found" });
      }

      const updateData: Partial<typeof category.$inferInsert> = {};

      if (input.data.name !== undefined) {
        updateData.name = input.data.name;
      }

      if (input.data.slug !== undefined) {
        updateData.slug = input.data.slug;
      } else if (input.data.name !== undefined) {
        updateData.slug = generateSlug(input.data.name);
      }

      if (input.data.isActive !== undefined) {
        updateData.isActive = input.data.isActive;
      }

      if (input.data.sortOrder !== undefined) {
        updateData.sortOrder = input.data.sortOrder;
      }

      // Handle image upload if new base64 image provided
      if (input.data.image?.startsWith("data:")) {
        const { buffer, extension } = validateBase64Image(
          input.data.image,
          true,
        );

        const slug = updateData.slug || existing.slug;
        const uploadResult = await localStorageProvider.upload(
          buffer!,
          `${slug}.${extension}`,
          "categories",
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
        .update(category)
        .set(updateData)
        .where(eq(category.id, input.id))
        .returning();

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const existing = await db.query.category.findFirst({
        where: eq(category.id, input.id),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Category not found" });
      }

      const [updated] = await db
        .update(category)
        .set({ deletedAt: new Date() })
        .where(eq(category.id, input.id))
        .returning();

      return { success: !!updated };
    }),
};
