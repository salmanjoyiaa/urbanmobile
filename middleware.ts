import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, user, response } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Public routes — no auth required
  if (
    pathname === "/" ||
    pathname.startsWith("/properties") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/api/visits") ||
    pathname.startsWith("/api/leads") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return response;
  }

  // Auth pages — redirect to dashboard if already logged in
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single() as { data: { role: string } | null };

      if (profile?.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (profile?.role === "agent") {
        return NextResponse.redirect(new URL("/agent", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
    return response;
  }

  // Callback route — always allow
  if (pathname.startsWith("/callback")) {
    return response;
  }

  // Protected routes — require auth
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Role-based access control
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single() as { data: { role: string } | null };

  const role = profile?.role;

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return response;
  }

  // Agent routes
  if (pathname.startsWith("/agent")) {
    if (role !== "agent") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if agent is approved
    const { data: agent } = await supabase
      .from("agents")
      .select("status")
      .eq("profile_id", user.id)
      .single() as { data: { status: string } | null };

    if (!agent || agent.status !== "approved") {
      if (!pathname.startsWith("/pending-approval")) {
        return NextResponse.redirect(
          new URL("/pending-approval", request.url)
        );
      }
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
