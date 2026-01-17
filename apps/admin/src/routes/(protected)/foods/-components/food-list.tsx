import { Link } from "@tanstack/react-router";
import { Package, FolderOpen, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
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
            <div className="p-4 space-y-2">
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
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No food items yet</h3>
          <p className="text-muted-foreground text-sm mb-6 text-center max-w-sm">
            Add your first food item to the menu
          </p>
          <Button onClick={onAddNew} size="lg">
            <Plus className="w-4 h-4 mr-2" />
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
          <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 pt-0">
            <div className="relative">
              <ImageWithFallback
                src={food.image}
                alt={food.name}
                className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                fallback={
                  <div className="w-full aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                }
              />

              {/* Price badge */}
              <Badge className="absolute top-3 left-3 rounded-full bg-background/80 backdrop-blur-md text-foreground shadow-sm hover:bg-background/90 px-3 border-none">
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
                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                    {food.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {food.category?.name}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-primary group-hover:underline transition-colors whitespace-nowrap">
                  View →
                </span>
              </div>

              {food.description && (
                <p className="text-sm text-muted-foreground mt-2 truncate">
                  {food.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-3">
                <Badge
                  variant={food.stock > 0 ? "secondary" : "destructive"}
                  className="rounded-full font-medium"
                >
                  {food.stock > 0 ? `${food.stock} in stock` : "Out of stock"}
                </Badge>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleAvailability(food.id);
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="text-xs text-muted-foreground font-medium">
                    {food.isAvailable ? "Active" : "Inactive"}
                  </span>
                  <Switch checked={food.isAvailable} disabled={isToggling} />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
