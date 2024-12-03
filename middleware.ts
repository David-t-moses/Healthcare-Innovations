import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const protectedRoutes = [
    "/dashboard",
    "/patients",
    "/appointments",
    "/staff",
    "/finances",
    "/settings",
    "/stock",
  ];

  // Redirect from root to dashboard if authenticated
  if (req.nextUrl.pathname === "/") {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Redirect authenticated users trying to access auth pages
  if (session && req.nextUrl.pathname.startsWith("/sign-")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect unauthenticated users trying to access protected routes
  if (
    !session &&
    protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
  ) {
    const redirectUrl = new URL("/sign-in", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    "/",
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/dashboard/:path*",
    "/patients/:path*",
    "/appointments/:path*",
    "/staff/:path*",
    "/finances/:path*",
    "/settings/:path*",
    "/stock/:path*",
  ],
};
