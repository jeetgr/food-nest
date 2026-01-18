import { db } from "@foodnest/db";
import { cart, cartItem } from "@foodnest/db/schema/carts";
import { food } from "@foodnest/db/schema/foods";
import { ORPCError } from "@orpc/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure, protectedProcedure } from "../index";

const cartItemInput = z.object({
  foodId: z.string(),
  quantity: z.number().int().min(1),
});

const syncCartInput = z.object({
  guestId: z.string().optional(),
  items: z.array(cartItemInput),
});

export const cartRouter = {
  get: publicProcedure
    .input(z.object({ guestId: z.string().optional() }))
    .handler(async ({ input, context }) => {
      const userId = context.session?.user?.id;
      const guestId = input.guestId;

      if (!userId && !guestId) {
        return { items: [], total: 0 };
      }

      // Find active cart
      let activeCart;
      if (userId) {
        activeCart = await db.query.cart.findFirst({
          where: and(eq(cart.userId, userId), eq(cart.isActive, true)),
        });
      } else if (guestId) {
        activeCart = await db.query.cart.findFirst({
          where: and(eq(cart.guestId, guestId), eq(cart.isActive, true)),
        });
      }

      if (!activeCart) {
        return { items: [], total: 0 };
      }

      // Fetch items with current food details (price, image, name)
      const items = await db
        .select({
          id: cartItem.id,
          foodId: food.id,
          name: food.name,
          slug: food.slug,
          image: food.image,
          price: food.price, // Always current price
          quantity: cartItem.quantity,
          stock: food.stock,
          isAvailable: food.isAvailable,
        })
        .from(cartItem)
        .innerJoin(food, eq(cartItem.foodId, food.id))
        .where(eq(cartItem.cartId, activeCart.id));

      const total = items.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0,
      );

      return { items, total };
    }),

  update: publicProcedure
    .input(
      z.object({
        guestId: z.string().optional(),
        foodId: z.string(),
        quantity: z.number().int().min(0), // 0 means remove
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session?.user?.id;
      const { guestId, foodId, quantity } = input;

      if (!userId && !guestId) {
        throw new ORPCError("UNAUTHORIZED", {
          message: "User ID or Guest ID required",
        });
      }

      // Get or Create Cart
      let activeCart;
      const whereClause = userId
        ? and(eq(cart.userId, userId), eq(cart.isActive, true))
        : and(eq(cart.guestId, guestId!), eq(cart.isActive, true));

      activeCart = await db.query.cart.findFirst({ where: whereClause });

      if (!activeCart) {
        const [newCart] = await db
          .insert(cart)
          .values({
            userId: userId || null,
            guestId: userId ? null : guestId,
            isActive: true,
          })
          .returning();
        activeCart = newCart;
      }

      // Check if item exists
      const existingItem = await db.query.cartItem.findFirst({
        where: and(
          eq(cartItem.cartId, activeCart!.id),
          eq(cartItem.foodId, foodId),
        ),
      });

      if (quantity === 0) {
        if (existingItem) {
          await db.delete(cartItem).where(eq(cartItem.id, existingItem.id));
        }
      } else {
        if (existingItem) {
          await db
            .update(cartItem)
            .set({ quantity, updatedAt: new Date() })
            .where(eq(cartItem.id, existingItem.id));
        } else {
          await db.insert(cartItem).values({
            cartId: activeCart!.id,
            foodId,
            quantity,
          });
        }
      }

      return { success: true };
    }),

  sync: protectedProcedure
    .input(syncCartInput)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const { guestId, items: localItems } = input;

      // 1. Get User Cart
      let userCart = await db.query.cart.findFirst({
        where: and(eq(cart.userId, userId), eq(cart.isActive, true)),
      });

      if (!userCart) {
        const [newCart] = await db
          .insert(cart)
          .values({ userId, isActive: true })
          .returning();
        userCart = newCart;
      }

      // 2. If Guest ID provided, find Guest Cart and merge items
      if (guestId) {
        const guestCart = await db.query.cart.findFirst({
          where: and(eq(cart.guestId, guestId), eq(cart.isActive, true)),
        });

        if (guestCart) {
          // Move items from guest cart to user cart
          // Logic: fetch all guest items. For each, if user has it, update quantity. If not, insert.
          const guestItems = await db.query.cartItem.findMany({
            where: eq(cartItem.cartId, guestCart.id),
          });

          for (const gItem of guestItems) {
            const existingUserItem = await db.query.cartItem.findFirst({
              where: and(
                eq(cartItem.cartId, userCart!.id),
                eq(cartItem.foodId, gItem.foodId),
              ),
            });

            if (existingUserItem) {
              await db
                .update(cartItem)
                .set({
                  quantity: existingUserItem.quantity + gItem.quantity,
                  updatedAt: new Date(),
                })
                .where(eq(cartItem.id, existingUserItem.id));
            } else {
              await db.insert(cartItem).values({
                cartId: userCart!.id,
                foodId: gItem.foodId,
                quantity: gItem.quantity,
              });
            }
          }

          // Deactivate or delete guest cart
          await db
            .update(cart)
            .set({ isActive: false })
            .where(eq(cart.id, guestCart.id));
        }
      }

      // 3. Sync Local Items
      for (const lItem of localItems) {
        const existingUserItem = await db.query.cartItem.findFirst({
          where: and(
            eq(cartItem.cartId, userCart!.id),
            eq(cartItem.foodId, lItem.foodId),
          ),
        });

        if (!existingUserItem) {
          await db.insert(cartItem).values({
            cartId: userCart!.id,
            foodId: lItem.foodId,
            quantity: lItem.quantity,
          });
        }
      }

      return { success: true };
    }),
};
