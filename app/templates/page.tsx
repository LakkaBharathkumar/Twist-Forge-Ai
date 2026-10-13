import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";
import { AppSidebar } from "@/components/layout/nav";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export default function TemplatesPage() {
  return (
    <div className="mx-auto flex max-w-7xl md:px-4">
      <AppSidebar />
      <main className="flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold md:text-3xl">Story Templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pick a starting point — fields auto-fill in the generator and everything stays editable.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => {
            const q = new URLSearchParams({
              idea: t.idea,
              genre: t.genre,
              twist: t.twistType,
              tone: t.tone,
              setting: t.setting,
              character: t.mainCharacter,
              template: t.title,
            }).toString();
            return (
              <Card key={t.slug}>
                <CardHeader><Badge>{t.genre} · {t.twistType}</Badge><CardTitle className="mt-2 text-base">{t.title}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t.idea}</p>
                  <Link href={`/generate?${q}`}><Button size="sm" className="mt-3">Use Template</Button></Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
