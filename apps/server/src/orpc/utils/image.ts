import { ORPCError } from "@orpc/server";

// Constants
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export interface ImageValidationResult {
  valid: boolean;
  buffer?: Buffer;
  mimeType?: string;
  extension?: string;
  error?: string;
}

/**
 * Validates and parses a base64 image string
 * @throws ORPCError if throwOnError is true and validation fails
 */
export function validateBase64Image(
  base64: string,
  throwOnError = false,
): ImageValidationResult {
  // Check if it's a data URL
  const match = base64.match(/^data:(image\/(png|jpeg|webp));base64,(.+)$/);

  if (!match) {
    const error = "Invalid image format. Use PNG, JPEG, or WebP";
    if (throwOnError) {
      throw new ORPCError("BAD_REQUEST", { message: error });
    }
    return { valid: false, error };
  }

  const mimeType = match[1];
  const extension = match[2] === "jpeg" ? "jpg" : match[2];
  const data = match[3];

  if (!mimeType || !extension || !data) {
    const error = "Invalid image format. Use PNG, JPEG, or WebP";
    if (throwOnError) {
      throw new ORPCError("BAD_REQUEST", { message: error });
    }
    return { valid: false, error };
  }

  // Validate mime type
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    const error = "Image must be PNG, JPEG, or WebP";
    if (throwOnError) {
      throw new ORPCError("BAD_REQUEST", { message: error });
    }
    return { valid: false, error };
  }

  // Decode and check size
  const buffer = Buffer.from(data, "base64");

  if (buffer.length > MAX_IMAGE_SIZE) {
    const error = "Image must be less than 5MB";
    if (throwOnError) {
      throw new ORPCError("BAD_REQUEST", { message: error });
    }
    return { valid: false, error };
  }

  return { valid: true, buffer, mimeType, extension };
}

/**
 * Generates a URL-friendly slug from a string
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
