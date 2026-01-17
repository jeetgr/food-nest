export interface CategoryFormData {
  name: string;
  slug: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export const defaultCategoryForm: CategoryFormData = {
  name: "",
  slug: "",
  image: "",
  isActive: true,
  sortOrder: 0,
};
