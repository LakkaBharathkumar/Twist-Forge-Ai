"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const configured = isSupabaseConfigured();

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      toast.error("Supabase is not configured. Set env vars per .env.example.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Password reset email sent (if the account exists).");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-14">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={20} className="text-primary" />
            Reset password
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </CardHeader>
        <CardContent>
          {!configured && (
            <p className="mb-4 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              Auth is unavailable: <code>NEXT_PUBLIC_SUPABASE_URL</code> /{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are not set. See README for setup.
            </p>
          )}
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle size={40} className="text-green-500" />
              <p className="font-semibold">Check your email</p>
              <p className="text-sm text-muted-foreground">
                If an account exists for <strong>{email}</strong>, you&apos;ll receive a reset link shortly.
              </p>
              <Link href="/login">
                <Button variant="outline" size="sm" className="mt-2">
                  <ArrowLeft size={14} /> Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={reset} className="space-y-3">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <Button className="w-full" disabled={busy || !configured}>
                {busy ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          )}
          {!sent && (
            <p className="mt-4 text-sm">
              <Link href="/login" className="underline">
                <ArrowLeft size={12} className="inline" /> Back to login
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
