import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Package, MapPin, Clock, ChevronDown } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { orpc, client } from "@/utils/orpc";

export const Route = createFileRoute("/(protected)/orders/$orderId")({
  component: OrderDetailPage,
  validateSearch: z.object({
    from: z.coerce.number().optional(),
  }),
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

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const queryClient = useQueryClient();
  const { from } = Route.useSearch();
  const navigate = Route.useNavigate();

  const order = useQuery(
    orpc.orders.getById.queryOptions({ input: { id: orderId } }),
  );

  const updateStatusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) =>
      client.orders.updateStatus({ id: orderId, status: status as any }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpc.orders.getById.key({ input: { id: orderId } }),
      });
      void queryClient.invalidateQueries({
        queryKey: orpc.orders.listAll.key(),
      });
    },
  });

  const goBack = () => {
    void navigate({
      to: "/orders",
      search: { page: from || 1 },
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
    });
  };

  if (order.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order.data) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={goBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">
            Order not found
          </CardContent>
        </Card>
      </div>
    );
  }

  const item = order.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Order #{item.id.slice(-8).toUpperCase()}
            </h1>
            <div className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatDate(item.createdAt)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[item.status] || "bg-gray-100"}>
            {statusLabels[item.status] || item.status}
          </Badge>
          {item.status !== "delivered" && item.status !== "cancelled" && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline">
                  Update Status
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {statusFlow.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => updateStatusMutation.mutate({ status })}
                    disabled={item.status === status}
                  >
                    {statusLabels[status]}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  onClick={() =>
                    updateStatusMutation.mutate({ status: "cancelled" })
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

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer & Address */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-lg font-medium">{item.user?.name}</p>
              <p className="text-muted-foreground text-sm">
                {item.user?.email}
              </p>
            </div>
            <div className="flex items-start gap-2 border-t pt-4">
              <MapPin className="text-muted-foreground mt-1 h-4 w-4" />
              <div>
                <p className="font-medium">{item.address?.label}</p>
                <p className="text-muted-foreground text-sm">
                  {item.address?.street}
                </p>
                <p className="text-muted-foreground text-sm">
                  {item.address?.city}, {item.address?.state}{" "}
                  {item.address?.postalCode}
                </p>
                <p className="mt-1 text-sm font-medium">
                  {item.address?.phone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Method</span>
              <Badge variant="outline">
                {item.payment?.method?.toUpperCase() || "N/A"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant={
                  item.payment?.status === "completed" ? "default" : "secondary"
                }
              >
                {item.payment?.status || "N/A"}
              </Badge>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-lg font-medium">Total</span>
              <span className="text-2xl font-bold">₹{item.totalAmount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {item.items?.map((orderItem) => (
              <div
                key={orderItem.id}
                className="bg-muted/50 flex items-center justify-between rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  {orderItem.food?.image ? (
                    <img
                      src={orderItem.food.image}
                      alt={orderItem.food?.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <Package className="bg-muted h-12 w-12 rounded p-2" />
                  )}
                  <div>
                    <p className="font-medium">{orderItem.food?.name}</p>
                    <p className="text-muted-foreground text-sm">
                      ₹{orderItem.unitPrice} × {orderItem.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-bold">₹{orderItem.totalPrice}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {item.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Order Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{item.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
