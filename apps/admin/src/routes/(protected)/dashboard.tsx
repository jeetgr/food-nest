import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  ShoppingCart,
  UtensilsCrossed,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
} from "lucide-react";
import { orpc } from "@/utils/orpc";
import { cn } from "@/lib/utils";

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
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
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
                          "text-xs flex items-center gap-1 mt-1",
                          isPositive ? "text-green-600" : "text-red-600",
                        )}
                      >
                        <TrendIcon className="w-3 h-3" />
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
                              "w-2 h-2 rounded-full",
                              statusColors[item.status],
                            )}
                          />
                          {statusLabels[item.status] || item.status}
                        </span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
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
              <p className="text-sm text-muted-foreground text-center py-4">
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
              View all <ArrowRight className="w-4 h-4 ml-1" />
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
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {order.user?.name || "Guest"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ₹{parseFloat(order.totalAmount).toLocaleString()}
                      </p>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
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
              <p className="text-sm text-muted-foreground text-center py-4">
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
            <UtensilsCrossed className="w-4 h-4 mr-2" />
            Manage Categories
          </Button>
          <Button variant="outline" render={<Link to="/foods" />}>
            <Package className="w-4 h-4 mr-2" />
            Manage Foods
          </Button>
          <Button variant="outline" render={<Link to="/orders" />}>
            <ShoppingCart className="w-4 h-4 mr-2" />
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
          View all <ArrowRight className="w-4 h-4 ml-1" />
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
                className="flex flex-col p-3 bg-muted/50 rounded-lg"
              >
                {food?.image && (
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-16 object-cover rounded mb-2"
                  />
                )}
                <p className="text-sm font-medium truncate">{food?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {food?.category?.name}
                </p>
                <div className="mt-auto pt-2 flex justify-between text-xs">
                  <span className="text-green-600 font-medium">
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
          <p className="text-sm text-muted-foreground text-center py-4">
            No sales data yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
