"use strict";
import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";
import { useSearchParams, useNavigate } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Trash, Loader2, Heart } from "lucide-react";
import { useDebounce } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TwistForge AI — Favorites",
  description: "Your favorite stories — the twists you've marked as favorites.",
};

export default function FavoritesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFavorites() {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }
        setLoading(true);
        let query = supabase.from("stories").select("*", { count: "exact" }).eq("user_id", user.id).eq("is_favorite", true);

        if (debouncedSearch) {
          query = query.or(`title.ilike.%${debouncedSearch}%,premise.ilike.%${debouncedSearch}%`);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error, count } = await query;
        if (error) throw error;
        setStories(data || []);
        setTotal(count || 0);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, [searchQuery]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border bg-muted/50 p-6 flex items-center justify-center">
              <Loader2 className="animate-spin size-8" />
            </div>
            <div className="rounded-2xl border bg-muted/50 p-6 flex items-center justify-center">
              <Loader2 className="animate-spin size-8" />
            </div>
            <div className="rounded-2xl border bg-muted/50 p-6 flex items-center justify-center">
              <Loader2 className="animate-spin size-8" />
            </div>
            <div className="rounded-2xl border bg-muted/50 p-6 flex items-center justify-center">
              <Loader2 className="animate-spin size-8" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-6">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Favorites</h1>
          <p className="text-muted-foreground mt-1">Your most memorable plot twists</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-xl bg-card p-2">
            <p className="text-xs text-muted-foreground">Favorite Stories</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>
        </div>

        {/* Stories */}
        {stories.length === 0 && !loading && (
          <div className="py-12 text-center text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-4" />
            <p>No favorite stories yet. <Link href="/generate" className="font-medium">Generate and save stories</Link> to mark them as favorites.</p>
          </div>
        )}

        {stories.length > 0 && (
          <div className="grid gap-4" role="list">
            {stories.map((story) => (
              <div key={story.id} className="rounded-xl border p-4 hover:transition-colors hover:bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{story.genre || "Mystery"}</Badge>
                  <span className="text-xs text-muted-foreground">{story.twist_type || "Random"}</span>
                </div>
                <h3 className="font-medium line-clamp-2">{story.title || "Untitled"}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {story.premise ? story.premise.substring(0, 80) + "..." : "No premise"}
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Created: {new Date(story.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}