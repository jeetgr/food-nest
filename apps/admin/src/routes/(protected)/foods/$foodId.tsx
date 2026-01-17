import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit2, Package } from "lucide-react";
import { useState } from "react";
import z from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { orpc } from "@/utils/orpc";

import { FoodDialog } from "./-components/food-dialog";

export const Route = createFileRoute("/(protected)/foods/$foodId")({
  component: FoodDetailPage,
  validateSearch: z.object({
    from: z.coerce.number().optional(),
    categoryId: z.string().optional(),
  }),
});

interface FoodFormValues {
  name: string;
  slug?: string;
  description?: string;
  price: string;
  image: string;
  categoryId: string;
  stock: number;
  isAvailable: boolean;
}

function FoodDetailPage() {
  const { foodId } = Route.useParams();
  const { from, categoryId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const food = useQuery(
    orpc.foods.getById.queryOptions({ input: { id: foodId } }),
  );

  const updateMutation = useMutation(
    orpc.foods.update.mutationOptions({
      onSuccess: () => {
        setIsEditing(false);
        queryClient.invalidateQueries({
          queryKey: orpc.foods.getById.key({ input: { id: foodId } }),
        });
      },
      meta: {
        successMessage: "Food updated successfully",
        invalidateQueries: [orpc.foods.list.key()],
      },
    }),
  );

  const toggleMutation = useMutation(
    orpc.foods.toggleAvailability.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.foods.getById.key({ input: { id: foodId } }),
        });
      },
      meta: {
        invalidateQueries: [orpc.foods.list.key()],
      },
    }),
  );

  const goBack = () => {
    navigate({
      to: "/foods",
      search: { page: from || 1, categoryId },
    });
  };

  const handleSubmit = async (data: FoodFormValues, reset: () => void) => {
    await updateMutation.mutateAsync({ id: foodId, data });
    reset();
  };

  if (food.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="aspect-square w-full max-w-md" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!food.data) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={goBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Foods
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Food not found
          </CardContent>
        </Card>
      </div>
    );
  }

  const item = food.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{item.name}</h1>
            <p className="text-muted-foreground">/{item.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant={item.isAvailable ? "destructive" : "default"}
            onClick={() => toggleMutation.mutate({ id: foodId })}
            disabled={toggleMutation.isPending}
          >
            {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <FoodDialog
        open={isEditing}
        onOpenChange={(open) => !open && setIsEditing(false)}
        initialValues={{
          name: item.name,
          slug: item.slug,
          description: item.description || "",
          price: item.price,
          image: item.image,
          categoryId: item.categoryId,
          stock: item.stock,
          isAvailable: item.isAvailable,
        }}
        imagePreview={item.image}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        isEditing
      />

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Image */}
        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            <ImageWithFallback
              src={item.image}
              alt={item.name}
              className="w-full aspect-square object-cover"
              fallback={
                <div className="w-full aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground/50" />
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Price</span>
              <span className="text-2xl font-bold">₹{item.price}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Category</span>
              <Badge variant="secondary">{item.category?.name}</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Stock</span>
              <span className="font-medium">{item.stock} units</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Availability</span>
              <Badge variant={item.isAvailable ? "default" : "destructive"}>
                {item.isAvailable ? "Available" : "Unavailable"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">
                {new Date(item.createdAt).toLocaleDateString("en-IN", {
                  dateStyle: "medium",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium">
                {new Date(item.updatedAt).toLocaleDateString("en-IN", {
                  dateStyle: "medium",
                })}
              </span>
            </div>
            {item.description && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Description
                </p>
                <p>{item.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Link */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">View Category</p>
              <p className="text-sm text-muted-foreground">
                Manage {item.category?.name} category
              </p>
            </div>
            <Button
              variant="outline"
              render={
                <Link
                  to="/categories/$categoryId"
                  params={{ categoryId: item.categoryId }}
                />
              }
            >
              Go to Category
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
