// ============================================================
// Review Assistant Service
// ============================================================

import { orchestrateCompletion, parseAIJson } from "../orchestrator";
import { getReviewAssistantPrompt } from "../prompts/review.prompts";
import type { ReviewAssistantRequest, ReviewAssistantResponse } from "../types";

export class ReviewService {
  async processReview(request: ReviewAssistantRequest): Promise<ReviewAssistantResponse> {
    const prompt = getReviewAssistantPrompt(
      request.content,
      request.action,
      request.movieTitle,
      request.targetLanguage
    );

    const response = await orchestrateCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are an expert film critic and editor. Follow the user's instructions precisely. For JSON responses, return only valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: request.action === "funny" ? 0.9 : 0.6,
      maxTokens: request.action === "expand" ? 2048 : 1024,
    });

    let result = response.content;

    // For generate_title, parse JSON array
    if (request.action === "generate_title") {
      try {
        const titles = parseAIJson<string[]>(result);
        result = titles.join("\n");
      } catch {
        // Return as-is if not JSON
      }
    }

    return {
      result,
      original: request.content,
      action: request.action,
    };
  }
}

export const reviewService = new ReviewService();
