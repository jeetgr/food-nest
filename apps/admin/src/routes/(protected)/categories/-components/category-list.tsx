import { Link } from "@tanstack/react-router";
import { FolderOpen, Plus, UtensilsCrossed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Skeleton } from "@/components/ui/skeleton";

import type { Category } from "./types";

interface CategoryListProps {
  categories: Category[] | undefined;
  isLoading: boolean;
  onAddNew: () => void;
  currentPage: number;
}

export function CategoryList({
  categories,
  isLoading,
  onAddNew,
  currentPage,
}: CategoryListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <FolderOpen className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">No categories yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-center text-sm">
            Create your first category to organize your menu items
          </p>
          <Button onClick={onAddNew} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Categories grid
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to="/categories/$categoryId"
          params={{ categoryId: category.id }}
          search={{ from: currentPage }}
          className="group block"
        >
          <Card className="hover:border-primary/50 h-full overflow-hidden pt-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="relative">
              <ImageWithFallback
                src={category.image}
                alt={category.name}
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                fallback={
                  <div className="from-muted to-muted/50 flex aspect-square w-full items-center justify-center bg-gradient-to-br">
                    <UtensilsCrossed className="text-muted-foreground/50 h-12 w-12" />
                  </div>
                }
              />

              {/* Status badge */}
              {!category.isActive && (
                <Badge
                  variant="destructive"
                  className="absolute top-3 right-3 rounded-full shadow-sm"
                >
                  Inactive
                </Badge>
              )}
            </div>

            <CardContent>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="group-hover:text-primary truncate font-semibold transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground truncate text-sm">
                    /{category.slug}
                  </p>
                </div>
                <span className="text-muted-foreground group-hover:text-primary text-sm whitespace-nowrap transition-colors group-hover:underline">
                  View →
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
