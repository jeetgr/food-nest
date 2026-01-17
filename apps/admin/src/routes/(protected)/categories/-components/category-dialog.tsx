import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { FieldError } from "@/components/ui/field-error";

// Validation schema
const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  slug: z.string().max(100, "Slug is too long").optional(),
  image: z.string().min(1, "Image is required"),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const defaultValues: CategoryFormData = {
  name: "",
  slug: undefined,
  image: "",
  isActive: true,
  sortOrder: 0,
};

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: CategoryFormData;
  imagePreview?: string | null;
  onSubmit: (data: CategoryFormData, reset: () => void) => Promise<void>;
  isSubmitting: boolean;
  isEditing: boolean;
}

export function CategoryDialog({
  open,
  onOpenChange,
  initialValues,
  imagePreview,
  onSubmit,
  isSubmitting,
  isEditing,
}: CategoryDialogProps) {
  const form = useForm({
    defaultValues: initialValues ?? defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: categorySchema,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Category" : "Add Category"}
          </DialogTitle>
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

          {/* Name */}
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g. Pizza, Burgers, Drinks"
                />
                <FieldError field={field} />
              </div>
            )}
          </form.Field>

          {/* Slug */}
          <form.Field name="slug">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Slug <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => {
                    const value = e.target.value.trim();

                    field.handleChange(value === "" ? undefined : value);
                  }}
                  onBlur={field.handleBlur}
                  placeholder="Auto-generated from name"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to auto-generate from name
                </p>
                <FieldError field={field} />
              </div>
            )}
          </form.Field>

          {/* Sort Order */}
          <form.Field name="sortOrder">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Sort Order</Label>
                <Input
                  id={field.name}
                  type="number"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(parseInt(e.target.value) || 0)
                  }
                  onBlur={field.handleBlur}
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first
                </p>
              </div>
            )}
          </form.Field>

          {/* Active Toggle */}
          <form.Field name="isActive">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <Label htmlFor={field.name}>Active</Label>
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isEditing ? "Update Category" : "Create Category"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
