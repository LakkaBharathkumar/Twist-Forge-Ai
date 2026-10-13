"use strict";
import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserMetadataSchema } from "@/lib/validation";
import { Clipboard } from "lucide-react";
import { Check } from "lucide-react";
import { getSession, logout, clearAllData } from "@/lib/storage";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TwistForge AI — Settings",
  description: "User preferences and account settings.",
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<string>("dark");
  const [generationDefaults, setGenerationDefaults] = useState<{
    genre: string;
    tone: string;
    length: string;
    audience: string;
    twistType: string;
    intensity: string;
    endingStyle: string;
  }>({
    genre: "Mystery",
    tone: "Suspenseful",
    length: "Short",
    audience: "Teens",
    twistType: "Random",
    intensity: "Surprising",
    endingStyle: "Shocking",
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const session = getSession();
        setUser(session || null);
        setTheme(session?.displayName ? "dark" : "system");
        
        // Load generation defaults from localStorage or session
        const saved = localStorage.getItem("twistforge:defaults");
        if (saved) {
          const d = JSON.parse(saved);
          setGenerationDefaults(d);
        } else {
          // Use session defaults
          setGenerationDefaults({
            genre: session?.preferences?.genre || "Mystery",
            tone: session?.preferences?.tone || "Suspenseful",
            length: session?.preferences?.length || "Short",
            audience: session?.preferences?.audience || "Teens",
            twistType: session?.preferences?.twistType || "Random",
            intensity: session?.preferences?.intensity || "Surprising",
            endingStyle: session?.preferences?.endingStyle || "Shocking",
          });
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load user");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const onThemeChange = (e: React.Event) => {
    setTheme(e.target.value);
    // Store preference in localStorage
    localStorage.setItem("twistforge:theme", e.target.value);
    toast.success("Theme updated");
  };

  const onDefaultsChange = (values: any) => {
    localStorage.setItem("twistforge:defaults", JSON.stringify(values));
    setGenerationDefaults(values);
    toast.success("Generation defaults saved");
  };

  const handleLogin = async (email: string, displayName: string) => {
    const session = login(email, displayName);
    setUser(session);
    router.push("/dashboard");
    router.refresh();
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
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your preferences and generation defaults</p>
        </header>

        <Card>
          <CardHeader><CardTitle>Theme</CardTitle></CardHeader>
          <CardContent>
            <label className="flex items-center gap-2 text-sm">
              <Input
                type="hidden"
                name="theme"
                value={theme}
                onChange={onThemeChange}
                required
              />
              <span className="text-muted-foreground">Appearance</span>
            </label>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                value="light"
                onClick={onThemeChange}
                className={cn("group", theme === "light" ? "bg-light-foreground" : "")}
              >
                Light
              </Button>
              <Button
                variant="outline"
                value="dark"
                onClick={onThemeChange}
                className={cn("group", theme === "dark" ? "bg-dark-foreground" : "")}
              >
                Dark
              </Button>
              <Button
                variant="outline"
                value="system"
                onClick={onThemeChange}
                className={cn("group", theme === "system" ? "bg-system-foreground" : "")}
              >
                System
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Generation Defaults</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select
              defaultValue={generationDefaults.genre}
              onValueChange={(value: string) => {
                onDefaultsChange({ ...generationDefaults, genre: value });
              }}
            >
              <option value="Mystery">Mystery</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Horror">Horror</option>
              <option value="Thriller">Thriller</option>
              <option value="Romance">Romance</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
              <option value="Adventure">Adventure</option>
              <option value="Psychological">Psychological</option>
              <option value="Custom">Custom</option>
            </Select>

            <Select
              defaultValue={generationDefaults.tone}
              onValueChange={(value: string) => {
                onDefaultsChange({ ...generationDefaults, tone: value });
              }}
            >
              <option value="Suspenseful">Suspenseful</option>
              <option value="Dark">Dark</option>
              <option value="Emotional">Emotional</option>
              <option value="Funny">Funny</option>
              <option value="Wholesome">Wholesome</option>
              <option value="Mysterious">Mysterious</option>
              <option value="Inspirational">Inspirational</option>
            </Select>

            <Select
              defaultValue={generationDefaults.length}
              onValueChange={(value: string) => {
                onDefaultsChange({ ...generationDefaults, length: value });
              }}
            >
              <option value="Flash Fiction">Flash Fiction</option>
              <option value="Short">Short</option>
              <option value="Medium">Medium</option>
              <option value="Long">Long</option>
            </Select>

            <Select
              defaultValue={generationDefaults.audience}
              onValueChange={(value: string) => {
                onDefaultsChange({ ...generationDefaults, audience: value });
              }}
            >
              <option value="Children">Children</option>
              <option value="Teens">Teens</option>
              <option value="Adults">Adults</option>
            </Select>

            <Select
              defaultValue={generationDefaults.twistType}
              onValueChange={(value: string) => {
                onDefaultsChange({ ...generationDefaults, twistType: value });
              }}
            >
              <option value="Random">Random</option>
              <option value="Secret Identity">Secret Identity</option>
              <option value="Betrayal">Betrayal</option>
              <option value="Unreliable Narrator">Unreliable Narrator</option>
              <option value="Hidden Connection">Hidden Connection</option>
              <option value="False Victory">False Victory</option>
              <option value="Time Loop">Time Loop</option>
              <option value="Red Herring">Red Herring</option>
              <option value="Unexpected Villain">Unexpected Villain</option>
              <option value="Reality Reversal">Reality Reversal</option>
            </Select>

            <Select
              defaultValue={generationDefaults.intensity}
              onValueChange={(value: string) => {
                onDefaultsChange({ ...generationDefaults, intensity: value });
              }}
            >
              <option value="Mild">Mild</option>
              <option value="Surprising">Surprising</option>
              <option value="Mind-Blowing">Mind-Blowing</option>
            </Select>

            <Select
              defaultValue={generationDefaults.endingStyle}
              onValueChange={(value: string) => {
                onDefaultsChange({ ...generationDefaults, endingStyle: value });
              }}
            >
              <option value="Happy">Happy</option>
              <option value="Tragic">Tragic</option>
              <option value="Ambiguous">Ambiguous</option>
              <option value="Bittersweet">Bittersweet</option>
              <option value="Shocking">Shocking</option>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">User ID: {user?.id || "not logged in"}</p>
            <Button
              variant="outline"
              onClick={() => router.push("/login")}
            >
              Log out
            </Button>
            {user && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete your account?")) {
                    clearAllData();
                    router.push("/");
                    router.refresh();
                    toast.success("Account data cleared");
                  }
                }}
              >
                Delete Account
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}