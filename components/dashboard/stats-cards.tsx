"use client";
import { cn } from "@/lib/utils";
import { Sparkles, Library, Heart, LayoutType } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { getSession, getStories } from "@/lib/storage";
import { toast } from "sonner";

export interface DashboardStats {
  total: number;
  saved: number;
  favorites: number;
  week: number;
}

export function DashboardStatsCard({ stats }: { stats?: DashboardStats }) {
  const [localStats, setLocalStats] = useState<DashboardStats | undefined>(undefined);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const session = getSession();
        setUser(session);
        if (!session) {
          setLocalStats(undefined);
          return;
        }
        const stories = getStories().filter((s: any) => s.user_id === session.id);
        const all = stories.length;
        const favs = stories.filter((s: any) => s.is_favorite).length;
        const weekAgo = Date.now() - 7 * 864e5;
        const week = stories.filter((s: any) => new Date(s.created_at).getTime() > weekAgo).length;
        setLocalStats({ total: all, saved: all, favorites: favs, week });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load stats");
      }
    }
    fetchStats();
  }, []);

  const statsToUse = localStats || stats || { total: 0, saved: 0, favorites: 0, week: 0 };

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <article
          className={cn(
            "rounded-2xl border bg-card px-5 py-4 hover:transition-colors hover:bg-muted/30",
            "group"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0">{/* Sparkles icon */}</div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                Total Stories Generated
              </p>
              <p className="mt-1 text-3xl font-extrabold">{statsToUse.total}</p>
            </div>
          </div>
        </article>
        <article
          className={cn(
            "rounded-2xl border bg-card px-5 py-4 hover:transition-colors hover:bg-muted/30",
            "group"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0">{/* Library icon */}</div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                Stories Saved
              </p>
              <p className="mt-1 text-3xl font-extrabold">{statsToUse.saved}</p>
            </div>
          </div>
        </article>
        <article
          className={cn(
            "rounded-2xl border bg-card px-5 py-4 hover:transition-colors hover:bg-muted/30",
            "group"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0">{/* Heart icon */}</div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                Favorite Stories
              </p>
              <p className="mt-1 text-3xl font-extrabold">{statsToUse.favorites}</p>
            </div>
          </div>
        </article>
        <article
          className={cn(
            "rounded-2xl border bg-card px-5 py-4 hover:transition-colors hover:bg-muted/30",
            "group"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0">{/* Clock icon */}</div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                This Week
              </p>
              <p className="mt-1 text-3xl font-extrabold">{statsToUse.week}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}