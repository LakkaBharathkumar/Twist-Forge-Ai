"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/primitives";
import { Sparkles, Wand2, BookOpen, Eye, EyeOff, ArrowRight } from "lucide-react";

const EXAMPLES = [
  { title: "The Lighthouse Keeper", genre: "Mystery", setup: "A keeper logs ships that never arrive.", twist: "She has been dead for 40 years — the logbook is her unfinished confession, and the new keeper is her grandson." },
  { title: "Room 404", genre: "Sci-Fi", setup: "A hotel guest hears knocking from inside the walls.", twist: "The hotel is a memory vault, and he is the memory being deleted." },
  { title: "The Last Birthday", genre: "Drama", setup: "A father replays his daughter's birthday every year.", twist: "He is the one who never survived the crash — she keeps the ritual to remember him." },
];

const CATS = ["Secret Identity","Betrayal","Time Loop","Unreliable Narrator","Hidden Connection","Reality Reversal","False Victory","Unexpected Villain"];

export default function LandingPage() {
  const [revealed, setRevealed] = useState<number | null>(null);
  return (
    <main>
      <section className="hero-gradient border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <Badge>TwistForge AI · Powered by Gemini</Badge>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl">Your Next Plot Twist Starts Here.</h1>
            <p className="mt-4 text-lg text-muted-foreground">Turn a simple idea into an unforgettable short story. Generate surprising endings, unexpected betrayals, hidden identities, and mind-bending reveals with AI.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/generate"><Button size="lg"><Wand2 /> Generate My Story</Button></Link>
              <Link href="/templates"><Button size="lg" variant="outline">Explore Examples <ArrowRight /></Button></Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Every story deserves an unexpected ending. · Free demo, no signup needed to try.</p>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen size={18}/> Interactive preview</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm"><strong>Setup:</strong> A struggling street magician discovers his tricks started working for real yesterday.</p>
              {revealed === 0 ? (
                <p className="rounded-lg bg-muted p-3 text-sm"><strong>Twist:</strong> He isn&apos;t gaining powers — an audience member has been secretly doing real magic to make him believe, because she needs a successor before she vanishes.</p>
              ) : (
                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">The twist is hidden… click reveal to spoil it.</p>
              )}
              <Button onClick={() => setRevealed(revealed === 0 ? null : 0)} variant="outline" size="sm">{revealed === 0 ? <><EyeOff/> Hide twist</> : <><Eye/> Reveal Twist</>}</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-2xl font-bold md:text-3xl">How It Works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[["1. Enter an idea","Describe any setup — one line is enough. Try a character, a place, a strange event."],["2. Customize your story","Pick genre, twist type, intensity, tone, audience, length and ending style."],["3. Generate the twist","Get a complete structured story with foreshadowing and alternative twists."]].map(([t,d]) => (
            <Card key={t}><CardHeader><CardTitle className="text-base">{t}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{d}</p></CardContent></Card>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl font-bold md:text-3xl">Popular twist categories</h2>
          <div className="mt-5 flex flex-wrap gap-2">{CATS.map((c) => <Link key={c} href={`/generate?twist=${encodeURIComponent(c)}`}><Badge className="cursor-pointer hover:bg-accent px-3 py-1.5">{c}</Badge></Link>)}</div>
          <h2 className="mt-12 text-2xl font-bold md:text-3xl">Example stories</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {EXAMPLES.map((e, i) => (
              <Card key={e.title}>
                <CardHeader><Badge>{e.genre}</Badge><CardTitle className="mt-2 text-base">{e.title}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{e.setup}</p>
                  {revealed === i + 1 ? <p className="mt-3 rounded-lg bg-muted p-3 text-sm">{e.twist}</p> : null}
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setRevealed(revealed === i + 1 ? null : i + 1)}>{revealed === i + 1 ? "Hide twist" : "Reveal twist"}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-2xl font-bold md:text-3xl">Built for writers, students & creators</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[["Structured output","Title, premise, setup, rising action, twist, climax, ending, clues and why-it-works."],["Save & export","Library with search, favorites, TXT / Markdown / CSV export and print view."],["Classroom-ready","Twist types and intensity controls teach foreshadowing and story logic."]].map(([t,d]) => (
            <Card key={t}><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles size={16}/>{t}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{d}</p></CardContent></Card>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border bg-gradient-to-br from-violet-600/20 to-blue-500/20 p-8 text-center">
          <h3 className="text-2xl font-bold">Ready to forge your twist?</h3>
          <p className="mt-2 text-muted-foreground">Generate your first story in under 30 seconds.</p>
          <Link href="/generate" className="mt-4 inline-block"><Button size="lg">Generate My Story</Button></Link>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2026 TwistForge AI · Every story deserves an unexpected ending.</p>
          <nav className="flex gap-4">
            <Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
