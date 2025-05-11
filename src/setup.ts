import { getIndex } from "./rag";

export async function setup() {
  const index = await getIndex("docs");
  return index;
}
