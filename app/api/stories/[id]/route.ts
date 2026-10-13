import { NextRequest, NextResponse } from "next/server";
import { getSession, getStories, updateStory, deleteStory } from "@/lib/storage";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const stories = getStories();
  const story = stories.find((s: any) => s.id === id);
  if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: story });
}

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await _req.json();
  const story = updateStory(id, {
    title: body.title,
    premise: body.premise,
    genre: body.genre,
    tone: body.tone,
    twist_type: body.twist_type,
    story_content: body.story_content,
    is_favorite: body.is_favorite,
    updated_at: new Date().toISOString(),
  });

  if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });
  return NextResponse.json({ data: story });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  deleteStory(id);
  return NextResponse.json({ ok: true });
}