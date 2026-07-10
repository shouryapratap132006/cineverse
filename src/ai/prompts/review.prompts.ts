// ============================================================
// Review Assistant Prompts
// ============================================================

import type { ReviewAction } from "../types";

export function getReviewAssistantPrompt(
  content: string,
  action: ReviewAction,
  movieTitle?: string,
  targetLanguage?: string
): string {
  const context = movieTitle ? `for the film "${movieTitle}"` : "";

  const actionPrompts: Record<ReviewAction, string> = {
    improve: `You are an expert film critic. Improve this movie review ${context} while preserving the author's unique voice and core opinions. Make it more compelling, precise, and evocative. Fix any awkward phrasing.`,

    expand: `You are an expert film critic. Expand this movie review ${context} with more depth — add specific scene analysis, cinematographic observations, performance notes, and thematic discussion. At least double the length while maintaining quality.`,

    shorten: `You are an expert editor. Condense this movie review ${context} to its essential insights. Keep the strongest sentences, cut filler, maintain the author's voice. Target 100-150 words.`,

    professional: `Transform this movie review ${context} into the style of a professional film critic writing for a prestigious publication like The New York Times or Cahiers du Cinéma. Sophisticated vocabulary, precise film terminology, balanced analysis.`,

    funny: `Rewrite this movie review ${context} with wit, humor, and entertaining observations while still being a genuinely useful review. Think: sharp film criticism meets stand-up comedy. Keep core opinions intact.`,

    spoiler_free: `Rewrite this movie review ${context} to completely remove all spoilers while keeping it engaging and informative. Describe themes and emotions without revealing plot details. Add a "Spoiler-Free" framing.`,

    grammar: `Fix all grammar, spelling, punctuation, and style issues in this movie review. Improve sentence structure and flow without changing the content or voice.`,

    translate: `Translate this movie review into ${targetLanguage ?? "Spanish"} while maintaining the tone, style, and all cinematic references. Adapt idioms naturally for the target language.`,

    generate_title: `Generate 5 compelling, creative titles for this movie review ${context}. Make them engaging and evocative — not generic. Return as a JSON array of strings.`,

    summarize: `Summarize this movie review ${context} into 2-3 crisp sentences that capture: the overall verdict, the strongest point, and the key recommendation.`,
  };

  const systemPrompt = actionPrompts[action];

  return `${systemPrompt}

Original review:
"""
${content}
"""

${action === "translate" ? `Translate to: ${targetLanguage ?? "Spanish"}` : ""}
${action === "generate_title" ? "Return ONLY a JSON array of 5 title strings, nothing else." : "Return ONLY the improved review text, no explanations or meta-commentary."}`;
}
