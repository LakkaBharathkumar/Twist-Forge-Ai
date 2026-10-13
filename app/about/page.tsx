import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-bold">About TwistForge AI</h1>
      <p className="mt-4 text-muted-foreground">
        TwistForge AI helps students, writers, and creators turn a simple idea into an unforgettable
        short story with an unexpected ending. Enter an idea, customize genre, twist type, tone, and
        length, and Gemini drafts a structured story with foreshadowing and alternative twists.
      </p>
      <p className="mt-4 text-muted-foreground">
        Built with Next.js, Tailwind CSS, shadcn-style components, Supabase, and Google Gemini.
      </p>
      <Link href="/generate" className="mt-6 inline-block underline">Try the generator →</Link>
    </main>
  );
}
