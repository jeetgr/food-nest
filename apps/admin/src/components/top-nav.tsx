import { useState, useRef, useEffect } from "react";
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
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useSidebarStore } from "@/stores/sidebar";
import { orpc } from "@/utils/orpc";

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
      navigate({ to: "/foods/$foodId", params: { foodId: id } });
    } else if (type === "category") {
      navigate({ to: "/categories/$categoryId", params: { categoryId: id } });
    } else if (type === "order") {
      navigate({ to: "/orders/$orderId", params: { orderId: id } });
    }
  };

  const hasResults =
    searchResults.data &&
    (searchResults.data.foods.length > 0 ||
      searchResults.data.categories.length > 0 ||
      searchResults.data.orders.length > 0);

  return (
    <header className="sticky top-0 z-30 h-16 bg-background border-b flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={openMobile}
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search */}
        <div className="hidden md:flex items-center" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search foods, categories, orders..."
              className="w-80 pl-9 pr-8 h-9"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Search Results Dropdown */}
            {isOpen && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-96 overflow-auto z-50">
                {searchResults.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : hasResults ? (
                  <div className="py-1">
                    {/* Foods */}
                    {searchResults.data?.foods.length ? (
                      <div>
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                          Foods
                        </div>
                        {searchResults.data.foods.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelect("food", item.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent text-left"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            ) : (
                              <Package className="w-8 h-8 p-1.5 bg-muted rounded" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
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
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                          Categories
                        </div>
                        {searchResults.data.categories.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelect("category", item.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent text-left"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            ) : (
                              <UtensilsCrossed className="w-8 h-8 p-1.5 bg-muted rounded" />
                            )}
                            <p className="text-sm font-medium">{item.name}</p>
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {/* Orders */}
                    {searchResults.data?.orders.length ? (
                      <div>
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                          Orders
                        </div>
                        {searchResults.data.orders.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelect("order", item.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent text-left"
                          >
                            <ShoppingCart className="w-8 h-8 p-1.5 bg-muted rounded" />
                            <div>
                              <p className="text-sm font-medium">
                                #{item.id.slice(-8).toUpperCase()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.userName} • ₹{item.totalAmount}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
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
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        <ModeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
