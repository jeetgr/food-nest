import { Link } from "@tanstack/react-router";
import { FolderOpen, Plus, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
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
            <div className="p-4 space-y-2">
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
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No categories yet</h3>
          <p className="text-muted-foreground text-sm mb-6 text-center max-w-sm">
            Create your first category to organize your menu items
          </p>
          <Button onClick={onAddNew} size="lg">
            <Plus className="w-4 h-4 mr-2" />
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
          <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 pt-0">
            <div className="relative">
              <ImageWithFallback
                src={category.image}
                alt={category.name}
                className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                fallback={
                  <div className="w-full aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <UtensilsCrossed className="w-12 h-12 text-muted-foreground/50" />
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
                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    /{category.slug}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-primary group-hover:underline transition-colors whitespace-nowrap">
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
