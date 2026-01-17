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
import { Logo } from "./ui/logo";
import { Button } from "./ui/button";
import { useSidebarStore } from "@/stores/sidebar";

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
          "fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={closeMobile}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border",
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
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {(!collapsed || mobileOpen) && (
            <div className="flex items-center gap-2">
              <Logo className="size-8" />
              <span className="font-bold text-lg">FoodNest</span>
            </div>
          )}
          {collapsed && !mobileOpen && (
            <div className="p-1.5 bg-orange-500 rounded-lg mx-auto">
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
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
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
                <Icon className="w-5 h-5 shrink-0" />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button - desktop only */}
        <div className="absolute bottom-4 left-0 right-0 px-3 hidden lg:block">
          <button
            onClick={toggle}
            className="flex items-center justify-center w-full py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 mr-2" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
