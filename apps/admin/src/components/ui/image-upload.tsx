import { Upload, X } from "lucide-react";
import { useCallback } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { Button } from "./button";

// Image validation constants
const ALLOWED_IMAGE_TYPES: Accept = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ImageUploadProps {
  value: string | null;
  onChange: (base64: string | null) => void;
  preview?: string | null;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  preview,
  className,
  disabled = false,
}: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onChange(base64);
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const onDropRejected = useCallback(() => {
    toast.error("Invalid file. Use PNG, JPEG, or WebP under 5MB");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ALLOWED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    disabled,
  });

  const displayPreview = value || preview;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div
      {...getRootProps()}
      data-slot="image-upload"
      className={cn(
        // Boxy design matching input component
        "relative cursor-pointer rounded-none border border-dashed transition-colors",
        "dark:bg-input/30 border-input",
        isDragActive ? "border-ring bg-ring/5" : "hover:border-ring/50",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <input {...getInputProps()} />

      {displayPreview ? (
        <div className="relative p-2">
          <img
            src={displayPreview}
            alt="Preview"
            className="h-32 w-full rounded-none object-cover"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon-xs"
              className="absolute top-3 right-3"
              onClick={handleRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <p className="text-muted-foreground mt-2 text-center text-xs">
            {isDragActive ? "Drop to replace" : "Click or drag to replace"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-4 py-6">
          <Upload
            className={cn(
              "mb-2 h-8 w-8",
              isDragActive ? "text-ring" : "text-muted-foreground",
            )}
          />
          <p className="mb-1 text-xs font-medium">
            {isDragActive
              ? "Drop image here"
              : "Drag & drop or click to upload"}
          </p>
          <p className="text-muted-foreground text-xs">
            PNG, JPEG, WebP • Max 5MB
          </p>
        </div>
      )}
    </div>
  );
}
