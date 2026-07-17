import openai from "../../config/openai";
import type { AiProviderAdapter } from "./types";

type VisionInput = {
  imageUrl?: string;
  instruction?: string;
};

function parseJsonObject(value: string | null): Record<string, unknown> {
  if (!value) throw new Error("Vision provider returned an empty response");
  const cleaned = value.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed: unknown = JSON.parse(cleaned);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Vision provider returned an invalid structured response");
  }
  return parsed as Record<string, unknown>;
}

export const openAiVisionAdapter: AiProviderAdapter = {
  name: "openai",
  async invoke(request) {
    const input = (request.input || {}) as VisionInput;
    if (!input.imageUrl) throw new Error("imageUrl is required for vision analysis");

    const completion = await openai.chat.completions.create({
      model: request.model.id,
      temperature: 0.1,
      max_completion_tokens: 450,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Analyze a retail product image for catalog search. Return JSON only with: summary string, category string, subcategory string, colors string[], materials string[], patterns string[], styles string[], occasions string[], gender string, visibleText string[], confidence number from 0 to 1. Never identify a person or infer sensitive traits.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: input.instruction || "Extract searchable product attributes from this image." },
            { type: "image_url", image_url: { url: input.imageUrl, detail: "low" } },
          ],
        },
      ],
    });

    return {
      output: parseJsonObject(completion.choices[0]?.message?.content || null),
      usage: {
        inputTokens: completion.usage?.prompt_tokens,
        outputTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
        requests: 1,
      },
    };
  },
};
