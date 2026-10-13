export default function Info({ title, body }: { title: string; body: string }) {
  return <main className="mx-auto max-w-3xl px-4 py-14"><h1 className="text-3xl font-bold">{title}</h1><p className="mt-4 text-muted-foreground">{body}</p></main>;
}
