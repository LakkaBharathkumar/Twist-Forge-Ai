import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();
  const res = NextResponse.next();
  const supabase = createServerClient(url, key, {
    cookies: { getAll: () => req.cookies.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => res.cookies.set(name, value, options)) },
  });
  await supabase.auth.getUser();
  return res;
}
export const config = { matcher: ["/dashboard/:path*", "/stories/:path*", "/favorites/:path*", "/settings/:path*"] };
