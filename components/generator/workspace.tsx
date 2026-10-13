"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Textarea, Badge } from "@/components/ui/primitives";
import { GENRES, LENGTHS, TONES, AUDIENCES, TWIST_TYPES, INTENSITIES, ENDINGS, storyContentSchema, twistIdeasSchema } from "@/lib/validation";
import { Dices, Loader2, Eye, EyeOff, Save, Heart, Copy, Download, RefreshCw, FileDown, Printer } from "lucide-react";
import { toast } from "sonner";
import { storyToText, storyToMarkdown, download } from "@/lib/export";

type Story = ReturnType<typeof storyContentSchema.parse>;
type Ideas = ReturnType<typeof twistIdeasSchema.parse>;

const LOADING_MSGS = ["Planting subtle clues…", "Developing character motives…", "Engineering the reveal…", "Checking the twist lands fairly…", "Polishing the ending…"];

function randomForm() {
  const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
  const ideas = ["A lighthouse keeper logs ships that never arrive.", "A street magician's tricks start working for real.", "A hotel guest hears knocking from inside the walls.", "A voicemail arrives three days after the funeral.", "Two friends win a prize, but only one ticket exists.", "A child claims the family dog talks when adults leave."];
  const places = ["A rain-soaked coastal town", "A night train", "An empty city", "A sleep clinic", "A college dorm", "A mountain observatory"];
  return { idea: pick(ideas), genre: pick(GENRES), length: pick(LENGTHS), tone: pick(TONES), audience: pick(AUDIENCES), mainCharacter: "", setting: pick(places), twistType: pick(TWIST_TYPES), intensity: pick(INTENSITIES), endingStyle: pick(ENDINGS), extraInstructions: "" };
}

export function GeneratorWorkspace({ initialTwist, initialIdea, initialGenre, initialTone, initialSetting, initialCharacter }: { initialTwist?: string; initialIdea?: string; initialGenre?: string; initialTone?: string; initialSetting?: string; initialCharacter?: string }) {
  const [form, setForm] = useState({ idea: initialIdea || "", genre: (GENRES as readonly string[]).includes(initialGenre || "") ? (initialGenre as (typeof GENRES)[number]) : "Mystery", customGenre: "", length: "Short" as (typeof LENGTHS)[number], tone: (TONES as readonly string[]).includes(initialTone || "") ? (initialTone as (typeof TONES)[number]) : "Suspenseful" as (typeof TONES)[number], audience: "Teens" as (typeof AUDIENCES)[number], mainCharacter: initialCharacter || "", setting: initialSetting || "", twistType: ((TWIST_TYPES as readonly string[]).includes(initialTwist || "") ? initialTwist : "Random") as (typeof TWIST_TYPES)[number], intensity: "Surprising" as (typeof INTENSITIES)[number], endingStyle: "Shocking" as (typeof ENDINGS)[number], extraInstructions: "" });
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0]);
  const [story, setStory] = useState<Story | null>(null);
  const [ideas, setIdeas] = useState<Ideas | null>(null);
  const [twistHidden, setTwistHidden] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [isFav, setIsFav] = useState(false);

  // Apply saved defaults from Settings (localStorage) when fields weren't prefilled.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("twistforge:defaults");
      if (!raw) return;
      const d = JSON.parse(raw) as { genre?: string; tone?: string; length?: string };
      setForm((f) => ({
        ...f,
        genre: !initialGenre && d.genre ? d.genre : f.genre,
        tone: (!initialTone && d.tone ? d.tone : f.tone) as typeof f.tone,
        length: (d.length ? d.length : f.length) as typeof f.length,
      }));
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function callApi(action: string, previousStory?: Story) {
    if (!form.idea.trim() || form.idea.trim().length < 10) { toast.error("Describe your idea in at least 10 characters."); return; }
    setLoading(true); setIdeas(null);
    if (action === "complete") setStory(null);
    let i = 0;
    const timer = setInterval(() => { i++; setLoadingMsg(LOADING_MSGS[i % LOADING_MSGS.length]); }, 2200);
    try {
      const res = await fetch("/api/generate-story", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, genre: form.genre, twistType: form.twistType, action, previousStory: previousStory ? storyToText(previousStory) : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      if (action === "twist-ideas") {
        const parsed = twistIdeasSchema.parse(data.data);
        setIdeas(parsed); toast.success("3 twist ideas generated");
      } else {
        const parsed = storyContentSchema.parse(data.data);
        setStory(parsed); setTwistHidden(true); setIsFav(false); setEditText(storyToMarkdown(parsed));
        toast.success("Story generated");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed. Retry.");
    } finally { clearInterval(timer); setLoading(false); }
  }

  async function save(favorite: boolean) {
    if (!story) return;
    setSaving(true);
    try {
      const res = await fetch("/api/stories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: story.title, premise: story.premise, genre: story.genre, tone: form.tone, twist_type: form.twistType, story_content: story, is_favorite: favorite || isFav }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed — is Supabase configured and are you logged in?");
      if (favorite) setIsFav(true);
      toast.success(favorite ? "Saved to favorites" : "Story saved successfully");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <Card className="h-fit lg:sticky lg:top-20">
        <CardHeader><CardTitle>Story settings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label htmlFor="idea">Story idea *</Label><Textarea id="idea" value={form.idea} onChange={(e) => set("idea", e.target.value)} placeholder="A lighthouse keeper logs ships that never arrive…" rows={4} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Genre</Label><Select value={form.genre} onChange={(e) => set("genre", e.target.value)}>{GENRES.map((g) => <option key={g} value={g}>{g}</option>)}</Select></div>
            <div><Label>Length</Label><Select value={form.length} onChange={(e) => set("length", e.target.value)}>{LENGTHS.map((g) => <option key={g} value={g}>{g}</option>)}</Select></div>
            <div><Label>Tone</Label><Select value={form.tone} onChange={(e) => set("tone", e.target.value)}>{TONES.map((g) => <option key={g} value={g}>{g}</option>)}</Select></div>
            <div><Label>Audience</Label><Select value={form.audience} onChange={(e) => set("audience", e.target.value)}>{AUDIENCES.map((g) => <option key={g} value={g}>{g}</option>)}</Select></div>
            <div><Label>Twist type</Label><Select value={form.twistType} onChange={(e) => set("twistType", e.target.value)}>{TWIST_TYPES.map((g) => <option key={g} value={g}>{g}</option>)}</Select></div>
            <div><Label>Intensity</Label><Select value={form.intensity} onChange={(e) => set("intensity", e.target.value)}>{INTENSITIES.map((g) => <option key={g} value={g}>{g}</option>)}</Select></div>
          </div>
          {form.genre === "Custom" && <div><Label>Custom genre</Label><Input value={form.customGenre} onChange={(e) => set("customGenre", e.target.value)} placeholder="Solarpunk fable…" /></div>}
          <div><Label>Ending style</Label><Select value={form.endingStyle} onChange={(e) => set("endingStyle", e.target.value)}>{ENDINGS.map((g) => <option key={g} value={g}>{g}</option>)}</Select></div>
          <div><Label>Main character (optional)</Label><Input value={form.mainCharacter} onChange={(e) => set("mainCharacter", e.target.value)} placeholder="Mara, a skeptical teen…" /></div>
          <div><Label>Setting (optional)</Label><Input value={form.setting} onChange={(e) => set("setting", e.target.value)} placeholder="Rain-soaked coastal town…" /></div>
          <div><Label>Extra instructions (optional)</Label><Textarea value={form.extraInstructions} onChange={(e) => set("extraInstructions", e.target.value)} rows={2} placeholder="Keep it wholesome, no gore…" /></div>
          <div className="flex gap-2">
            <Button className="flex-1" disabled={loading} onClick={() => callApi("complete")}>{loading ? <><Loader2 className="animate-spin" /> {loadingMsg}</> : "Generate Complete Story"}</Button>
            <Button variant="outline" disabled={loading} onClick={() => { const r = randomForm(); setForm((f) => ({ ...f, ...r })); toast.success("Surprise settings filled"); }} title="Surprise Me"><Dices /></Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" disabled={loading || !form.idea} onClick={() => callApi("twist-ideas")}>3 Twist Ideas</Button>
            <Button variant="outline" size="sm" disabled={loading || !story} onClick={() => story && callApi("rewrite-ending", story)}>Rewrite Ending</Button>
            <Button variant="outline" size="sm" disabled={loading || !story} onClick={() => story && callApi("intensify", story)}>More Surprising</Button>
            <Button variant="outline" size="sm" disabled={loading || !story} onClick={() => story && callApi("foreshadowing", story)}>Add Foreshadowing</Button>
            <Button variant="outline" size="sm" disabled={loading || !story} onClick={() => story && callApi("alternative-ending", story)}>Alternative Ending</Button>
            <Button variant="outline" size="sm" disabled={loading || !story} onClick={() => story && callApi("fix-logic", story)}>Improve Logic</Button>
            <Button variant="outline" size="sm" className="col-span-2" disabled={loading || !story} onClick={() => story && callApi("continue", story)}>Continue the Story</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading && <Card><CardContent className="flex items-center gap-3 py-8"><Loader2 className="animate-spin" /><p className="text-sm">{loadingMsg}</p></CardContent></Card>}
        {ideas && (
          <Card><CardHeader><CardTitle>3 Plot Twist Ideas</CardTitle></CardHeader><CardContent className="space-y-3">
            {ideas.ideas.map((d, i) => (
              <div key={i} className="rounded-lg border p-3"><p className="font-semibold text-sm">{i + 1}. {d.title}</p><p className="mt-1 text-sm">{d.twist}</p><p className="mt-1 text-xs text-muted-foreground">Why it works: {d.whyItWorks}</p></div>
            ))}
          </CardContent></Card>
        )}
        {story ? (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2"><Badge>{story.genre}</Badge><Badge>{form.twistType}</Badge><Badge>{form.tone}</Badge></div>
              <CardTitle className="mt-2 text-2xl">{story.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{story.premise}</p>
              <p className="text-xs text-muted-foreground">Characters: {story.characters.join(", ")}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!editing ? (
                <div className="story-paper space-y-4 text-[15px]">
                  <section><h4 className="font-semibold">Setup</h4><p className="whitespace-pre-wrap">{story.setup}</p></section>
                  <section><h4 className="font-semibold">Rising Action</h4><p className="whitespace-pre-wrap">{story.risingAction}</p></section>
                  <section className="rounded-xl border p-4">
                    <div className="flex items-center justify-between"><h4 className="font-semibold">Major Reveal / Plot Twist</h4>
                      <Button size="sm" variant="outline" onClick={() => setTwistHidden(!twistHidden)}>{twistHidden ? <><Eye /> Reveal Twist</> : <><EyeOff /> Hide Twist</>}</Button></div>
                    {twistHidden ? <p className="mt-2 text-sm text-muted-foreground">Hidden to preserve the surprise.</p> : <p className="mt-2 whitespace-pre-wrap">{story.plotTwist}</p>}
                  </section>
                  <section><h4 className="font-semibold">Climax</h4><p className="whitespace-pre-wrap">{story.climax}</p></section>
                  <section><h4 className="font-semibold">Final Ending</h4><p className="whitespace-pre-wrap">{story.ending}</p></section>
                  <section><h4 className="font-semibold">Foreshadowing clues</h4><ul className="list-disc pl-5">{story.foreshadowing.map((f, i) => <li key={i}>{f}</li>)}</ul></section>
                  <section><h4 className="font-semibold">Why the twist works</h4><p>{story.twistExplanation}</p></section>
                  <section><h4 className="font-semibold">Alternative twists</h4><ul className="list-disc pl-5">{story.alternativeTwists.map((t, i) => <li key={i}>{t}</li>)}</ul></section>
                </div>
              ) : (
                <Textarea rows={20} value={editText} onChange={(e) => setEditText(e.target.value)} />
              )}
              <div className="flex flex-wrap gap-2 no-print">
                <Button size="sm" disabled={saving} onClick={() => save(false)}><Save /> {saving ? "Saving…" : "Save Story"}</Button>
                <Button size="sm" variant="outline" disabled={saving} onClick={() => save(true)}><Heart /> {isFav ? "Favorited" : "Add to Favorites"}</Button>
                <Button size="sm" variant="outline" disabled={loading} onClick={() => callApi("complete")}><RefreshCw /> Regenerate</Button>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(editing ? editText : storyToMarkdown(story)); toast.success("Copied to clipboard"); }}><Copy /> Copy</Button>
                <Button size="sm" variant="outline" onClick={() => download(`${story.title.replace(/[^a-z0-9]+/gi, "-")}.txt`, storyToText(story), "text/plain")}><Download /> TXT</Button>
                <Button size="sm" variant="outline" onClick={() => download(`${story.title.replace(/[^a-z0-9]+/gi, "-")}.md`, editing ? editText : storyToMarkdown(story), "text/markdown")}><FileDown /> Markdown</Button>
                <Button size="sm" variant="outline" disabled={!story} onClick={() => story && callApi("alternative-ending", story)}>Another Twist</Button>
                <Button size="sm" variant="outline" onClick={() => { setEditing(!editing); setEditText(storyToMarkdown(story)); }}>{editing ? "Done Editing" : "Edit Story"}</Button>
                <Button size="sm" variant="ghost" onClick={() => window.print()}><Printer /> Print</Button>
              </div>
            </CardContent>
          </Card>
        ) : !loading && !ideas && (
          <Card><CardContent className="py-14 text-center text-sm text-muted-foreground">Fill in your idea on the left and click <strong>Generate Complete Story</strong>. Real output is produced by Gemini — no placeholders.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
