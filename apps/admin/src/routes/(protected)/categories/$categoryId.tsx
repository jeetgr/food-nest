import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit2, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import z from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";

import { CategoryDialog } from "./-components/category-dialog";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

export const Route = createFileRoute("/(protected)/categories/$categoryId")({
  component: CategoryDetailPage,
  validateSearch: z.object({
    from: z.coerce.number().optional(),
  }),
});

interface CategoryFormValues {
  name: string;
  slug?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

function CategoryDetailPage() {
  const { categoryId } = Route.useParams();
  const { from } = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const category = useQuery(
    orpc.categories.getById.queryOptions({ input: { id: categoryId } }),
  );

  const updateMutation = useMutation(
    orpc.categories.update.mutationOptions({
      onSuccess: () => {
        setIsEditing(false);
        queryClient.invalidateQueries({
          queryKey: orpc.categories.getById.key({ input: { id: categoryId } }),
        });
      },
      meta: {
        successMessage: "Category updated successfully",
        invalidateQueries: [orpc.categories.list.key()],
      },
    }),
  );

  const goBack = () => {
    navigate({
      to: "/categories",
      search: { page: from || 1 },
    });
  };

  const handleSubmit = async (data: CategoryFormValues, reset: () => void) => {
    await updateMutation.mutateAsync({ id: categoryId, data });
    reset();
  };

  if (category.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!category.data) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={goBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Categories
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Category not found
          </CardContent>
        </Card>
      </div>
    );
  }

  const item = category.data;

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
            variant={item.isActive ? "destructive" : "default"}
            onClick={() => {
              updateMutation.mutate({
                id: categoryId,
                data: { ...item, isActive: !item.isActive },
              });
            }}
            disabled={updateMutation.isPending}
          >
            {item.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <CategoryDialog
        open={isEditing}
        onOpenChange={(open) => !open && setIsEditing(false)}
        initialValues={{
          name: item.name,
          slug: item.slug,
          image: item.image,
          isActive: item.isActive,
          sortOrder: item.sortOrder,
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
                <div className="w-full aspect-square bg-muted flex items-center justify-center">
                  <UtensilsCrossed className="w-16 h-16 text-muted-foreground" />
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
              <span className="text-muted-foreground">Status</span>
              <Badge variant={item.isActive ? "default" : "secondary"}>
                {item.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Sort Order</span>
              <span className="font-medium">{item.sortOrder}</span>
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
          </CardContent>
        </Card>
      </div>

      {/* Quick Link */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">View Foods in this Category</p>
              <p className="text-sm text-muted-foreground">
                See all food items under {item.name}
              </p>
            </div>
            <Button
              variant="outline"
              render={
                <Link to="/foods" search={{ categoryId: item.id, page: 1 }} />
              }
            >
              View Foods
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
