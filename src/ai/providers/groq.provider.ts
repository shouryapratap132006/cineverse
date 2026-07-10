// ============================================================
// Groq Provider — Implements AIProvider using groq-sdk
// Model read from env — never hardcoded
// ============================================================

import Groq from "groq-sdk";
import type { AIProvider } from "./provider.interface";
import type { AIMessage, AICompletionResponse } from "../types";

const PRIMARY_MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";
const FALLBACK_MODEL = process.env.AI_FALLBACK_MODEL ?? "openai/gpt-oss-20b";

function createClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key_here") {
    throw new Error(
      "GROQ_API_KEY is not configured. Add it to your .env file from https://console.groq.com"
    );
  }
  return new Groq({ apiKey });
}

export class GroqProvider implements AIProvider {
  private client: Groq;
  private model: string;

  constructor() {
    this.client = createClient();
    this.model = PRIMARY_MODEL;
  }

  getModel(): string {
    return this.model;
  }

  async complete(params: {
    messages: AIMessage[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<AICompletionResponse> {
    const attemptComplete = async (model: string): Promise<AICompletionResponse> => {
      const completion = await this.client.chat.completions.create({
        model,
        messages: params.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 2048,
        stream: false,
      });

      const content = completion.choices[0]?.message?.content ?? "";
      return {
        content,
        model,
        usage: completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens,
              completionTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : undefined,
      };
    };

    try {
      return await attemptComplete(PRIMARY_MODEL);
    } catch (primaryError) {
      console.warn(
        `[GroqProvider] Primary model "${PRIMARY_MODEL}" failed, falling back to "${FALLBACK_MODEL}"`,
        primaryError
      );
      try {
        return await attemptComplete(FALLBACK_MODEL);
      } catch (fallbackError) {
        console.error("[GroqProvider] Both models failed:", fallbackError);
        throw fallbackError;
      }
    }
  }

  async stream(params: {
    messages: AIMessage[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<ReadableStream<Uint8Array>> {
    const encoder = new TextEncoder();

    const attemptStream = async (model: string): Promise<ReadableStream<Uint8Array>> => {
      const groqStream = await this.client.chat.completions.create({
        model,
        messages: params.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 2048,
        stream: true,
      });

      return new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const chunk of groqStream) {
              const delta = chunk.choices[0]?.delta?.content ?? "";
              if (delta) {
                // SSE format: "data: {delta}\n\n"
                const payload = `data: ${JSON.stringify({ delta, done: false })}\n\n`;
                controller.enqueue(encoder.encode(payload));
              }
            }
            // Signal stream done
            const donePayload = `data: ${JSON.stringify({ delta: "", done: true })}\n\n`;
            controller.enqueue(encoder.encode(donePayload));
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });
    };

    try {
      return await attemptStream(PRIMARY_MODEL);
    } catch {
      console.warn(`[GroqProvider] Streaming fallback to "${FALLBACK_MODEL}"`);
      return attemptStream(FALLBACK_MODEL);
    }
  }
}
