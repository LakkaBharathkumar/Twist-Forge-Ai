import type { StoryContent } from "@/lib/validation";

export interface StoryRow {
  id: string;
  user_id: string;
  title: string;
  premise: string;
  genre: string;
  tone: string;
  twist_type: string;
  story_content: StoryContent;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface GenerationInputUI {
  idea: string;
  genre: string;
  customGenre?: string;
  length: "Flash Fiction" | "Short" | "Medium" | "Long";
  tone: "Dark" | "Emotional" | "Funny" | "Suspenseful" | "Wholesome" | "Mysterious" | "Inspirational";
  audience: "Children" | "Teens" | "Adults";
  mainCharacter?: string;
  setting?: string;
  twistType: string;
  intensity: "Mild" | "Surprising" | "Mind-Blowing";
  endingStyle: "Happy" | "Tragic" | "Ambiguous" | "Bittersweet" | "Shocking";
  extraInstructions?: string;
}

export type GenerationAction =
  | "complete" | "twist-ideas" | "rewrite-ending" | "intensify"
  | "foreshadowing" | "alternative-ending" | "fix-logic" | "continue";
