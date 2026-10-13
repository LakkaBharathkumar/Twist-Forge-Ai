"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured()) { toast.error("Supabase not configured. Add env vars per README."); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      const res = mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      if (res.error) throw res.error;
      toast.success(mode === "login" ? "Logged in" : "Account created — check email if confirmation is on");
      router.push("/dashboard"); router.refresh();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Auth failed"); }
    finally { setBusy(false); }
  }
  async function google() {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/dashboard` } });
      if (error) throw error;
    } catch { toast.error("Google sign-in is not configured. Enable it in Supabase Auth providers first."); }
  }
  return (
    <main className="mx-auto max-w-md px-4 py-14">
      <Card><CardHeader><CardTitle>{mode === "login" ? "Log in" : "Sign up"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</Button>
          </form>
          <Button variant="outline" className="mt-2 w-full" onClick={google}>Continue with Google (if configured)</Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login" ? <><Link href="/signup" className="underline">Need an account? Sign up</Link> · <Link href="/forgot-password" className="underline">Reset password</Link></> : <Link href="/login" className="underline">Have an account? Log in</Link>}
          </p>
          {!isSupabaseConfigured() && <p className="mt-3 rounded-lg bg-muted p-3 text-xs">Supabase env vars missing. Auth is wired but disabled until you add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example).</p>}
        </CardContent></Card>
    </main>
  );
}
