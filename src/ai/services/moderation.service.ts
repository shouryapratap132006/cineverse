// ============================================================
// Moderation Service
// ============================================================

import { orchestrateCompletion, parseAIJson } from "../orchestrator";
import type { ModerationRequest, ModerationResult } from "../types";

export class ModerationService {
  async moderate(request: ModerationRequest): Promise<ModerationResult> {
    const response = await orchestrateCompletion({
      messages: [
        {
          role: "system",
          content: `You are CineVerse's content moderation AI. Analyze content for: spam, abuse, spoilers without warnings, off-topic posts, toxicity, and duplicates. 
Always respond with valid JSON only. Be fair — film discussions can be heated. Allow strong opinions. Only flag genuine violations.`,
        },
        {
          role: "user",
          content: `Moderate this ${request.type} content on a movie platform:
"${request.content}"
${request.context ? `Context: ${request.context}` : ""}

Return JSON:
{
  "isAllowed": true,
  "flags": [{ "type": "spam|abuse|spoiler|off_topic|duplicate|toxicity", "confidence": 0.85, "explanation": "reason" }],
  "suggestedTags": ["tag1"],
  "cleanedContent": "optional cleaned version if needed",
  "severity": "none|low|medium|high"
}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 512,
    });

    return parseAIJson<ModerationResult>(response.content);
  }
}

export const moderationService = new ModerationService();
