"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";
import { GENRES, LENGTHS, TONES, AUDIENCES, TWIST_TYPES, INTENSITIES, ENDINGS } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Select, Input, Label } from "@/components/ui/primitives";
import { Dices } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login, getSession, saveStory } from "@/lib/storage";

function randomForm() {
  const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
  const ideas = ["A lighthouse keeper logs ships that never arrive.", "A street magician's tricks start working for real.", "A hotel guest hears knocking from inside the walls.", "A voicemail arrives three days after the funeral.", "Two friends win a prize, but only one ticket exists.", "A child claims the family dog talks when adults leave."];
  const places = ["A rain-soaked coastal town", "A night train", "An empty city", "A sleep clinic", "A college dorm", "A mountain observatory"];
  return { idea: pick(ideas), genre: pick(GENRES), length: pick(LENGTHS), tone: pick(TONES), audience: pick(AUDIENCES), mainCharacter: "", setting: pick(places), twistType: pick(TWIST_TYPES), intensity: pick(INTENSITIES), endingStyle: pick(ENDINGS), extraInstructions: "" };
}

export function QuickGenerateForm() {
  const [form, setForm] = useState({
    idea: "",
    genre: "Mystery",
    length: "Short" as (typeof LENGTHS)[number],
    tone: "Suspenseful" as (typeof TONES)[number],
    audience: "Teens" as (typeof AUDIENCES)[number],
    mainCharacter: "",
    setting: "",
    twistType: "Random" as (typeof TWIST_TYPES)[number],
    intensity: "Surprising" as (typeof INTENSITIES)[number],
    endingStyle: "Shocking" as (typeof ENDINGS)[number],
    extraInstructions: "",
  });
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleGenerate() {
    if (!form.idea.trim() || form.idea.trim().length < 10) {
      toast.error("Describe your idea in at least 10 characters.");
      return;
    }
    
    // Check if user is logged in
    const session = getSession();
    if (!session) {
      setShowLogin(true);
      toast.warning("Log in to save stories. Setting temporary defaults.");
      setForm({ ...form, ...randomForm() });
      toast.success("Surprise settings filled — generate a story, then log in to save!");
      return;
    }
    
    setForm((f) => ({ ...f, ...randomForm() }));
    toast.success("Surprise settings filled — generating story...");
    
    // Generate and save story via API
    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, genre: form.genre, twistType: form.twistType, action: "complete", previousStory: undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      toast.success("Story generated and saved to your library!");
      router.push("/stories");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed. Retry.");
    }
  }

  return (
    <section className="mb-8">
      <Card>
        <CardHeader><CardTitle>Quick Generate</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="quick-idea">Story idea *</Label>
            <Input
              id="quick-idea"
              value={form.idea}
              onChange={(e) => set("idea", e.target.value)}
              placeholder="A lighthouse keeper logs ships that never arrive…"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Genre</Label><Select value={form.genre} onChange={(e) => set("genre", e.target.value)}>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </Select></div>
            <div><Label>Length</Label><Select value={form.length} onChange={(e) => set("length", e.target.value)}>
              {LENGTHS.map((g) => <option key={g} value={g}>{g}</option>)}
            </Select></div>
            <div><Label>Tone</Label><Select value={form.tone} onChange={(e) => set("tone", e.target.value)}>
              {TONES.map((g) => <option key={g} value={g}>{g}</option>)}
            </Select></div>
            <div><Label>Audience</Label><Select value={form.audience} onChange={(e) => set("audience", e.target.value)}>
              {AUDIENCES.map((g) => <option key={g} value={g}>{g}</option>)}
            </Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Twist type</Label><Select value={form.twistType} onChange={(e) => set("twistType", e.target.value)}>
              {TWIST_TYPES.map((g) => <option key={g} value={g}>{g}</option>)}
            </Select></div>
            <div><Label>Intensity</Label><Select value={form.intensity} onChange={(e) => set("intensity", e.target.value)}>
              {INTENSITIES.map((g) => <option key={g} value={g}>{g}</option>)}
            </Select></div>
            <div><Label>Ending style</Label><Select value={form.endingStyle} onChange={(e) => set("endingStyle", e.target.value)}>
              {ENDINGS.map((g) => <option key={g} value={g}>{g}</option>)}
            </Select></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGenerate} className="flex-1">
              <Dices /> Surprise Me
            </Button>
            {showLogin ? (
              <Button variant="outline" size="sm" onClick={() => setShowLogin(false)}>Cancel</Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => router.push("/login")}>Log in</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}