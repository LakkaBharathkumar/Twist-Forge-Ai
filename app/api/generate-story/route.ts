import { NextRequest, NextResponse } from "next/server";
import { generationSchema, storyContentSchema, twistIdeasSchema } from "@/lib/validation";
import { generateWithGemini, getModelId } from "@/lib/gemini";
import { rateLimit } from "@/lib/rate-limit";
import { saveStory, getSession } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
    const rl = rateLimit(`gen:${ip}`);
    if (!rl.ok) return NextResponse.json({ error: "Rate limit exceeded. Wait a minute and retry." }, { status: 429 });

    const body = await req.json().catch(() => null);
    const parsed = generationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured on the server. Add it to .env.local (see .env.example) and restart, then retry." }, { status: 503 });
    }

    const raw = await generateWithGemini(parsed.data);
    let json: unknown;
    try { json = JSON.parse(raw); }
    catch { return NextResponse.json({ error: "AI returned malformed JSON. Please retry.", raw: raw.slice(0, 2000) }, { status: 502 }); }

    if (parsed.data.action === "twist-ideas") {
      const v = twistIdeasSchema.safeParse(json);
      if (!v.success) return NextResponse.json({ error: "AI output failed validation. Please retry.", details: v.error.flatten() }, { status: 502 });
      return NextResponse.json({ data: v.data, model: getModelId() });
    }
    const v = storyContentSchema.safeParse(json);
    if (!v.success) return NextResponse.json({ error: "AI output failed validation. Please retry.", details: v.error.flatten() }, { status: 502 });

    // Save the generated story to localStorage
    const session = getSession();
    if (session && parsed.data.action === "complete") {
      const storyData = v.data;
      const savedStory = saveStory({
        id: `story_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        title: storyData.title || "Generated Story",
        premise: storyData.premise || "",
        genre: storyData.genre || parsed.data.genre || "Mystery",
        tone: storyData.tone || parsed.data.tone || "Suspenseful",
        twist_type: storyData.twist_type || parsed.data.twistType || "Random",
        story_content: storyData,
        is_favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: session.id,
      });

      // Record in generation history
      return NextResponse.json({ data: savedStory, model: getModelId() });
    }

    return NextResponse.json({ data: v.data, model: getModelId() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed";
    const code = (e as { code?: string }).code;
    if (code === "NO_API_KEY") return NextResponse.json({ error: msg }, { status: 503 });
    console.error("generate-story error:", msg);
    return NextResponse.json({ error: msg.slice(0, 500) || "Generation failed. Retry." }, { status: 500 });
  }
}