import { GeneratorWorkspace } from "@/components/generator/workspace";
import { AppSidebar } from "@/components/layout/nav";

interface Search {
  twist?: string;
  template?: string;
  idea?: string;
  genre?: string;
  tone?: string;
  setting?: string;
  character?: string;
}

export default async function GeneratePage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  return (
    <div className="mx-auto flex max-w-7xl gap-0 px-0 md:px-4">
      <AppSidebar />
      <main className="flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold md:text-3xl">Generate Story</h1>
        <p className="mt-1 text-sm text-muted-foreground">Powered by Gemini · structured, saveable output. {sp?.template ? `Template: ${sp.template}` : ""}</p>
        <div className="mt-6">
          <GeneratorWorkspace
            initialTwist={sp?.twist}
            initialIdea={sp?.idea}
            initialGenre={sp?.genre}
            initialTone={sp?.tone}
            initialSetting={sp?.setting}
            initialCharacter={sp?.character}
          />
        </div>
      </main>
    </div>
  );
}
