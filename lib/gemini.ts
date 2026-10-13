import { GoogleGenAI } from "@google/genai";
import type { GenerationInput } from "./validation";

const SYSTEM = `You are TwistForge AI, an expert short-story writer and plot-twist designer. Create original, engaging, emotionally satisfying stories. Build a clear narrative setup, plant subtle but fair clues, develop believable character motivations, and deliver an unexpected yet logically consistent reveal. The twist should recontextualize earlier events without feeling arbitrary. Follow the user's selected genre, tone, audience, length, twist type, and ending style. Return the requested structured output without adding commentary outside the requested format.`;

const LENGTH_HINT: Record<string, string> = {
  "Flash Fiction": "300-500 words total across narrative fields",
  "Short": "700-1200 words total",
  "Medium": "1300-2200 words total",
  "Long": "2300-3500 words total",
};

export function getModelId() {
  return process.env.GEMINI_MODEL || "gemini-2.0-flash";
}

function twistGuidance(twistType: string, intensity: string) {
  if (twistType === "Random") return `Choose the twist type that best fits the idea. Intensity: ${intensity}.`;
  return `Twist type: ${twistType}. Intensity: ${intensity} (Mild=subtle irony, Surprising=strong reversal, Mind-Blowing=reframes everything).`;
}

export function buildPrompt(input: GenerationInput): string {
  const genre = input.genre === "Custom" ? (input.customGenre || "Literary Fiction") : input.genre;
  const base = `Story idea: ${input.idea}
Genre: ${genre}
Length: ${input.length} (${LENGTH_HINT[input.length]})
Tone: ${input.tone}
Audience: ${input.audience}
Main character: ${input.mainCharacter || "invent one"}
Setting: ${input.setting || "invent a vivid fitting setting"}
${twistGuidance(input.twistType, input.intensity)}
Ending style: ${input.endingStyle}
Extra instructions: ${input.extraInstructions || "none"}`;

  switch (input.action) {
    case "twist-ideas":
      return `${base}\n\nTask: Generate exactly 3 distinct plot-twist ideas for this setup. Return ONLY valid JSON: {"ideas":[{"title":"...","twist":"...","whyItWorks":"..."}, ...3 items]}`;
    case "rewrite-ending":
      return `${base}\n\nPrevious story:\n${input.previousStory}\n\nTask: Rewrite ONLY the ending with a more surprising twist. Return ONLY the full story JSON in the complete-story schema.`;
    case "intensify":
      return `${base}\n\nPrevious story:\n${input.previousStory}\n\nTask: Make the twist MORE surprising while keeping logic consistent. Return ONLY the full story JSON in the complete-story schema.`;
    case "foreshadowing":
      return `${base}\n\nPrevious story:\n${input.previousStory}\n\nTask: Add/strengthen subtle foreshadowing clues. Return ONLY the full story JSON in the complete-story schema with improved foreshadowing array (4-6 clues).`;
    case "alternative-ending":
      return `${base}\n\nPrevious story:\n${input.previousStory}\n\nTask: Write a compelling ALTERNATIVE ending (different twist + climax + ending). Return ONLY the full story JSON in the complete-story schema.`;
    case "fix-logic":
      return `${base}\n\nPrevious story:\n${input.previousStory}\n\nTask: Fix plot holes and improve story logic/motivation consistency. Return ONLY the full story JSON in the complete-story schema.`;
    case "continue":
      return `${base}\n\nPrevious story:\n${input.previousStory}\n\nTask: Continue the story with a second twist that deepens the first. Return ONLY the full story JSON in the complete-story schema.`;
    default:
      return `${base}\n\nTask: Write a COMPLETE original short story. Return ONLY valid JSON with exactly these keys: {"title","genre","premise","characters":[2-4 names/roles],"setup","risingAction","plotTwist","climax","ending","foreshadowing":[4-6 clues],"twistExplanation","alternativeTwists":[2-3 one-line twists]}. No markdown fences, no commentary.`;
  }
}

function extractJson(text: string): string {
  const t = text.trim();
  if (t.startsWith("{") && t.endsWith("}")) return t;
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const s = t.indexOf("{");
  const e = t.lastIndexOf("}");
  if (s >= 0 && e > s) return t.slice(s, e + 1);
  return t;
}

export async function generateWithGemini(input: GenerationInput): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err: Error & { code?: string } = new Error("GEMINI_API_KEY is not configured on the server. Add it to .env.local and restart.");
    err.code = "NO_API_KEY";
    throw err;
  }
  const ai = new GoogleGenAI({ apiKey });
  const model = getModelId();
  const res = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: buildPrompt(input) }] }],
    config: {
      systemInstruction: SYSTEM,
      responseMimeType: "application/json",
      temperature: 0.95,
      maxOutputTokens: 4096,
    },
  } as never);
  const text = extractJson(typeof (res as { text?: unknown }).text === "function"
    ? await (res as unknown as { text: () => Promise<string> | string }).text()
    : ((res as { text?: string }).text ?? ""));
  if (!text) throw new Error("Gemini returned an empty response. Please retry.");
  return text;
}
