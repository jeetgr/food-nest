import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "../index";
import { addressesRouter } from "./addresses";
import { cartRouter } from "./cart";
import { categoriesRouter } from "./categories";
import { dashboardRouter } from "./dashboard";
import { foodsRouter } from "./foods";
import { ordersRouter } from "./orders";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    console.log("Health check");
    return "OK";
  }),

  // Domain routers
  dashboard: dashboardRouter,
  cart: cartRouter,
  categories: categoriesRouter,
  foods: foodsRouter,
  addresses: addressesRouter,
  orders: ordersRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
