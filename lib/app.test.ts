import { describe, expect, it } from "vitest";
import { csvEscape, storiesToCsv, storyToMarkdown, storyToText } from "./export";
import { generationSchema, saveStorySchema, storyContentSchema } from "./validation";
import { buildPrompt } from "./gemini";

const sample = {
  title: "The Lighthouse",
  genre: "Mystery",
  premise: "A keeper logs ships that never arrive.",
  characters: ["Mara", "Jonas"],
  setup: "setup text",
  risingAction: "rising text",
  plotTwist: "twist text",
  climax: "climax text",
  ending: "ending text",
  foreshadowing: ["clue 1", "clue 2"],
  twistExplanation: "why it works",
  alternativeTwists: ["alt 1", "alt 2"],
};

describe("validation", () => {
  it("rejects short ideas", () => {
    const r = generationSchema.safeParse({
      idea: "short", genre: "Mystery", length: "Short", tone: "Dark",
      audience: "Teens", twistType: "Random", intensity: "Mild", endingStyle: "Happy", action: "complete",
    });
    expect(r.success).toBe(false);
  });
  it("accepts a full generation payload", () => {
    const r = generationSchema.safeParse({
      idea: "A lighthouse keeper logs ships that never arrive one foggy night.",
      genre: "Mystery", length: "Short", tone: "Dark", audience: "Teens",
      twistType: "Random", intensity: "Surprising", endingStyle: "Shocking", action: "complete",
    });
    expect(r.success).toBe(true);
  });
  it("validates story content", () => {
    expect(storyContentSchema.safeParse(sample).success).toBe(true);
  });
  it("rejects invalid save payload", () => {
    expect(saveStorySchema.safeParse({ title: "", story_content: sample }).success).toBe(false);
  });
});

describe("export", () => {
  it("storyToText contains sections", () => {
    const t = storyToText(sample);
    expect(t).toContain("PLOT TWIST");
    expect(t).toContain("The Lighthouse");
  });
  it("storyToMarkdown contains headings", () => {
    expect(storyToMarkdown(sample)).toContain("# The Lighthouse");
  });
  it("csv escapes quotes and commas", () => {
    expect(csvEscape('a,"b"\nc')).toBe('"a,""b""\nc"');
    const csv = storiesToCsv([{ id: "1", title: 'A "great", tale', genre: "Mystery", twist_type: "Random", premise: "x", is_favorite: true, created_at: "2026-01-01" }]);
    expect(csv).toContain('""great""');
  });
});

describe("gemini prompt", () => {
  it("builds JSON-only prompt for complete stories", () => {
    const p = buildPrompt({
      idea: "A lighthouse keeper logs ships that never arrive.",
      genre: "Mystery", customGenre: "", length: "Short", tone: "Dark", audience: "Teens",
      mainCharacter: "", setting: "", twistType: "Betrayal", intensity: "Surprising",
      endingStyle: "Shocking", extraInstructions: "", action: "complete", previousStory: "",
    });
    expect(p).toContain("Betrayal");
    expect(p).toContain("valid JSON");
  });
  it("builds twist-ideas prompt", () => {
    const p = buildPrompt({
      idea: "A lighthouse keeper logs ships that never arrive.",
      genre: "Mystery", customGenre: "", length: "Short", tone: "Dark", audience: "Teens",
      mainCharacter: "", setting: "", twistType: "Random", intensity: "Mild",
      endingStyle: "Happy", extraInstructions: "", action: "twist-ideas", previousStory: "",
    });
    expect(p).toContain("3 distinct");
  });
});
