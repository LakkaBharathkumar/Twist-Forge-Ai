export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-bold">Privacy</h1>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        TwistForge AI stores your account and saved stories in your own Supabase project, protected by
        Row Level Security so each user can access only their own records. Story ideas you submit are sent
        to Google Gemini to generate output. Do not submit passwords, API keys, or other secrets in story
        prompts. Contact the site operator for data deletion requests.
      </p>
    </main>
  );
}
