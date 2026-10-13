"use strict";
import { DashboardStatsCard } from "@/components/dashboard/stats-cards";
import { RecentStoriesSection } from "@/components/dashboard/recent-stories";
import { QuickGenerateForm } from "@/components/dashboard/quick-generate";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession, getStories } from "@/lib/storage";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TwistForge AI — Dashboard",
  description: "Your story dashboard — generate, save, and manage your plot twists.",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const session = getSession();
        setUser(session || null);
        
        if (session) {
          const stories = getStories().filter((s: any) => s.user_id === session.id);
          setRecent(stories.slice(0, 5));
          
          const weekAgo = Date.now() - 7 * 864e5;
          const week = stories.filter((s: any) => new Date(s.created_at).getTime() > weekAgo).length;
          
          setStats({
            total: stories.length,
            saved: stories.length,
            favorites: stories.filter((s: any) => s.is_favorite).length,
            week,
          });
        }
        setLoading(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load dashboard");
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border bg-muted/50 p-6 flex items-center justify-center">
              <Loader2 className="animate-spin rounded-full size-8 border-b-2 border-current" />
            </div>
            <div className="rounded-2xl border bg-muted/50 p-6 flex items-center justify-center">
              <Loader2 className="animate-spin rounded-full size-8 border-b-2 border-current" />
            </div>
            <div className="rounded-2xl border bg-muted/50 p-6 flex items-center justify-center">
              <Loader2 className="animate-spin rounded-full size-8 border-b-2 border-current" />
            </div>
            <div className="rounded-2xl border bg-muted/50 p-6 flex items-center justify-center">
              <Loader2 className="animate-spin rounded-full size-8 border-b-2 border-current" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4">
        {user ? (
          <DashboardStatsCard stats={stats} />
        ) : (
          <div className="alert alert-warning">
            <p>Please <Link href="/login">log in</Link> to view your dashboard.</p>
          </div>
        )}
        <RecentStoriesSection recent={recent} />
        <QuickGenerateForm />
      </div>
    </main>
  );
}