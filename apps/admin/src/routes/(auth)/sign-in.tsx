import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";

export const Route = createFileRoute("/(auth)/sign-in")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await authClient.signIn.email(
          {
            email: value.email,
            password: value.password,
          },
          {
            onSuccess: ({ data }) => {
              if (
                "user" in data &&
                typeof data.user === "object" &&
                "role" in data.user &&
                typeof data.user.role === "string" &&
                data.user.role === "admin"
              ) {
                navigate({ to: "/dashboard" });
                toast.success("Welcome back!");
              } else {
                toast.error("You are not authorized to access this page");
              }
            },
            onError: (error) => {
              toast.error(error.error.message || "Sign in failed");
            },
          },
        );
      } catch (error) {
        console.log(error);
        toast.error("Sign in failed");
      }
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-12 text-white">
        <div className="flex items-center gap-3">
          <Logo className="size-8" />
          <span className="text-2xl font-bold">FoodNest Admin</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-5xl font-bold leading-tight">
            Admin
            <br />
            Dashboard
          </h1>
          <p className="text-white/70 text-lg max-w-md">
            Manage categories, foods, and orders. Monitor your restaurant
            operations in real-time.
          </p>
        </div>

        <div className="space-y-4 text-white/60 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span>Real-time order tracking</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span>Inventory management</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span>Menu customization</span>
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 bg-linear-to-br from-orange-500 to-red-500 rounded-xl">
              <Logo className="size-8" />
            </div>
            <span className="text-xl font-bold">FoodNest Admin</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to your admin account
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="admin@foodnest.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="h-12"
                  />
                  {field.state.meta.errors.map((error) => (
                    <p
                      key={error?.message}
                      className="text-sm text-destructive"
                    >
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Password</Label>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {field.state.meta.errors.map((error) => (
                    <p
                      key={error?.message}
                      className="text-sm text-destructive"
                    >
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  {state.isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </div>
      </div>
    </div>
  );
}
