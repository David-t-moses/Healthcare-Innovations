import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession();
  const userRole = session?.role;

  // Check for stock confirmation/rejection with valid ID
  if (
    req.nextUrl.pathname.startsWith("/stock/confirm") ||
    req.nextUrl.pathname.startsWith("/stock/reject")
  ) {
    const hasOrderId = req.nextUrl.searchParams.has("id");
    if (hasOrderId) {
      return res;
    }
  }

  const staffOnlyRoutes = ["/staff", "/finances", "/settings", "/stock"];
  const patientRoutes = [
    "/appointments",
    "/prescriptions",
    "/medical-history",
    "/messages",
  ];
  const protectedRoutes = [...staffOnlyRoutes, ...patientRoutes, "/dashboard"];

  // Root redirect
  if (req.nextUrl.pathname === "/") {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Auth pages protection
  if (session && req.nextUrl.pathname.startsWith("/sign-")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protected routes authentication check
  if (
    !session &&
    protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
  ) {
    const redirectUrl = new URL("/sign-in", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based access control
  if (session && userRole === "PATIENT") {
    if (
      staffOnlyRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return res;
}
