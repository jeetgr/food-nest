export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface StorageProvider {
  readonly name: string;

  /**
   * Upload a file
   * @param file - File buffer
   * @param filename - Original filename (used for extension detection)
   * @param folder - Optional subfolder (e.g., "foods", "categories")
   */
  upload(file: Buffer, filename: string, folder?: string): Promise<UploadResult>;

  /**
   * Delete a file by URL or key
   */
  delete(urlOrKey: string): Promise<void>;

  /**
   * Get the public URL for a stored file
   */
  getUrl(key: string): string;
}
