import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/utils/orpc";

// Validation schema
const foodSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  slug: z.string().max(200, "Slug is too long").optional(),
  description: z.string().max(1000, "Description is too long").optional(),
  price: z
    .string()
    .min(1, "Price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format (e.g. 10.99)"),
  image: z.string().min(1, "Image is required"),
  categoryId: z.string().min(1, "Category is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  isAvailable: z.boolean(),
});

type FoodFormData = z.infer<typeof foodSchema>;

const defaultValues: FoodFormData = {
  name: "",
  slug: undefined,
  description: "",
  price: "",
  image: "",
  categoryId: "",
  stock: 0,
  isAvailable: true,
};

interface FoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: FoodFormData;
  imagePreview?: string | null;
  onSubmit: (data: FoodFormData, reset: () => void) => Promise<void>;
  isSubmitting: boolean;
  isEditing: boolean;
}

export function FoodDialog({
  open,
  onOpenChange,
  initialValues,
  imagePreview,
  onSubmit,
  isSubmitting,
  isEditing,
}: FoodDialogProps) {
  const categories = useQuery(
    orpc.categories.list.queryOptions({
      input: { all: true },
    }),
  );

  // Build category items for select
  const categoryItems = useMemo(() => {
    if (!categories.data?.items) return [];
    return categories.data.items.map((cat) => ({
      label: cat.name,
      value: cat.id,
    }));
  }, [categories.data]);

  const form = useForm({
    defaultValues: initialValues ?? defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: foodSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await onSubmit(value, formApi.reset);
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Food" : "Add Food"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Image Upload */}
          <form.Field name="image">
            {(field) => (
              <div className="space-y-2">
                <Label>Image</Label>
                <ImageUpload
                  value={field.state.value || null}
                  preview={imagePreview}
                  onChange={(base64) => field.handleChange(base64 || "")}
                  disabled={isSubmitting}
                />
                <FieldError field={field} />
              </div>
            )}
          </form.Field>

          {/* Name & Slug */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Name</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Food name"
                  />
                  <FieldError field={field} />
                </div>
              )}
            </form.Field>

            <form.Field name="slug">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    Slug{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      field.handleChange(value === "" ? undefined : value);
                    }}
                    onBlur={field.handleBlur}
                    placeholder="Auto-generated"
                  />
                  <FieldError field={field} />
                </div>
              )}
            </form.Field>
          </div>

          {/* Description */}
          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Description</Label>
                <Textarea
                  id={field.name}
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Food description..."
                  rows={3}
                />
                <FieldError field={field} />
              </div>
            )}
          </form.Field>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="price">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Price</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="0.00"
                  />
                  <FieldError field={field} />
                </div>
              )}
            </form.Field>

            <form.Field name="stock">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Stock</Label>
                  <Input
                    id={field.name}
                    type="number"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(parseInt(e.target.value) || 0)
                    }
                    onBlur={field.handleBlur}
                  />
                  <FieldError field={field} />
                </div>
              )}
            </form.Field>
          </div>

          {/* Category */}
          <form.Field name="categoryId">
            {(field) => (
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  items={categoryItems}
                  value={field.state.value}
                  onValueChange={(value) => {
                    if (value) field.handleChange(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categoryItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError field={field} />
              </div>
            )}
          </form.Field>

          {/* Available Toggle */}
          <form.Field name="isAvailable">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <Label htmlFor={field.name}>Available</Label>
              </div>
            )}
          </form.Field>

          {/* Submit Button */}
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(formIsSubmitting) => (
              <Button
                type="submit"
                className="w-full"
                disabled={formIsSubmitting || isSubmitting}
              >
                {(formIsSubmitting || isSubmitting) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Update Food" : "Create Food"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
