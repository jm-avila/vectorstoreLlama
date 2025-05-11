import { promises as fs } from "fs";
import path from "path";
/**
 * Callback function type for processing files
 */
type FileCallback = (filePath: string) => Promise<void>;

/**
 * Recursively navigates through a directory and processes files
 * @param directoryPath - The path to traverse
 * @param cb - Optional callback function to process each file
 */
export async function navigation(
  directoryPath: string,
  cb: FileCallback = async () => {}
): Promise<void> {
  try {
    // Validate input
    if (!directoryPath) {
      throw new Error("Directory path is required");
    }

    // Read directory contents
    const items = await fs.readdir(directoryPath);

    // Process each item in the directory
    for (const item of items) {
      const fullPath = path.join(directoryPath, item);
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        // Recursively process subdirectories
        await navigation(fullPath, cb);
      } else if (stats.isFile()) {
        // Process files
        await cb(fullPath);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error processing path ${directoryPath}:`, error.message);
    } else {
      console.error(`Unknown error processing path ${directoryPath}`);
    }
  }
}
