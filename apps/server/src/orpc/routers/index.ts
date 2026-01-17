import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "../index";
import { addressesRouter } from "./addresses";
import { categoriesRouter } from "./categories";
import { foodsRouter } from "./foods";
import { ordersRouter } from "./orders";

export const appRouter = {
  healthCheck: publicProcedure.route({ method: "GET" }).handler(() => {
    return "OK";
  }),

  // Domain routers
  categories: categoriesRouter,
  foods: foodsRouter,
  addresses: addressesRouter,
  orders: ordersRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
