import { db } from "@foodnest/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, protectedProcedure } from "../index";
import { codPaymentProvider } from "../providers/payment/cod";
import { ORPCError } from "@orpc/client";
import { order, orderItem } from "@foodnest/db/schema/orders";
import { food } from "@foodnest/db/schema/foods";
import { payment } from "@foodnest/db/schema/payments";

const orderItemInput = z.object({
  foodId: z.string(),
  quantity: z.number().int().min(1),
});

const createOrderInput = z.object({
  addressId: z.string(),
  items: z.array(orderItemInput).min(1),
  notes: z.string().max(500).optional(),
  paymentMethod: z.enum(["cod", "stripe"]).default("cod"),
});

export const ordersRouter = {
  create: protectedProcedure
    .input(createOrderInput)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      // Fetch food items with prices
      const foodIds = input.items.map((item) => item.foodId);
      const foods = await db.query.food.findMany({
        where: (f, { inArray }) => inArray(f.id, foodIds),
      });

      // Build order items with prices
      const itemsWithPrices = input.items.map((item) => {
        const foodItem = foods.find((f) => f.id === item.foodId);
        if (!foodItem) {
          throw new ORPCError("NOT_FOUND", {
            message: `Food item ${item.foodId} not found`,
          });
        }
        if (!foodItem.isAvailable) {
          throw new ORPCError("NOT_FOUND", {
            message: `${foodItem.name} is not available`,
          });
        }
        if (foodItem.stock < item.quantity) {
          throw new ORPCError("NOT_FOUND", {
            message: `Insufficient stock for ${foodItem.name}`,
          });
        }

        const unitPrice = foodItem.price;
        const totalPrice = (parseFloat(unitPrice) * item.quantity).toFixed(2);

        return {
          foodId: item.foodId,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        };
      });

      // Calculate total
      const totalAmount = itemsWithPrices
        .reduce((sum, item) => sum + parseFloat(item.totalPrice), 0)
        .toFixed(2);

      // Transaction: create order, items, payment, update stock
      const [createdOrder] = await db.transaction(async (tx) => {
        // Create order
        const [newOrder] = await tx
          .insert(order)
          .values({
            userId,
            addressId: input.addressId,
            totalAmount,
            notes: input.notes,
            status: "pending",
          })
          .returning();

        if (!newOrder) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Failed to create order",
          });
        }

        // Create order items
        await tx.insert(orderItem).values(
          itemsWithPrices.map((item) => ({
            orderId: newOrder.id,
            ...item,
          })),
        );

        // Update stock
        for (const item of input.items) {
          await tx
            .update(food)
            .set({ stock: sql`${food.stock} - ${item.quantity}` })
            .where(eq(food.id, item.foodId));
        }

        // Create payment record
        const paymentResult = await codPaymentProvider.createPayment({
          orderId: newOrder.id,
          amount: parseFloat(totalAmount),
          method: "cod",
        });

        await tx.insert(payment).values({
          orderId: newOrder.id,
          method: "cod",
          status: paymentResult.status,
          amount: totalAmount,
          providerTransactionId: paymentResult.transactionId,
        });

        return [newOrder];
      });

      return createdOrder;
    }),

  getById: protectedProcedure
    .route({ method: "GET" })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session!.user.id;
      const user = context.session!.user as { role?: string };

      const result = await db.query.order.findFirst({
        where:
          user.role === "admin"
            ? eq(order.id, input.id)
            : and(eq(order.id, input.id), eq(order.userId, userId)),
        with: {
          items: { with: { food: true } },
          address: true,
          payment: true,
        },
      });

      return result;
    }),

  listMine: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      const userId = context.session!.user.id;

      return db.query.order.findMany({
        where: eq(order.userId, userId),
        orderBy: [desc(order.createdAt)],
        with: {
          items: { with: { food: true } },
          payment: true,
        },
      });
    }),

  listAll: adminProcedure.route({ method: "GET" }).handler(async () => {
    return db.query.order.findMany({
      orderBy: [desc(order.createdAt)],
      with: {
        user: true,
        items: { with: { food: true } },
        address: true,
        payment: true,
      },
    });
  }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "pending",
          "confirmed",
          "preparing",
          "ready",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ]),
      }),
    )
    .handler(async ({ input }) => {
      const [updated] = await db
        .update(order)
        .set({ status: input.status })
        .where(eq(order.id, input.id))
        .returning();

      // If order delivered, mark payment as completed (for COD)
      if (input.status === "delivered") {
        await db
          .update(payment)
          .set({ status: "completed" })
          .where(eq(payment.orderId, input.id));
      }

      return updated;
    }),
};
