import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = ["/account", "/orders", "/wishlist", "/checkout", "/dashboard"];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectedRoute = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const session = request.cookies.get("customer_session")?.value;
  if (protectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}
