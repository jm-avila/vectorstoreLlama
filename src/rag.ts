import fs from "node:fs/promises";
import {
  Document,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";
import { navigation } from "./navigation.js";
import { existsSync } from "node:fs";

const PERSIST_DIR = "./storage";

// Helper function to check if a file exists asynchronously
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath); // fs.constants.F_OK is the default check
    return true;
  } catch {
    return false;
  }
}

export async function getIndex(docsPath: string) {
  if (!existsSync(PERSIST_DIR)) {
    await fs.mkdir(PERSIST_DIR, { recursive: true });
  }

  const docStorePath = `${PERSIST_DIR}/doc_store.json`;
  const indexStorePath = `${PERSIST_DIR}/index_store.json`;
  const vectorStorePath = `${PERSIST_DIR}/vector_store.json`;

  const [docStoreExists, indexStoreExists, vectorStoreExists] =
    await Promise.all([
      fileExists(docStorePath),
      fileExists(indexStorePath),
      fileExists(vectorStorePath),
    ]);

  if (docStoreExists && indexStoreExists && vectorStoreExists) {
    try {
      const storageContext = await storageContextFromDefaults({
        persistDir: PERSIST_DIR,
      });
      const index = await VectorStoreIndex.init({
        storageContext,
      });
      return index;
    } catch (error) {
      console.warn("Error loading persisted index:", error);
    }
  }

  // Build new index if we couldn't load one or if files didn't exist
  const docs: Document[] = [];
  const addDoc = async (filePath: string) => {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const doc = new Document({ text: fileContent, id_: filePath });
    docs.push(doc);
  };
  await navigation(docsPath, addDoc);

  // Create storage context for persistence
  const storageContext = await storageContextFromDefaults({
    persistDir: PERSIST_DIR,
  });

  // Build and persist the index
  const index = await VectorStoreIndex.fromDocuments(docs, { storageContext });
  return index;
}

export async function queryIndex(index: VectorStoreIndex, query: string) {
  const queryEngine = index.asQueryEngine();
  const { message } = await queryEngine.query({
    query: query,
  });
  return message;
}
