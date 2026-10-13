import { NextRequest, NextResponse } from "next/server";
import { getSession, getStories, getFavoriteStories } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const favOnly = searchParams.get("fav") === "1";
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ totals: { total: 0, saved: 0, favorites: 0, week: 0 }, recent: [], genres: [], unauthenticated: true });
    }
    const { data, error } = await (async () => {
      const stories = getStories();
      const favorites = getFavoriteStories();
      const weekAgo = Date.now() - 7 * 864e5;
      const rows = stories;
      const genres = [...new Set(rows.map((r: any) => r.genre))].slice(0, 8);
      return {
        totals: { total: rows.length, saved: rows.length, favorites: favorites.length, week: rows.filter((r: any) => new Date(r.created_at).getTime() > weekAgo).length },
        recent: rows.slice(0, 5), genres,
        activity: [...Array(7)].map((_, i) => {
          const d = new Date(Date.now() - (6 - i) * 864e5);
          const key = d.toISOString().slice(0, 10);
          return { day: key, count: rows.filter((r: any) => r.created_at.slice(0, 10) === key).length };
        }),
      };
    })();
    return NextResponse.json({ totals: data.totals, recent: data.recent, genres: data.genres, activity: data.activity, authenticated: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Stats failed" }, { status: 500 });
  }
}