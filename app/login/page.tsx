"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = isSupabaseConfigured();
  const googleConfigured = Boolean(process.env.NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH === "1");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      toast.error("Supabase is not configured. Set env vars per .env.example.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Logged in");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-14">
      <Card>
        <CardHeader>
          <CardTitle>Log in to TwistForge AI</CardTitle>
          <p className="text-sm text-muted-foreground">
            Save stories permanently. Guests can still try the{" "}
            <Link href="/generate" className="underline">demo generator</Link>.
          </p>
        </CardHeader>
        <CardContent>
          {!configured && (
            <p className="mb-4 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              Auth is unavailable: <code>NEXT_PUBLIC_SUPABASE_URL</code> /{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are not set. See README for setup.
            </p>
          )}
          <button
            onClick={google}
            disabled={!configured || !googleConfigured}
            title={googleConfigured ? "Sign in with Google" : "Google OAuth not configured"}
            className="mb-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border text-sm font-medium disabled:opacity-50"
          >
            {googleConfigured ? "Continue with Google" : "Google sign-in — setup required (see README)"}
          </button>
          <form onSubmit={login} className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button className="w-full" disabled={busy || !configured}>{busy ? "Logging in…" : "Log in"}</Button>
          </form>
          <div className="mt-4 flex justify-between text-sm">
            <Link href="/signup" className="underline">Create account</Link>
            <Link href="/forgot-password" className="underline">Forgot password?</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
