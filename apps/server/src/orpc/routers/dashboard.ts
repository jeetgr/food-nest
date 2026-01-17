import { db } from "@foodnest/db";
import { category } from "@foodnest/db/schema/categories";
import { food } from "@foodnest/db/schema/foods";
import { order, orderItem } from "@foodnest/db/schema/orders";
import { eq, sql, gte, and, lt, count, ilike, or } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure } from "../index";

// Pre-compute date boundaries
const getDateRanges = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(now.getDate() - 60);
  return { thirtyDaysAgo, sixtyDaysAgo };
};

export const dashboardRouter = {
  stats: adminProcedure.route({ method: "GET" }).handler(async () => {
    const { thirtyDaysAgo, sixtyDaysAgo } = getDateRanges();

    // Single Promise.all for all queries - maximum parallelization
    const [
      categoriesCount,
      foodsCount,
      ordersCount,
      revenueResult,
      ordersThisMonth,
      ordersLastMonth,
      revenueThisMonth,
      revenueLastMonth,
    ] = await Promise.all([
      // Counts
      db.$count(category, eq(category.isActive, true)),
      db.$count(food),
      db.$count(order),
      // Total revenue
      db
        .select({ total: sql<string>`COALESCE(SUM(total_amount), 0)` })
        .from(order)
        .where(eq(order.status, "delivered"))
        .then((r) => r[0]),
      // Orders this month
      db.$count(order, gte(order.createdAt, thirtyDaysAgo)),
      // Orders last month
      db.$count(
        order,
        and(
          gte(order.createdAt, sixtyDaysAgo),
          lt(order.createdAt, thirtyDaysAgo),
        ),
      ),
      // Revenue this month
      db
        .select({ total: sql<string>`COALESCE(SUM(total_amount), 0)` })
        .from(order)
        .where(
          and(
            eq(order.status, "delivered"),
            gte(order.createdAt, thirtyDaysAgo),
          ),
        )
        .then((r) => r[0]),
      // Revenue last month
      db
        .select({ total: sql<string>`COALESCE(SUM(total_amount), 0)` })
        .from(order)
        .where(
          and(
            eq(order.status, "delivered"),
            gte(order.createdAt, sixtyDaysAgo),
            lt(order.createdAt, thirtyDaysAgo),
          ),
        )
        .then((r) => r[0]),
    ]);

    return {
      categories: categoriesCount,
      foods: foodsCount,
      orders: ordersCount,
      revenue: parseFloat(revenueResult?.total || "0"),
      ordersChange: calculateChange(ordersThisMonth, ordersLastMonth),
      revenueChange: calculateChange(
        parseFloat(revenueThisMonth?.total || "0"),
        parseFloat(revenueLastMonth?.total || "0"),
      ),
    };
  }),

  recentOrders: adminProcedure.route({ method: "GET" }).handler(async () => {
    return db.query.order.findMany({
      orderBy: (order, { desc }) => [desc(order.createdAt)],
      limit: 5,
      with: {
        user: {
          columns: { id: true, name: true, email: true },
        },
        items: {
          with: {
            food: { columns: { name: true } },
          },
        },
      },
    });
  }),

  ordersByStatus: adminProcedure.route({ method: "GET" }).handler(async () => {
    return db
      .select({
        status: order.status,
        count: count(),
      })
      .from(order)
      .groupBy(order.status);
  }),

  topSellingFoods: adminProcedure.route({ method: "GET" }).handler(async () => {
    // Aggregate order items by food, sum quantities, order by total sold
    const topFoods = await db
      .select({
        foodId: orderItem.foodId,
        totalSold: sql<number>`SUM(${orderItem.quantity})::int`.as(
          "total_sold",
        ),
        totalRevenue: sql<string>`SUM(${orderItem.totalPrice})`.as(
          "total_revenue",
        ),
      })
      .from(orderItem)
      .groupBy(orderItem.foodId)
      .orderBy(sql`total_sold DESC`)
      .limit(5);

    // Get full food details for top sellers
    if (topFoods.length === 0) return [];

    const foodIds = topFoods.map((f) => f.foodId);
    const foods = await db.query.food.findMany({
      where: (food, { inArray }) => inArray(food.id, foodIds),
      with: { category: { columns: { name: true } } },
    });

    // Merge with sales data and sort by totalSold
    return topFoods.map((tf) => {
      const foodData = foods.find((f) => f.id === tf.foodId);
      return {
        ...foodData,
        totalSold: tf.totalSold,
        totalRevenue: parseFloat(tf.totalRevenue || "0"),
      };
    });
  }),

  search: adminProcedure
    .route({ method: "GET" })
    .input(z.object({ q: z.string().min(1).max(100) }))
    .handler(async ({ input }) => {
      const query = `%${input.q}%`;

      // Search in parallel across all entities
      const [foods, categories, orders] = await Promise.all([
        // Search foods by name
        db.query.food.findMany({
          where: or(ilike(food.name, query), ilike(food.slug, query)),
          limit: 5,
          with: { category: { columns: { name: true } } },
        }),
        // Search categories by name
        db.query.category.findMany({
          where: or(ilike(category.name, query), ilike(category.slug, query)),
          limit: 5,
        }),
        // Search orders by ID
        db.query.order.findMany({
          where: ilike(order.id, query),
          limit: 5,
          with: {
            user: { columns: { name: true, email: true } },
          },
        }),
      ]);

      return {
        foods: foods.map((f) => ({
          id: f.id,
          name: f.name,
          slug: f.slug,
          image: f.image,
          category: f.category?.name,
          type: "food" as const,
        })),
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image,
          type: "category" as const,
        })),
        orders: orders.map((o) => ({
          id: o.id,
          status: o.status,
          totalAmount: o.totalAmount,
          userName: o.user?.name,
          type: "order" as const,
        })),
      };
    }),
};

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
