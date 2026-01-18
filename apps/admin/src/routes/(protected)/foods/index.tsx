import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orpc } from "@/utils/orpc";

import { FoodDialog } from "./-components/food-dialog";
import { FoodList } from "./-components/food-list";

export const Route = createFileRoute("/(protected)/foods/")({
  component: FoodsPage,
  validateSearch: z.object({
    categoryId: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
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

function FoodsPage() {
  const navigate = Route.useNavigate();
  const { categoryId = "all", page } = Route.useSearch();
  const [isOpen, setIsOpen] = useState(false);

  // All categories for dropdown (no pagination)
  const categories = useQuery(
    orpc.categories.list.queryOptions({
      input: { all: true },
    }),
  );

  // Paginated foods
  const foods = useQuery(
    orpc.foods.list.queryOptions({
      input: {
        categoryId: categoryId === "all" ? undefined : categoryId,
        onlyAvailable: false,
        page,
        limit: 12,
      },
      placeholderData: keepPreviousData,
    }),
  );

  // Build category items for select
  const categoryItems = useMemo(() => {
    const items = [{ label: "All Categories", value: "all" }];
    if (categories.data?.items) {
      items.push(
        ...categories.data.items.map((cat) => ({
          label: cat.name,
          value: cat.id,
        })),
      );
    }
    return items;
  }, [categories.data]);

  const createMutation = useMutation(
    orpc.foods.create.mutationOptions({
      onSuccess: () => {
        handleCloseDialog();
      },
      meta: {
        successMessage: "Food created successfully",
        invalidateQueries: [orpc.foods.list.key()],
      },
    }),
  );

  const toggleMutation = useMutation(
    orpc.foods.toggleAvailability.mutationOptions({
      meta: {
        invalidateQueries: [orpc.foods.list.key()],
      },
    }),
  );

  const handleCloseDialog = () => {
    setIsOpen(false);
  };

  const handleAddNew = () => {
    setIsOpen(true);
  };

  const handleSubmit = async (data: FoodFormValues, reset: () => void) => {
    if (!data.image) {
      toast.error("Please select an image");
      return;
    }
    await createMutation.mutateAsync(data);
    reset();
  };

  const handleCategoryFilter = (value: string | null) => {
    void navigate({
      search: {
        categoryId: value === "all" || !value ? undefined : value,
        page: 1,
      },
    });
  };

  const handlePageChange = (newPage: number) => {
    void navigate({
      search: {
        categoryId: categoryId === "all" ? undefined : categoryId,
        page: newPage,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Foods</h1>
          <p className="text-muted-foreground">
            Manage your menu items
            {foods.data && (
              <span className="ml-2">({foods.data.total} items)</span>
            )}
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Food
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-4">
        <Select
          items={categoryItems}
          value={categoryId}
          onValueChange={handleCategoryFilter}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {categoryItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Food Dialog - only for creating */}
      <FoodDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          else setIsOpen(open);
        }}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        isEditing={false}
      />

      {/* Food List */}
      <FoodList
        foods={foods.data?.items}
        isLoading={foods.isLoading}
        onToggleAvailability={(id) => toggleMutation.mutate({ id })}
        onAddNew={handleAddNew}
        isToggling={toggleMutation.isPending}
        currentPage={page}
        categoryId={categoryId === "all" ? undefined : categoryId}
      />

      {/* Pagination */}
      {foods.data && foods.data.totalPages > 1 && (
        <Pagination
          page={foods.data.page}
          totalPages={foods.data.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
