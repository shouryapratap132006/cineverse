// ============================================================
// AI Gateway — Provider factory
// To add a new provider (Gemini, Claude, OpenAI, Ollama):
//   1. Create src/ai/providers/your.provider.ts
//   2. Add a case here
//   3. Set AI_PROVIDER env var
// ============================================================

import type { AIProvider } from "./providers/provider.interface";
import { GroqProvider } from "./providers/groq.provider";

let _instance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (_instance) return _instance;

  const providerName = process.env.AI_PROVIDER ?? "groq";

  switch (providerName.toLowerCase()) {
    case "groq":
      _instance = new GroqProvider();
      break;
    // Future providers — add cases here:
    // case "openai":
    //   _instance = new OpenAIProvider();
    //   break;
    // case "gemini":
    //   _instance = new GeminiProvider();
    //   break;
    // case "claude":
    //   _instance = new ClaudeProvider();
    //   break;
    // case "ollama":
    //   _instance = new OllamaProvider();
    //   break;
    default:
      console.warn(`[AI Gateway] Unknown provider "${providerName}", defaulting to Groq`);
      _instance = new GroqProvider();
  }

  console.info(`[AI Gateway] Initialized provider: ${providerName}`);
  return _instance;
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetAIProvider(): void {
  _instance = null;
}
