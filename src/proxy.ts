import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";

const PUBLIC_ROUTES = new Set(["/login"]);
const PUBLIC_PREFIXES = ["/api/auth", "/api/health"];

function isPublicRoute(pathname: string) {
  if (PUBLIC_ROUTES.has(pathname)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function hasSessionCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("session_token"));
}

function redirectToLoginClearingSession(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  for (const cookie of request.cookies.getAll()) {
    if (!cookie.name.includes("session_token")) {
      continue;
    }

    response.cookies.set(cookie.name, "", {
      expires: new Date(0),
      path: "/",
    });
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = hasSessionCookie(request);

  if (pathname.startsWith("/login")) {
    try {
      const activeUser = await getCurrentActiveUser();

      if (activeUser) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {}
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const activeUser = await getCurrentActiveUser();

    if (!activeUser) {
      return redirectToLoginClearingSession(request);
    }
  } catch {
    return redirectToLoginClearingSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map|woff|woff2|ttf)$).*)",
  ],
};
