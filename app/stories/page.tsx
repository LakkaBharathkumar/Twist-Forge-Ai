"use strict";
import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";
import { useSearchParams, useNavigate } from "next/navigation";
import Link from "next/link";
import { useNavigate as useNavigateHook } from "react-router-dom";
import { createClient } from "@/lib/supabase/server";
import { storyContentSchema } from "@/lib/validation";
import { storiesToCsv } from "@/lib/export";
import { useDebounce } from "@/lib/utils";
import { getSession, getStories, getFavoriteStories, toggleFavorite, saveStory, deleteStory } from "@/lib/storage";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TwistForge AI — My Stories",
  description: "Your story library — view, search, filter, and manage your generated stories.",
};

export default function StoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedTwist, setSelectedTwist] = useState("");
  const [selectedFavorite, setSelectedFavorite] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [csvExport, setCsvExport] = useState<string | null>(null);
  const navigate = useNavigateHook();
  const [user, setUser] = useState<any>(null);

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    async function loadStories() {
      try {
        const session = getSession();
        setUser(session);
        if (!session) {
          navigate("/login");
          return;
        }
        setLoading(true);
        const allStories = getStories().filter((s: any) => s.user_id === session.id);
        
        setStories(allStories);
        setTotal(allStories.length);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load stories");
      } finally {
        setLoading(false);
      }
    }
    loadStories();
  }, [searchQuery, selectedGenre, selectedTwist, selectedFavorite, page, perPage, sortBy]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    setDeleting(id);
    try {
      deleteStory(id);
      await loadStories();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const handleFavoriteToggle = async (id: string, currentFavorite: boolean) => {
    try {
      const result = toggleFavorite(id);
      await loadStories();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update favorite");
    }
  };

  const handleCsvExport = async () => {
    try {
      const session = getSession();
      if (!session) return;
      const allStories = getStories().filter((s: any) => s.user_id === session.id);
      const csv = storiesToCsv(allStories.map((r: any) => ({
        id: r.id,
        title: r.title || "",
        genre: r.genre || "",
        twist_type: r.twist_type || "",
        premise: r.premise || "",
        is_favorite: r.is_favorite,
        created_at: r.created_at || "",
      })));
      setCsvExport(csv);
      // Trigger download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "twistforge-stories.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "CSV export failed");
    }
  };

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
          <h1 className="text-3xl font-bold">My Stories</h1>
          <p className="text-muted-foreground mt-1">Your generated plot twists and saved stories</p>
        </header>

        {/* Filters and actions bar */}
        <div className="card mb-4">
          <div className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center sm:justify-between">
            <div className="flex-1 sm:order-2">
              <Search className="w-6 h-6 mr-2 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 sm:order-1"
              />
            </div>
            <div className="flex gap-2 sm:order-1">
              <Select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
                <option value="">All genres</option>
                {["Fantasy", "Horror", "Mystery", "Thriller", "Romance", "Sci-Fi", "Comedy", "Drama", "Adventure", "Psychological"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </Select>
              <Select value={selectedTwist} onChange={(e) => setSelectedTwist(e.target.value)}>
                <option value="">All twist types</option>
                {["Secret Identity", "Betrayal", "Unreliable Narrator", "Hidden Connection", "False Victory", "Time Loop", "Red Herring", "Unexpected Villain", "Reality Reversal", "Random"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
              <Select value={selectedFavorite} onChange={(e) => setSelectedFavorite(e.target === "1")}>
                <option value="">All</option>
                <option value="1">Favorites only</option>
                <option value="">Non-favorites</option>
              </Select>
            </div>
            <div className="flex gap-2 sm:order-0">
              <Button onClick={() => setViewMode("grid")} variant="outline" size="sm">
                <Loader2 className="inline mt-[1px]" /> Grid
              </Button>
              <Button onClick={() => setViewMode("list")} variant="outline" size="sm">
                <Heart className="inline mt-[1px]" /> List
              </Button>
              <Button onClick={handleCsvExport} variant="secondary" size="sm">
                <FileDown className="inline mr-1" /> CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Stories grid/list */}
        {stories.length === 0 && !loading && (
          <div className="py-12 text-center text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4" />
            <p>No stories found. <Link href="/generate" className="font-medium">Generate your first story</Link>.</p>
          </div>
        )}

        {stories.length > 0 && (
          <div className="grid gap-4" role="list">
            {stories.map((story) => {
              const isGrid = viewMode === "grid";
              const cardClass = isGrid
                ? "group rounded-xl border p-4 hover:transition-colors hover:bg-muted/30"
                : "p-4 border-b last:border-0 last:pb-4";
              const titleClass = isGrid ? "font-medium text-sm" : "font-bold text-lg";
              const metaClass = isGrid ? "text-xs text-muted-foreground" : "text-sm text-muted-foreground";
              const actionClass = isGrid ? "flex gap-1 text-sm" : "flex gap-2 text-xs";

              return (
                <div key={story.id} className={cardClass} role="listitem">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{story.genre || "Mystery"}</Badge>
                    <span className="text-xs text-muted-foreground">{story.twist_type || "Random"}</span>
                  </div>
                  <h3 className={titleClass} className="line-clamp-2">
                    {story.title || "Untitled"}
                  </h3>
                  <p className={metaClass} className="line-clamp-1">
                    {story.premise ? story.premise.substring(0, 80) + "..." : "No premise"}
                  </p>
                  <div className={actionClass}>
                    <span className={metaClass}>
                      {new Date(story.created_at).toLocaleDateString()}
                    </span>
                    <span className={metaClass}>
                      {story.is_favorite ? "★ Favorite" : "Add to favorites"}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleFavoriteToggle(story.id, story.is_favorite)}
                      aria-label={story.is_favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      {story.is_favorite ? <Heart className="text-red-500" /> : <Heart className="text-gray-300" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(`/stories/${story.id}`)}
                      aria-label="View story details"
                    >
                      <Sparkles className="inline" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(story.id)}
                      aria-label="Delete story"
                      disabled={deleting === story.id}
                    >
                      {deleting === story.id ? (
                        <Loader2 className="animate-spin size-3" />
                      ) : (
                        <Trash className="inline" />
                      )
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {total > perPage && (
          <div className="mt-6 flex justify-center">
            <nav className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <Button
                  key={i}
                  variant={i === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(i)}
                >
                  {i}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(page + 1, Math.ceil(total / perPage)))}
              >
                Next
              </Button>
            </nav>
          </div>
        )}
      </div>
    </main>
  );
}