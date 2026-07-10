// ============================================================
// AI Orchestrator — routes requests, handles caching & retry
// ============================================================

import { getAIProvider } from "./gateway";
import { aiCache } from "./utils/cache";
import type {
  AIMessage,
  AICompletionResponse,
} from "./types";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Complete an AI request with retry logic and optional caching
 */
export async function orchestrateCompletion(params: {
  messages: AIMessage[];
  cacheKey?: string;
  cacheTtl?: number;
  temperature?: number;
  maxTokens?: number;
}): Promise<AICompletionResponse> {
  // Check cache first
  if (params.cacheKey) {
    const cached = await aiCache.get<AICompletionResponse>(params.cacheKey);
    if (cached) {
      console.info(`[Orchestrator] Cache hit: ${params.cacheKey}`);
      return cached;
    }
  }

  const provider = getAIProvider();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await provider.complete({
        messages: params.messages,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
      });

      // Cache successful response
      if (params.cacheKey && params.cacheTtl) {
        await aiCache.set(params.cacheKey, response, params.cacheTtl);
      }

      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[Orchestrator] Attempt ${attempt + 1} failed:`, lastError.message);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * Math.pow(2, attempt));
      }
    }
  }

  throw lastError ?? new Error("AI request failed after all retries");
}

/**
 * Stream an AI request (no caching — streaming doesn't benefit from cache)
 */
export async function orchestrateStream(params: {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const provider = getAIProvider();
  return provider.stream({
    messages: params.messages,
    temperature: params.temperature,
    maxTokens: params.maxTokens,
  });
}

/**
 * Parse JSON from AI response, handling markdown code blocks
 */
export function parseAIJson<T>(content: string): T {
  // Strip markdown code blocks if present
  let cleaned = content.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return JSON.parse(cleaned.trim()) as T;
}
