import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";

import type { StorageProvider, UploadResult } from "./index";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const BASE_URL = process.env.UPLOAD_BASE_URL || "http://localhost:3000/uploads";

/**
 * Local filesystem storage provider
 * Stores files in ./uploads directory
 * Serves via static file handler in Elysia
 */
export class LocalStorageProvider implements StorageProvider {
  readonly name = "local";

  async upload(
    file: Buffer,
    filename: string,
    folder?: string,
  ): Promise<UploadResult> {
    try {
      const ext = extname(filename);
      const key = `${Date.now()}-${crypto.randomUUID()}${ext}`;
      const dir = folder ? join(UPLOAD_DIR, folder) : UPLOAD_DIR;
      const filePath = join(dir, key);

      // Ensure directory exists
      await mkdir(dir, { recursive: true });
      await writeFile(filePath, file);

      const fullKey = folder ? `${folder}/${key}` : key;

      return {
        success: true,
        url: this.getUrl(fullKey),
        key: fullKey,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  async delete(urlOrKey: string): Promise<void> {
    // Extract key from URL if needed
    const key = urlOrKey.startsWith("http")
      ? urlOrKey.replace(`${BASE_URL}/`, "")
      : urlOrKey;

    const filePath = join(UPLOAD_DIR, key);

    try {
      await unlink(filePath);
    } catch {
      // Ignore if file doesn't exist
    }
  }

  getUrl(key: string): string {
    return `${BASE_URL}/${key}`;
  }
}

export const localStorageProvider = new LocalStorageProvider();
