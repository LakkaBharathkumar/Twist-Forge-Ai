import type { StoryContent } from "./validation";

export function storyToText(s: StoryContent): string {
  return [
    s.title, "",
    `Genre: ${s.genre}`, "",
    `Premise: ${s.premise}`, "",
    `Characters: ${s.characters.join(", ")}`, "",
    "SETUP", s.setup, "",
    "RISING ACTION", s.risingAction, "",
    "PLOT TWIST", s.plotTwist, "",
    "CLIMAX", s.climax, "",
    "ENDING", s.ending, "",
    "FORESHADOWING", ...s.foreshadowing.map((f) => `- ${f}`), "",
    "WHY THE TWIST WORKS", s.twistExplanation, "",
    "ALTERNATIVE TWISTS", ...s.alternativeTwists.map((t) => `- ${t}`),
  ].join("\n");
}

export function storyToMarkdown(s: StoryContent): string {
  return [
    `# ${s.title}`, "",
    `> ${s.premise}`, "",
    `**Genre:** ${s.genre}`, "",
    `**Characters:** ${s.characters.join(", ")}`, "",
    "## Setup", "", s.setup, "",
    "## Rising Action", "", s.risingAction, "",
    "## Plot Twist", "", s.plotTwist, "",
    "## Climax", "", s.climax, "",
    "## Ending", "", s.ending, "",
    "## Foreshadowing Clues", "", ...s.foreshadowing.map((f) => `- ${f}`), "",
    "## Why the Twist Works", "", s.twistExplanation, "",
    "## Alternative Twists", "", ...s.alternativeTwists.map((t) => `- ${t}`), "",
    "---", "_Generated with TwistForge AI_",
  ].join("\n");
}

export function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}

export function csvEscape(v: string | number | boolean | null | undefined): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function storiesToCsv(rows: { id: string; title: string; genre: string; twist_type: string; premise: string; is_favorite: boolean; created_at: string }[]): string {
  const head = "id,title,genre,twist_type,premise,is_favorite,created_at";
  const lines = rows.map((r) => [r.id, r.title, r.genre, r.twist_type, r.premise, r.is_favorite, r.created_at].map(csvEscape).join(","));
  return [head, ...lines].join("\n");
}
