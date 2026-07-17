import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// /admin usa su propio AdminGuard/ADMIN_TOKEN, completamente ajeno a Clerk.
const esPublica = createRouteMatcher(["/", "/legal(.*)", "/docs(.*)", "/admin(.*)"]);

export const proxy = clerkMiddleware(async (auth, req) => {
  if (esPublica(req)) return;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
