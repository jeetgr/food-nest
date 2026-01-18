import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  Package,
  MapPin,
  Clock,
  ChevronDown,
  Eye,
  RefreshCcw,
} from "lucide-react";
import z from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/(protected)/orders/")({
  component: OrdersPage,
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).default(1),
    status: z
      .enum([
        "all",
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ])
      .default("all"),
  }),
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({ to: "/sign-in", throw: true });
    }
    return { session };
  },
});

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  ready: "bg-cyan-100 text-cyan-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  all: "All Orders",
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusFlow = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];

const statusFilterItems = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function OrdersPage() {
  const navigate = Route.useNavigate();
  const { page, status } = Route.useSearch();
  const queryClient = useQueryClient();

  const orders = useQuery(
    orpc.orders.listAll.queryOptions({
      input: { page, limit: 10, status },
      placeholderData: keepPreviousData,
      refetchInterval: 10_000, // 10 seconds
    }),
  );

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      client.orders.updateStatus({ id, status: status as any }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpc.orders.listAll.key(),
      });
    },
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleStatusFilter = (value: string | null) => {
    void navigate({
      search: {
        status: (value || "all") as typeof status,
        page: 1,
      },
    });
  };

  const handlePageChange = (newPage: number) => {
    void navigate({
      search: { status, page: newPage },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders
            {orders.data && (
              <span className="ml-2">({orders.data.total} total)</span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            void queryClient.invalidateQueries({
              queryKey: orpc.orders.listAll.key(),
            });
          }}
          disabled={orders.isRefetching}
        >
          <RefreshCcw
            className={`h-4 w-4 ${orders.isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          items={statusFilterItems}
          value={status}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {statusFilterItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {orders.isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : orders.data?.items?.length ? (
        <div className="space-y-4">
          {orders.data.items.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${statusColors[order.status] || "bg-gray-100"} rounded-full border-none shadow-sm`}
                    >
                      {statusLabels[order.status] || order.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <Link
                          to="/orders/$orderId"
                          params={{ orderId: order.id }}
                        />
                      }
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    {order.status !== "delivered" &&
                      order.status !== "cancelled" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="outline" size="sm">
                              Update Status
                              <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {statusFlow.map((s) => (
                              <DropdownMenuItem
                                key={s}
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: order.id,
                                    status: s,
                                  })
                                }
                                disabled={order.status === s}
                              >
                                {statusLabels[s]}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: order.id,
                                  status: "cancelled",
                                })
                              }
                              className="text-destructive"
                            >
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Customer & Address */}
                  <div className="space-y-2">
                    <p className="font-medium">{order.user?.name}</p>
                    <div className="text-muted-foreground flex items-start gap-2 text-sm">
                      <MapPin className="mt-0.5 h-4 w-4" />
                      <div>
                        <p>{order.address?.street}</p>
                        <p>
                          {order.address?.city}, {order.address?.state}{" "}
                          {order.address?.postalCode}
                        </p>
                        <p>{order.address?.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    <p className="font-medium">Items</p>
                    <div className="space-y-1">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="text-muted-foreground h-4 w-4" />
                            <span>
                              {item.food?.name} × {item.quantity}
                            </span>
                          </div>
                          <span>₹{item.totalPrice}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span>Total</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="bg-muted mt-4 rounded-md p-3 text-sm">
                    <span className="font-medium">Notes: </span>
                    {order.notes}
                  </div>
                )}

                {/* Payment - only show if payment data exists */}
                {order.payment && (
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="rounded-full">
                      {order.payment.method?.toUpperCase() || "N/A"}
                    </Badge>
                    <span className="text-muted-foreground">
                      Payment: {order.payment.status || "N/A"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">
              No orders found
              {status !== "all" && ` with status "${statusLabels[status]}"`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {orders.data && (orders.data.totalPages ?? 0) > 1 && (
        <Pagination
          page={orders.data.page}
          totalPages={orders.data.totalPages ?? 0}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
