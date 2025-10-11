import OpenAI from "openai";
import { env } from "@/env";

let cachedClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  return cachedClient;
}

export function getAiModel() {
  return env.OPENAI_MODEL ?? "gpt-4o-mini";
}
