"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function StoryEditor({ id, initial }: { id: string; initial: { title: string; premise: string; story_content: Record<string, unknown> } }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [premise, setPremise] = useState(initial.premise ?? "");
  const [body, setBody] = useState(JSON.stringify(initial.story_content, null, 2));
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(body);
      } catch {
        throw new Error("Story JSON is invalid. Fix the JSON and retry.");
      }
      const res = await fetch(`/api/stories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, premise, story_content: parsed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success("Story updated");
      router.push(`/stories/${id}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle className="text-base">Edit story</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><Label>Premise</Label><Input value={premise} onChange={(e) => setPremise(e.target.value)} /></div>
        <div><Label>Story content (JSON)</Label><Textarea rows={20} value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-xs" /></div>
        <Button size="sm" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save changes"}</Button>
      </CardContent>
    </Card>
  );
}
