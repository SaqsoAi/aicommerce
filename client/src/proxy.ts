import { NextResponse } from "next/server";

import type {
  NextRequest,
} from "next/server";

export function proxy(
  request: NextRequest
) {
  const token =
    request.cookies.get("token");

  const isAdminRoute =
    request.nextUrl.pathname.startsWith(
      "/admin"
    );

  if (
    isAdminRoute &&
    !token
  ) {
    return NextResponse.redirect(
      new URL(
        "/login",
        request.url
      )
    );
  }

  return NextResponse.next();
}