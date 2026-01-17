import { authClient } from "@/lib/auth-client";
import { AdminLayout } from "@/components/admin-layout";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)")({
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
      return { session: session.data };
    } else {
      throw redirect({ to: "/sign-in" });
    }
  },
  component: AdminLayout,
});
