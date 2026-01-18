import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  ShoppingCart,
  UtensilsCrossed,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/(protected)/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const stats = useQuery(orpc.dashboard.stats.queryOptions());
  const recentOrders = useQuery(orpc.dashboard.recentOrders.queryOptions());
  const ordersByStatus = useQuery(orpc.dashboard.ordersByStatus.queryOptions());

  const statCards = [
    {
      title: "Total Orders",
      value: stats.data?.orders ?? 0,
      icon: ShoppingCart,
      change: stats.data?.ordersChange ?? 0,
      href: "/orders",
    },
    {
      title: "Categories",
      value: stats.data?.categories ?? 0,
      icon: UtensilsCrossed,
      change: null,
      href: "/categories",
    },
    {
      title: "Food Items",
      value: stats.data?.foods ?? 0,
      icon: Package,
      change: null,
      href: "/foods",
    },
    {
      title: "Revenue",
      value: `₹${(stats.data?.revenue ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      change: stats.data?.revenueChange ?? 0,
      href: "/orders",
    },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    preparing: "bg-orange-500",
    ready: "bg-purple-500",
    out_for_delivery: "bg-indigo-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready: "Ready",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to FoodNest Admin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change !== null && stat.change >= 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;

          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                {stats.isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.change !== null && (
                      <p
                        className={cn(
                          "mt-1 flex items-center gap-1 text-xs",
                          isPositive ? "text-green-600" : "text-red-600",
                        )}
                      >
                        <TrendIcon className="h-3 w-3" />
                        {isPositive ? "+" : ""}
                        {stat.change}% from last month
                      </p>
                    )}
                  </>
                )}
              </CardContent>
              <Link
                to={stat.href}
                className="absolute inset-0 z-10"
                aria-label={`View ${stat.title}`}
              />
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Orders by Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersByStatus.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : ordersByStatus.data?.length ? (
              <div className="space-y-3">
                {ordersByStatus.data.map((item) => {
                  const total =
                    ordersByStatus.data?.reduce((sum, i) => sum + i.count, 0) ||
                    1;
                  const percentage = Math.round((item.count / total) * 100);

                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              statusColors[item.status],
                            )}
                          />
                          {statusLabels[item.status] || item.status}
                        </span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                      <div className="bg-muted h-2 overflow-hidden rounded-full">
                        <div
                          className={cn(
                            "h-full transition-all",
                            statusColors[item.status],
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center text-sm">
                No orders yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" render={<Link to="/orders" />}>
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentOrders.data?.length ? (
              <div className="space-y-3">
                {recentOrders.data.map((order) => (
                  <div
                    key={order.id}
                    className="bg-muted/50 flex items-center justify-between rounded-lg p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {order.user?.name || "Guest"}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ₹{parseFloat(order.totalAmount).toLocaleString()}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs",
                          statusColors[order.status],
                          "text-white",
                        )}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center text-sm">
                No orders yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Foods */}
      <TopSellingFoods />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" render={<Link to="/categories" />}>
            <UtensilsCrossed className="mr-2 h-4 w-4" />
            Manage Categories
          </Button>
          <Button variant="outline" render={<Link to="/foods" />}>
            <Package className="mr-2 h-4 w-4" />
            Manage Foods
          </Button>
          <Button variant="outline" render={<Link to="/orders" />}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            View Orders
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function TopSellingFoods() {
  const topFoods = useQuery(orpc.dashboard.topSellingFoods.queryOptions());

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Selling Foods</CardTitle>
        <Button variant="ghost" size="sm" render={<Link to="/foods" />}>
          View all <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {topFoods.isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : topFoods.data?.length ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {topFoods.data.map((food) => (
              <div
                key={food?.id}
                className="bg-muted/50 flex flex-col rounded-lg p-3"
              >
                {food?.image && (
                  <img
                    src={food.image}
                    alt={food.name}
                    className="mb-2 h-16 w-full rounded object-cover"
                  />
                )}
                <p className="truncate text-sm font-medium">{food?.name}</p>
                <p className="text-muted-foreground text-xs">
                  {food?.category?.name}
                </p>
                <div className="mt-auto flex justify-between pt-2 text-xs">
                  <span className="font-medium text-green-600">
                    {food.totalSold} sold
                  </span>
                  <span className="font-medium">
                    ₹{food.totalRevenue?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No sales data yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
