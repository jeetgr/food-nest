import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar";

export function AdminLayout() {
  const collapsed = useSidebarStore((s) => s.collapsed);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "lg:ml-16" : "lg:ml-64",
        )}
      >
        {/* Top navigation */}
        <TopNav />

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
