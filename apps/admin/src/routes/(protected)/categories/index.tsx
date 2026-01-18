import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { orpc } from "@/utils/orpc";

import { CategoryDialog } from "./-components/category-dialog";
import { CategoryList } from "./-components/category-list";

export const Route = createFileRoute("/(protected)/categories/")({
  component: CategoriesPage,
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).default(1),
  }),
});

interface CategoryFormValues {
  name: string;
  slug?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

function CategoriesPage() {
  const navigate = Route.useNavigate();
  const { page } = Route.useSearch();
  const [isOpen, setIsOpen] = useState(false);

  const categories = useQuery(
    orpc.categories.list.queryOptions({
      input: { page, limit: 12, includeInactive: true },
      placeholderData: keepPreviousData,
    }),
  );

  const createMutation = useMutation(
    orpc.categories.create.mutationOptions({
      onSuccess: () => {
        handleCloseDialog();
      },
      meta: {
        successMessage: "Category created successfully",
        invalidateQueries: [orpc.categories.list.key()],
      },
    }),
  );

  const handleCloseDialog = () => {
    setIsOpen(false);
  };

  const handleAddNew = () => {
    setIsOpen(true);
  };

  const handleSubmit = async (data: CategoryFormValues, reset: () => void) => {
    if (!data.image) {
      toast.error("Please select an image");
      return;
    }

    await createMutation.mutateAsync(data as Required<CategoryFormValues>);
    reset();
  };

  const handlePageChange = (newPage: number) => {
    void navigate({
      search: { page: newPage },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Manage your menu categories
            {categories.data && (
              <span className="ml-2 text-sm">
                ({categories.data.total} total)
              </span>
            )}
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Category Dialog - only for creating new */}
      <CategoryDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          else setIsOpen(open);
        }}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        isEditing={false}
      />

      {/* Category List */}
      <CategoryList
        categories={categories.data?.items}
        isLoading={categories.isLoading}
        onAddNew={handleAddNew}
        currentPage={page}
      />

      {/* Pagination */}
      {categories.data && (categories.data.totalPages ?? 0) > 1 && (
        <Pagination
          page={categories.data.page}
          totalPages={categories.data.totalPages ?? 0}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
