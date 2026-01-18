import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Search,
  Menu,
  Package,
  UtensilsCrossed,
  ShoppingCart,
  X,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { useSidebarStore } from "@/stores/sidebar";
import { orpc } from "@/utils/orpc";

import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import UserMenu from "./user-menu";

export function TopNav() {
  const openMobile = useSidebarStore((s) => s.openMobile);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search query - only runs when debounced query has value
  const searchResults = useQuery({
    ...orpc.dashboard.search.queryOptions({ input: { q: debouncedQuery } }),
    enabled: debouncedQuery.length >= 1,
  });

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (type: string, id: string) => {
    setSearchQuery("");
    setIsOpen(false);

    if (type === "food") {
      void navigate({ to: "/foods/$foodId", params: { foodId: id } });
    } else if (type === "category") {
      void navigate({
        to: "/categories/$categoryId",
        params: { categoryId: id },
      });
    } else if (type === "order") {
      void navigate({ to: "/orders/$orderId", params: { orderId: id } });
    }
  };

  const hasResults =
    searchResults.data &&
    (searchResults.data.foods.length > 0 ||
      searchResults.data.categories.length > 0 ||
      searchResults.data.orders.length > 0);

  return (
    <header className="bg-background sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={openMobile}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="hidden items-center md:flex" ref={searchRef}>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search foods, categories, orders..."
              className="h-9 w-80 pr-8 pl-9"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsOpen(false);
                }}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Search Results Dropdown */}
            {isOpen && searchQuery && (
              <div className="bg-popover absolute top-full right-0 left-0 z-50 mt-1 max-h-96 overflow-auto rounded-md border shadow-lg">
                {searchResults.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
                  </div>
                ) : hasResults ? (
                  <div className="py-1">
                    {/* Foods */}
                    {searchResults.data?.foods.length ? (
                      <div>
                        <div className="text-muted-foreground px-3 py-2 text-xs font-medium uppercase">
                          Foods
                        </div>
                        {searchResults.data.foods.map((item) => (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => handleSelect("food", item.id)}
                            className="hover:bg-accent flex w-full items-center gap-3 px-3 py-2 text-left"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-8 w-8 rounded object-cover"
                              />
                            ) : (
                              <Package className="bg-muted h-8 w-8 rounded p-1.5" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-muted-foreground text-xs">
                                {item.category}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {/* Categories */}
                    {searchResults.data?.categories.length ? (
                      <div>
                        <div className="text-muted-foreground px-3 py-2 text-xs font-medium uppercase">
                          Categories
                        </div>
                        {searchResults.data.categories.map((item) => (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => handleSelect("category", item.id)}
                            className="hover:bg-accent flex w-full items-center gap-3 px-3 py-2 text-left"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-8 w-8 rounded object-cover"
                              />
                            ) : (
                              <UtensilsCrossed className="bg-muted h-8 w-8 rounded p-1.5" />
                            )}
                            <p className="text-sm font-medium">{item.name}</p>
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {/* Orders */}
                    {searchResults.data?.orders.length ? (
                      <div>
                        <div className="text-muted-foreground px-3 py-2 text-xs font-medium uppercase">
                          Orders
                        </div>
                        {searchResults.data.orders.map((item) => (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => handleSelect("order", item.id)}
                            className="hover:bg-accent flex w-full items-center gap-3 px-3 py-2 text-left"
                          >
                            <ShoppingCart className="bg-muted h-8 w-8 rounded p-1.5" />
                            <div>
                              <p className="text-sm font-medium">
                                #{item.id.slice(-8).toUpperCase()}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {item.userName} • ₹{item.totalAmount}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-muted-foreground py-8 text-center text-sm">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <ModeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
