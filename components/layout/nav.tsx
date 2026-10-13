"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, LayoutDashboard, PenLine, Library, Heart, LayoutTemplate, Settings, Menu, X, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Generate Story", icon: PenLine },
  { href: "/stories", label: "My Stories", icon: Library },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/templates", label: "Story Templates", icon: LayoutTemplate },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    createClient().auth.getSession().then(({ data }) => setLoggedIn(Boolean(data.session))).catch(() => {});
  }, [pathname]);
  async function logout() {
    try { await createClient().auth.signOut(); } catch { /* ignore */ }
    setLoggedIn(false);
    router.push("/");
    router.refresh();
  }
  const inApp = links.some((l) => pathname.startsWith(l.href));
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur no-print">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 text-white"><Sparkles size={18} /></span>
          TwistForge AI
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {!inApp ? (
            <>
              <Link href="/#how" className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">How it works</Link>
              <Link href="/templates" className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">Templates</Link>
              <Link href="/generate" className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">Generator</Link>
              {loggedIn ? (
                <button onClick={logout} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">Log out</button>
              ) : (
                <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">Log in</Link>
              )}
              <Link href="/generate"><Button size="sm">Generate My Story</Button></Link>
            </>
          ) : (
            links.map((l) => (
              <Link key={l.href} href={l.href} className={cn("rounded-lg px-3 py-2 text-sm", pathname.startsWith(l.href) ? "bg-muted font-semibold" : "text-muted-foreground hover:bg-muted")}>{l.label}</Link>
            ))
          )}
          <ThemeToggle />
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button size="icon" variant="outline" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</Button>
        </div>
      </div>
      {open && (
        <nav className="border-t px-4 py-2 md:hidden">
          {[...links, { href: "/login", label: "Log in", icon: LogOut }].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted">
              <l.icon size={16} /> {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 border-r p-4 md:block no-print">
      <nav className="space-y-1">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={cn("flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm", pathname.startsWith(l.href) ? "bg-muted font-semibold" : "text-muted-foreground hover:bg-muted")}>
            <l.icon size={16} /> {l.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6 rounded-xl border bg-gradient-to-br from-violet-600/15 to-blue-500/15 p-4 text-sm">
        <p className="font-semibold">Every story deserves an unexpected ending.</p>
        <Link href="/generate" className="mt-2 inline-block"><Button size="sm">New story</Button></Link>
      </div>
    </aside>
  );
}
