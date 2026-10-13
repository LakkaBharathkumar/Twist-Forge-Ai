"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/server"; // Keep import but won't use
import { toast } from "sonner";
import { Sparkles, Loader2, Clock } from "lucide-react";
import { getSession, getStories } from "@/lib/storage";

export function RecentStoriesSection({ recent }: { recent?: any[] }) {
  const [localRecent, setLocalRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchRecent() {
      try {
        const session = getSession();
        setUser(session);
        if (!session) {
          setLocalRecent([]);
          setLoading(false);
          return;
        }
        const stories = getStories().filter((s: any) => s.user_id === session.id);
        setLocalRecent(stories.slice(0, 5).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setLoading(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load recent stories");
        setLoading(false);
      }
    }
    fetchRecent();
  }, []);

  const items = localRecent.length > 0 ? localRecent : (recent || []);

  if (loading) {
    return (
      <Card className="py-8">
        <CardHeader><CardTitle>Recent Stories</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin size-4" />
          <span className="mx-2">Loading recent stories...</span>
        </CardContent>
      </Card>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card className="py-8">
        <CardHeader><CardTitle>Recent Stories</CardTitle></CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>No stories yet. <Link href="/generate" className="font-medium">Generate your first story</Link> to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles size={14} /> Recent Stories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((story) => (
          <div key={story.id} className="flex items-center gap-3 hover:bg-muted/30 transition-colors p-3 rounded">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
              <Sparkles size={14} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{story.title || "Untitled"}</p>
              <p className="text-xs text-muted-foreground truncate">{story.premise ? story.premise.substring(0, 60) + "..." : "No premise"}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {story.created_at ? new Date(story.created_at).toLocaleDateString() : "—"}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}