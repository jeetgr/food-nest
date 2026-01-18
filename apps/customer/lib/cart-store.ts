import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { client } from "@/utils/orpc";

export interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  guestId: string;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    immer((set, get) => ({
      items: [],
      guestId: randomUUID(),

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            state.items.push({ ...item, quantity: 1 });
          }
        });
        // Sync with server
        void client.cart.update({
          guestId: get().guestId,
          foodId: item.id,
          quantity: get().items.find((i) => i.id === item.id)?.quantity || 1,
        });
      },

      removeItem: (id) => {
        set((state) => {
          state.items = state.items.filter((i) => i.id !== id);
        });
        // Sync with server (0 quantity = remove)
        void client.cart.update({
          guestId: get().guestId,
          foodId: id,
          quantity: 0,
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (item) {
            item.quantity = quantity;
          }
        });

        // Sync with server
        void client.cart.update({
          guestId: get().guestId,
          foodId: id,
          quantity: quantity,
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + parseFloat(item.price) * item.quantity,
          0,
        );
      },
    })),
    {
      name: "foodnest-cart",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        // Hydration warning or logic if needed
      },
    },
  ),
);

// Actions to sync with server
export const syncCartWithServer = async () => {
  const store = useCartStore.getState();
  const items = store.items.map((i) => ({
    foodId: i.id,
    quantity: i.quantity,
  }));

  try {
    // 1. Sync local items up to server (merge)
    await client.cart.sync({ guestId: store.guestId, items });

    // 2. Fetch fresh cart from server (source of truth for prices)
    const { items: serverItems } = await client.cart.get({
      guestId: store.guestId,
    });

    // 3. Update local store with authoritative data
    useCartStore.setState((state) => {
      // Preserve guestId!
      state.items = serverItems.map((i) => ({
        id: i.foodId,
        name: i.name,
        price: i.price,
        image: i.image,
        quantity: i.quantity,
      }));
    });
  } catch (error) {
    console.error("Failed to sync cart:", error);
  }
};
