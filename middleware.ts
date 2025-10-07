import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: any } }) {
    const token = req.nextauth.token;
    const userRole = token?.role;

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
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Auth pages protection - only redirect if user has valid NextAuth token
    if (token && req.nextUrl.pathname.startsWith("/sign-")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Role-based access control
    if (token && userRole === "PATIENT") {
      if (
        staffOnlyRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Root redirect
        if (pathname === "/") {
          return !!token;
        }
        
        // Allow auth pages when not logged in
        if (pathname.startsWith("/sign-")) {
          return true;
        }
        
        // Protect all other routes
        const protectedRoutes = ["/staff", "/finances", "/settings", "/stock", "/appointments", "/prescriptions", "/medical-history", "/messages", "/dashboard"];
        if (protectedRoutes.some(route => pathname.startsWith(route))) {
          return !!token;
        }
        
        return true;
      },
    },
    pages: {
      signIn: "/sign-in",
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
