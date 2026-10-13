import { describe, it, expect } from "vitest";
import { generationSchema, storyContentSchema } from "@/lib/validation";
import { storiesToCsv, csvEscape, storyToMarkdown } from "@/lib/export";

describe("validation", () => {
  it("rejects short ideas", () => {
    const r = generationSchema.safeParse({ idea: "hi", genre: "Mystery", length: "Short", tone: "Dark", audience: "Teens", twistType: "Random", intensity: "Mild", endingStyle: "Happy" });
    expect(r.success).toBe(false);
  });
  it("accepts a full payload", () => {
    const r = generationSchema.safeParse({ idea: "A lighthouse keeper logs ships that never arrive on foggy nights.", genre: "Mystery", length: "Short", tone: "Suspenseful", audience: "Adults", twistType: "Random", intensity: "Surprising", endingStyle: "Shocking" });
    expect(r.success).toBe(true);
  });
});

describe("export", () => {
  it("escapes CSV correctly", () => {
    expect(csvEscape('a,"b"\nc')).toBe('"a,""b""\nc"');
    expect(storiesToCsv([{ id: "1", title: "T", genre: "G", twist_type: "X", premise: "p", is_favorite: true, created_at: "2026-01-01" }])).toContain("id,title,genre");
  });
  it("renders markdown with all sections", () => {
    const s = { title: "T", genre: "Mystery", premise: "p", characters: ["A"], setup: "s", risingAction: "r", plotTwist: "t", climax: "c", ending: "e", foreshadowing: ["f1"], twistExplanation: "w", alternativeTwists: ["a1"] };
    const md = storyToMarkdown(storyContentSchema.parse(s));
    expect(md).toContain("## Plot Twist");
  });
});
