import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";
import z from "zod";

export const o = os.$context<Context>().errors({
  INPUT_VALIDATION_FAILED: {
    status: 422,
    data: z.object({
      formErrors: z.array(z.string()),
      fieldErrors: z.record(z.string(), z.array(z.string()).optional()),
    }),
  },
});

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

export const adminProcedure = protectedProcedure.use(
  async ({ context, next }) => {
    const user = context.session.user;

    if (user.role !== "admin") {
      throw new ORPCError("FORBIDDEN", { message: "Admin access required" });
    }

    return next({ context });
  },
);
