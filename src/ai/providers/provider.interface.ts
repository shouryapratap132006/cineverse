// ============================================================
// AI Provider Interface — Provider-agnostic contract
// Switching AI provider = swapping one file in gateway.ts
// ============================================================

import type { AIMessage, AICompletionResponse } from "../types";

export interface AIProvider {
  /**
   * Get the currently configured model name
   */
  getModel(): string;

  /**
   * One-shot completion — returns full response
   */
  complete(params: {
    messages: AIMessage[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<AICompletionResponse>;

  /**
   * Streaming completion — returns a ReadableStream of text chunks
   */
  stream(params: {
    messages: AIMessage[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<ReadableStream<Uint8Array>>;
}
