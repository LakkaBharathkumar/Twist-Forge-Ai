import { z } from "zod";

export const GENRES = ["Fantasy","Horror","Mystery","Thriller","Romance","Sci-Fi","Comedy","Drama","Adventure","Psychological","Custom"] as const;
export const LENGTHS = ["Flash Fiction","Short","Medium","Long"] as const;
export const TONES = ["Dark","Emotional","Funny","Suspenseful","Wholesome","Mysterious","Inspirational"] as const;
export const AUDIENCES = ["Children","Teens","Adults"] as const;
export const TWIST_TYPES = ["Secret Identity","Betrayal","Unreliable Narrator","Hidden Connection","False Victory","Time Loop","Red Herring","Unexpected Villain","Reality Reversal","Random"] as const;
export const INTENSITIES = ["Mild","Surprising","Mind-Blowing"] as const;
export const ENDINGS = ["Happy","Tragic","Ambiguous","Bittersweet","Shocking"] as const;
export const ACTIONS = ["complete","twist-ideas","rewrite-ending","intensify","foreshadowing","alternative-ending","fix-logic","continue"] as const;

export const generationSchema = z.object({
  idea: z.string().min(10, "Describe your idea in at least 10 characters.").max(2000),
  genre: z.string().min(1),
  customGenre: z.string().max(40).optional().default(""),
  length: z.enum(LENGTHS),
  tone: z.enum(TONES),
  audience: z.enum(AUDIENCES),
  mainCharacter: z.string().max(200).optional().default(""),
  setting: z.string().max(300).optional().default(""),
  twistType: z.enum(TWIST_TYPES),
  intensity: z.enum(INTENSITIES),
  endingStyle: z.enum(ENDINGS),
  extraInstructions: z.string().max(1000).optional().default(""),
  action: z.enum(ACTIONS).default("complete"),
  previousStory: z.string().max(15000).optional().default(""),
});

export type GenerationInput = z.infer<typeof generationSchema>;

export const storyContentSchema = z.object({
  title: z.string().min(1).max(160),
  genre: z.string().min(1).max(60),
  premise: z.string().min(1).max(1000),
  characters: z.array(z.string()).min(1).max(8),
  setup: z.string().min(1).max(6000),
  risingAction: z.string().min(1).max(6000),
  plotTwist: z.string().min(1).max(6000),
  climax: z.string().min(1).max(6000),
  ending: z.string().min(1).max(6000),
  foreshadowing: z.array(z.string()).min(1).max(8),
  twistExplanation: z.string().min(1).max(3000),
  alternativeTwists: z.array(z.string()).min(1).max(5),
});

export type StoryContent = z.infer<typeof storyContentSchema>;

export const twistIdeasSchema = z.object({
  ideas: z.array(z.object({
    title: z.string().min(1).max(120),
    twist: z.string().min(1).max(2000),
    whyItWorks: z.string().min(1).max(1000),
  })).min(1).max(5),
});

export const saveStorySchema = z.object({
  title: z.string().min(1).max(160),
  premise: z.string().max(1000).default(""),
  genre: z.string().max(60).default("Mystery"),
  tone: z.string().max(40).default("Suspenseful"),
  twist_type: z.string().max(60).default("Random"),
  story_content: storyContentSchema,
  is_favorite: z.boolean().default(false),
});

export function getEnv(name: string): string | undefined {
  return process.env[name];
}

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}
