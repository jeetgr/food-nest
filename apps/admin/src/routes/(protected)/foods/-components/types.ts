export interface FoodFormData {
  name: string;
  slug?: string;
  description?: string;
  price: string;
  image: string;
  categoryId: string;
  stock: number;
  isAvailable: boolean;
}

export interface Food {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  image: string;
  categoryId: string;
  stock: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export const defaultFoodForm: FoodFormData = {
  name: "",
  slug: undefined,
  description: "",
  price: "",
  image: "",
  categoryId: "",
  stock: 0,
  isAvailable: true,
};
