import { db } from "@foodnest/db";
import { address } from "@foodnest/db/schema/addresses";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";
import { ORPCError } from "@orpc/client";

const addressInput = z.object({
  label: z.string().min(1).max(50),
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  phone: z.string().min(1).max(20),
  isDefault: z.boolean().default(false),
});

export const addressesRouter = {
  list: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      const userId = context.session.user.id;
      return db.query.address.findMany({
        where: eq(address.userId, userId),
      });
    }),

  create: protectedProcedure
    .input(addressInput)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      // If this is set as default, unset other defaults
      if (input.isDefault) {
        await db
          .update(address)
          .set({ isDefault: false })
          .where(and(eq(address.userId, userId), eq(address.isDefault, true)));
      }

      const [created] = await db
        .insert(address)
        .values({ ...input, userId })
        .returning();

      return created;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: addressInput.partial() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      // Verify ownership
      const existing = await db.query.address.findFirst({
        where: and(eq(address.id, input.id), eq(address.userId, userId)),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Address not found" });
      }

      // If setting as default, unset others
      if (input.data.isDefault) {
        await db
          .update(address)
          .set({ isDefault: false })
          .where(and(eq(address.userId, userId), eq(address.isDefault, true)));
      }

      const [updated] = await db
        .update(address)
        .set(input.data)
        .where(eq(address.id, input.id))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session!.user.id;

      // Verify ownership
      const existing = await db.query.address.findFirst({
        where: and(eq(address.id, input.id), eq(address.userId, userId)),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Address not found" });
      }

      await db.delete(address).where(eq(address.id, input.id));
      return { success: true };
    }),

  setDefault: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session!.user.id;

      // Unset all defaults first
      await db
        .update(address)
        .set({ isDefault: false })
        .where(eq(address.userId, userId));

      // Set new default
      const [updated] = await db
        .update(address)
        .set({ isDefault: true })
        .where(and(eq(address.id, input.id), eq(address.userId, userId)))
        .returning();

      return updated;
    }),
};
