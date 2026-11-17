import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic check only (Next.js 16 "proxy", formerly middleware): send
 * visitors without a session cookie to sign in. Real authorization happens in
 * every page, Server Action and Route Handler (src/lib/auth/current.ts).
 * No case data ever goes in the redirect URL.
 */
export function proxy(request: NextRequest) {
  const hasLocal = request.cookies.has("rf_session");
  const hasSupabase = request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
  if (!hasLocal && !hasSupabase) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
