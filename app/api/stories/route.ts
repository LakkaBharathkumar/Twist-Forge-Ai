import { NextRequest, NextResponse } from "next/server";
import { getSession, getStories, saveStory, deleteStory, toggleFavorite, getFavoriteStories } from "@/lib/storage";

// Simple in-memory rate limiter for demo purposes
const rateLimitMap = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(key, { count: 1, reset: now + 60_000 });
    return { ok: true, remaining: 14 };
  }
  entry.count += 1;
  if (entry.count > 15) return { ok: false, remaining: 0 };
  return { ok: true, remaining: MAX_REQ - entry.count };
}

const MAX_REQ = 15;

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || "list";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const rl = rateLimit(`gen:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: "Rate limit exceeded. Wait a minute and retry." }, { status: 429 });

  try {
    if (action === "stats") {
      const session = getSession();
      const stories = getStories();
      const favorites = getFavoriteStories();
      const weekAgo = Date.now() - 7 * 864e5;
      
      const total = stories.length;
      const saved = total; // All stories are "saved" in localStorage demo
      const favoritesCount = favorites.length;
      const week = stories.filter((r) => new Date(r.created_at).getTime() > weekAgo).length;

      return NextResponse.json({
        totals: { total, saved, favorites: favoritesCount, week },
        recent: stories.slice(0, 5),
        favorites: favoritesCount,
        activity: [...Array(7)].map((_, i) => {
          const d = new Date(Date.now() - (6 - i) * 864e5);
          const key = d.toISOString().slice(0, 10);
          return { day: key, count: stories.filter((r) => r.created_at.slice(0, 10) === key).length };
        }),
      });
    }

    if (action === "list") {
      const session = getSession();
      if (!session) {
        return NextResponse.json({ error: "Not authenticated. Log in to load stories.", unauthenticated: true });
      }
      const stories = getStories().filter((s) => s.user_id === session.id || true); // All stories in demo
      const genre = searchParams.get("genre") || "";
      const twist = searchParams.get("twist") || "";
      const fav = searchParams.get("fav") || "";
      const sort = searchParams.get("sort") || "newest";
      const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
      const per = Math.min(24, Math.max(1, parseInt(searchParams.get("per") || "9", 10)));

      let query = stories;
      if (genre) query = query.filter((s: any) => s.genre === genre);
      if (twist) query = query.filter((s: any) => s.twist_type === twist);
      if (fav === "1") query = query.filter((s: any) => s.is_favorite);

      // Sorting
      if (sort === "oldest") {
        query = [...query].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      } else if (sort === "title") {
        query = [...query].sort((a: any, b: any) => a.title.localeCompare(b.title));
      } else {
        query = [...query].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      // Pagination
      const start = (page - 1) * per;
      const end = start + per;
      const pageData = query.slice(start, end);

      return NextResponse.json({ data: pageData, total: stories.length, page, per });
    }

    // Get single story
    const id = searchParams.get("id") || "";
    if (id) {
      const stories = getStories();
      const story = stories.find((s: any) => s.id === id);
      if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ data: story });
    }

    return NextResponse.json({ data: [], total: 0, page: 1, per: 9 });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json({ error: "Failed to load stories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
    const rl = rateLimit(`gen:${ip}`);
    if (!rl.ok) return NextResponse.json({ error: "Rate limit exceeded. Wait a minute and retry." }, { status: 429 });

    const body = await req.json();
    const session = getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated. Log in to save stories." }, { status: 401 });
    }

    const action = body.action || "complete";

    if (action === "save" || action === "create") {
      const story = body.story_content || body;
      const savedStory = saveStory({
        id: body.id || `story_${Date.now()}`,
        title: story.title || "Untitled",
        premise: story.premise || "",
        genre: story.genre || "Mystery",
        tone: story.tone || "Suspenseful",
        twist_type: story.twist_type || "Random",
        story_content: story.story_content || {},
        is_favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: session.id,
      });

      // Add to generation history conceptually
      return NextResponse.json({ data: savedStory });
    }

    if (action === "favorite") {
      const { id, favorite } = body;
      const result = toggleFavorite(id);
      return NextResponse.json({ data: { id, wasFavorite: !result.nowFavorite, nowFavorite: result.nowFavorite } });
    }

    if (action === "delete") {
      const { id } = body;
      deleteStory(id);
      return NextResponse.json({ ok: true });
    }

    if (action === "get-favorites") {
      const favorites = getFavoriteStories();
      return NextResponse.json({ data: favorites });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("API POST error:", e);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const session = getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id, updates } = body;
    if (!id) return NextResponse.json({ error: "Missing story ID" }, { status: 400 });

    const story = updateStory(id, {
      title: updates?.title,
      premise: updates?.premise,
      genre: updates?.genre,
      tone: updates?.tone,
      twist_type: updates?.twist_type,
      story_content: updates?.story_content,
      is_favorite: updates?.is_favorite,
      updated_at: new Date().toISOString(),
    });

    if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });
    return NextResponse.json({ data: story });
  } catch (e) {
    console.error("API PATCH error:", e);
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const session = getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = body;
    if (!id) return NextResponse.json({ error: "Missing story ID" }, { status: 400 });

    deleteStory(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("API DELETE error:", e);
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
  }
}