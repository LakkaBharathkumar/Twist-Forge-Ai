# TwistForge AI — Short Story Plot Twist Generator

> Every story deserves an unexpected ending.

AI-powered short-story workspace: generate complete structured stories with surprising twists (Gemini), explore twist ideas, save/favorite/search your library (Supabase), and export to TXT / Markdown / CSV.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn-style primitives + Lucide icons + `next-themes` + `sonner` toasts
- Supabase (Postgres + Auth + RLS) via `@supabase/ssr`
- Google Gemini via `@google/genai`
- Zod validation, Vitest tests

## Project structure

```
app/                      pages + layouts
  api/generate-story/     Gemini endpoint (server-only key, Zod, rate-limit)
  api/stories/            authenticated CRUD (ownership enforced)
  api/stats/              dashboard aggregates from real rows
  generate/               generator workspace
  stories/, stories/[id]/ library + detail + edit
  favorites/              favorites filter
  templates/              10 reusable templates → prefill generator
  dashboard/              real stats, recent, activity, genres
  login/ signup/ forgot-password/  auth UI
  settings/               profile, theme, generation defaults
  about/ privacy/ terms/ contact/
components/generator/     form, 8 generation actions, twist reveal, exports
components/layout/        header + sidebar + mobile nav
lib/gemini.ts             prompt builder + server Gemini call
lib/validation.ts         Zod schemas (input + AI output + save)
lib/export.ts             TXT / Markdown / CSV helpers
lib/supabase/             browser + server clients
lib/rate-limit.ts         per-IP throttle for /api/generate-story
supabase/migrations/      SQL schema + RLS
```

## Setup

### 1. Install

```bash
npm install
npm run dev   # http://localhost:3000
```

No Node runtime in this environment? Install Node 20+ first.

### 2. Environment

Copy `.env.example` → `.env.local`:

| Var | Where | Required |
|---|---|---|
| `GEMINI_API_KEY` | server only | yes, for generation |
| `GEMINI_MODEL` | server only | no (default `gemini-2.0-flash`) |
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | yes, for auth/save |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | only if you add admin jobs; not used by the app |
| `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH` | browser | `1` to enable the Google button |

Get a Gemini key: https://aistudio.google.com/apikey — any model available to your account works; set `GEMINI_MODEL` to change it without code edits (e.g. `gemini-2.0-flash`, `gemini-1.5-flash`).

### 3. Supabase

1. Create a project at https://supabase.com.
2. SQL Editor → run `supabase/migrations/0001_init.sql` (profiles, stories, generation_history, RLS, new-user trigger).
3. Authentication → Providers → enable Email. (Optional) enable Google with your OAuth client ID/secret, then set `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH=1`. Without it the Google button shows a disabled "setup required" state instead of breaking.
4. Authentication → URL Configuration → add `http://localhost:3000/auth/callback` and your Vercel URL `https://<app>.vercel.app/auth/callback`.
5. Copy Project URL + anon key into `.env.local`.

### 4. Tests

```bash
npm test
```

Covers Zod validation, TXT/Markdown/CSV export (incl. CSV escaping), and prompt construction.

### 5. Production build

```bash
npm run build
npm start
```

## Deployment (Vercel)

1. Push to GitHub (secrets stay out — `.env.local` is gitignored).
2. Vercel → New Project → import repo.
3. Environment Variables: add `GEMINI_API_KEY`, `GEMINI_MODEL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and callback URL in Supabase as above).
4. Deploy. Verify:
   - [ ] Landing + dashboard render on mobile + desktop
   - [ ] Generator validates short ideas, disables double-submit, shows progress + retry on error
   - [ ] Real Gemini output (not placeholders) across genres/twist types
   - [ ] Signup/login/logout/reset work; `/stories` without login returns 401 with a clear message
   - [ ] Save / edit / favorite / duplicate / delete persist; RLS prevents cross-user access
   - [ ] Search / filter / sort / pagination + CSV export work
   - [ ] Missing env vars show setup instructions, never stack traces or keys

## Demo vs. auth

Unauthenticated visitors can use the generator (subject to the per-IP rate limit: 15 req/min) but saving requires login — the API returns `401 Not authenticated. Log in to save stories.`

## Security notes

- `GEMINI_API_KEY` is read only in `lib/gemini.ts` (server). Never prefixed with `NEXT_PUBLIC_`.
- All `/api/stories*` routes check `supabase.auth.getUser()` and filter by `user_id`; RLS is a second layer.
- AI output is validated with Zod before render/save; malformed JSON returns HTTP 502 with a retry prompt.
- Generated content is rendered as plain text (no `dangerouslySetInnerHTML`).

## Milestones

1. Requirements & architecture ✓
2. Next.js + Tailwind UI ✓
3. Supabase persistence (`0001_init.sql` + CRUD + RLS) — run migration + set env to complete
4. Gemini integration (`/api/generate-story`) — set `GEMINI_API_KEY` to complete
5. Vercel deploy — follow steps above
