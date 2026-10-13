import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layout/nav";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/primitives";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StoryEditor } from "./editor";

export default async function StoryDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <p className="mx-auto max-w-3xl px-4 py-16 text-sm">Log in to view saved stories. <Link href="/login" className="underline">Log in</Link></p>;
  const { data, error } = await supabase.from("stories").select("*").eq("id", id).eq("user_id", user.id).single();
  if (error || !data) notFound();
  const s = data.story_content;
  const editing = sp?.edit === "1";

  return (
    <div className="mx-auto flex max-w-7xl md:px-4">
      <AppSidebar />
      <main className="flex-1 px-4 py-8">
        <div className="flex gap-2 no-print">
          <Link href="/stories"><Button variant="outline" size="sm">← Back to library</Button></Link>
          {!editing && <Link href={`/stories/${id}?edit=1`}><Button variant="outline" size="sm">Edit story</Button></Link>}
        </div>
        {editing ? (
          <StoryEditor id={id} initial={data} />
        ) : (
          <>
            <div className="mt-4 flex gap-2"><Badge>{data.genre}</Badge><Badge>{data.twist_type}</Badge></div>
            <h1 className="mt-2 text-3xl font-bold">{s.title}</h1>
            <p className="mt-1 text-muted-foreground">{s.premise}</p>
            <Card className="mt-6"><CardHeader><CardTitle className="text-base">Setup</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap text-[15px] leading-7">{s.setup}</p></CardContent></Card>
            <Card className="mt-4"><CardHeader><CardTitle className="text-base">Rising Action</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap text-[15px] leading-7">{s.risingAction}</p></CardContent></Card>
            <Card className="mt-4 border-violet-500/40"><CardHeader><CardTitle className="text-base">Plot Twist</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap text-[15px] leading-7">{s.plotTwist}</p></CardContent></Card>
            <Card className="mt-4"><CardHeader><CardTitle className="text-base">Climax</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap text-[15px] leading-7">{s.climax}</p></CardContent></Card>
            <Card className="mt-4"><CardHeader><CardTitle className="text-base">Ending</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap text-[15px] leading-7">{s.ending}</p></CardContent></Card>
            <Card className="mt-4"><CardHeader><CardTitle className="text-base">Why the twist works</CardTitle></CardHeader><CardContent><p className="text-sm">{s.twistExplanation}</p><ul className="mt-2 list-disc pl-5 text-sm">{(s.foreshadowing ?? []).map((f: string, i: number) => <li key={i}>{f}</li>)}</ul></CardContent></Card>
          </>
        )}
      </main>
    </div>
  );
}
