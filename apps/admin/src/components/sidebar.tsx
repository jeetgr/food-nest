import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar";

import { Button } from "./ui/button";
import { Logo } from "./ui/logo";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/categories", label: "Categories", icon: UtensilsCrossed },
  { to: "/foods", label: "Foods", icon: Package },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
] as const;

export function Sidebar() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const collapsed = useSidebarStore((s) => s.collapsed);
  const mobileOpen = useSidebarStore((s) => s.mobileOpen);
  const toggle = useSidebarStore((s) => s.toggle);
  const closeMobile = useSidebarStore((s) => s.closeMobile);

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onPointerDown={closeMobile}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar border-sidebar-border fixed top-0 left-0 z-50 h-screen border-r",
          // Smooth transition for slide and width changes
          "transition-[width,transform] duration-300 ease-in-out",
          // Desktop: show based on collapsed state
          collapsed ? "lg:w-16" : "lg:w-64",
          // Mobile: slide in/out from left
          "w-64 -translate-x-full lg:translate-x-0",
          mobileOpen && "translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="border-sidebar-border flex h-16 items-center justify-between border-b px-4">
          {(!collapsed || mobileOpen) && (
            <div className="flex items-center gap-2">
              <Logo className="size-8" />
              <span className="text-lg font-bold">FoodNest</span>
            </div>
          )}
          {collapsed && !mobileOpen && (
            <div className="mx-auto rounded-lg bg-orange-500 p-1.5">
              <Logo className="size-8" />
            </div>
          )}

          {/* Mobile close button */}
          {mobileOpen && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={closeMobile}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.to || currentPath.startsWith(`${item.to}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMobile}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button - desktop only */}
        <div className="absolute right-0 bottom-4 left-0 hidden px-3 lg:block">
          <button
            type="button"
            onClick={toggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent/50 flex w-full items-center justify-center rounded-lg py-2 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="mr-2 h-5 w-5" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
