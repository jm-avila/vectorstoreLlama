import * as dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const configSchema = z.object({
  llm: z.object({
    geminiApiKey: z.string(),
    geminiModelName: z.string().default("gemini-2.0-flash"),
  }),
});

export type Config = z.infer<typeof configSchema>;

export const config = configSchema.parse({
  llm: {
    geminiApiKey: process.env.LLM_GEMINI_API_KEY,
    geminiModelName: process.env.LLM_GEMINI_MODEL_NAME || "gemini-2.0-flash",
  },
});
