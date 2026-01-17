import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)")({
  beforeLoad: async () => {
    const session = await authClient.getSession().catch(() => ({
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get session",
      },
    }));

    if (
      session.data &&
      "role" in session.data.user &&
      session.data.user.role === "admin"
    ) {
      throw redirect({ to: "/dashboard" });
    }
  },
});
