import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

async function forward(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const session = req.cookies.get("customer_session")?.value;
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", req.headers.get("accept") || "application/json");
  if (session) headers.set("authorization", `Bearer ${session}`);
  const method = req.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();
  const response = await fetch(`${BACKEND_URL}/${path.join("/")}${req.nextUrl.search}`, { method, headers, body, cache: "no-store" });
  const outputHeaders = new Headers({ "content-type": response.headers.get("content-type") || "application/json" });
  // Preserve every Set-Cookie value. This is what binds the backend-created
  // customer session to the storefront origin instead of the API origin.
  const cookieHeaders = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.()
    || (response.headers.get("set-cookie") ? [response.headers.get("set-cookie") as string] : []);
  cookieHeaders.forEach((cookie) => outputHeaders.append("set-cookie", cookie));
  return new NextResponse(await response.arrayBuffer(), { status: response.status, headers: outputHeaders });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
