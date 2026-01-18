import { ImageOff } from "lucide-react";
import { useState, type ImgHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface ImageWithFallbackProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "onError"
> {
  fallback?: React.ReactNode;
  fallbackClassName?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallback,
  fallbackClassName,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset error state when src changes
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!src || hasError) {
    // Custom fallback or default placeholder
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div
        className={cn(
          "bg-muted text-muted-foreground flex items-center justify-center",
          fallbackClassName || className,
        )}
        role="img"
        aria-label={alt || "Image placeholder"}
      >
        <ImageOff className="h-8 w-8" />
      </div>
    );
  }

  return (
    <>
      {isLoading && <div className={cn("bg-muted animate-pulse", className)} />}
      <img
        src={src}
        alt={alt}
        className={cn(className, isLoading && "hidden")}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </>
  );
}
