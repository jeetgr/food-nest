import { Link } from "@tanstack/react-router";
import { Package, FolderOpen, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

import type { Food } from "./types";

interface FoodListProps {
  foods: Food[] | undefined;
  isLoading: boolean;
  onToggleAvailability: (id: string) => void;
  onAddNew: () => void;
  isToggling: boolean;
  currentPage: number;
  categoryId?: string;
}

export function FoodList({
  foods,
  isLoading,
  onToggleAvailability,
  onAddNew,
  isToggling,
  currentPage,
  categoryId,
}: FoodListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (!foods || foods.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <FolderOpen className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">No food items yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-center text-sm">
            Add your first food item to the menu
          </p>
          <Button onClick={onAddNew} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Food
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Food list
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {foods.map((food) => (
        <Link
          key={food.id}
          to="/foods/$foodId"
          params={{ foodId: food.id }}
          search={{ from: currentPage, categoryId }}
          className="group block"
        >
          <Card className="hover:border-primary/50 h-full overflow-hidden pt-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="relative">
              <ImageWithFallback
                src={food.image}
                alt={food.name}
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                fallback={
                  <div className="from-muted to-muted/50 flex aspect-square w-full items-center justify-center bg-gradient-to-br">
                    <Package className="text-muted-foreground/50 h-12 w-12" />
                  </div>
                }
              />

              {/* Price badge */}
              <Badge className="bg-background/80 text-foreground hover:bg-background/90 absolute top-3 left-3 rounded-full border-none px-3 shadow-sm backdrop-blur-md">
                ₹{food.price}
              </Badge>

              {/* Status badges */}
              <div className="absolute top-3 right-3 flex flex-col gap-1">
                {!food.isAvailable && (
                  <Badge
                    variant="destructive"
                    className="rounded-full shadow-sm"
                  >
                    Unavailable
                  </Badge>
                )}
                {food.stock === 0 && (
                  <Badge
                    variant="destructive"
                    className="rounded-full shadow-sm"
                  >
                    Out of Stock
                  </Badge>
                )}
              </div>

              {/* Hover overlay */}
            </div>

            <CardContent className="p-4">
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="group-hover:text-primary truncate font-semibold transition-colors">
                    {food.name}
                  </h3>
                  <p className="text-muted-foreground truncate text-sm">
                    {food.category?.name}
                  </p>
                </div>
                <span className="text-muted-foreground group-hover:text-primary text-sm whitespace-nowrap transition-colors group-hover:underline">
                  View →
                </span>
              </div>

              {food.description && (
                <p className="text-muted-foreground mt-2 truncate text-sm">
                  {food.description}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between">
                <Badge
                  variant={food.stock > 0 ? "secondary" : "destructive"}
                  className="rounded-full font-medium"
                >
                  {food.stock > 0 ? `${food.stock} in stock` : "Out of stock"}
                </Badge>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleAvailability(food.id);
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="text-muted-foreground text-xs font-medium">
                    {food.isAvailable ? "Active" : "Inactive"}
                  </span>
                  <Switch checked={food.isAvailable} disabled={isToggling} />
                </button>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
