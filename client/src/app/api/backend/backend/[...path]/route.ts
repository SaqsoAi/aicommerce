import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

async function forward(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const session = req.cookies.get("customer_session")?.value;
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (session) headers.set("authorization", `Bearer ${session}`);
  const method = req.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();
  const response = await fetch(`${BACKEND_URL}/${path.join("/")}${req.nextUrl.search}`, { method, headers, body, cache: "no-store" });
  const outputHeaders = new Headers({ "content-type": response.headers.get("content-type") || "application/json" });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) outputHeaders.set("set-cookie", setCookie);
  return new NextResponse(await response.arrayBuffer(), { status: response.status, headers: outputHeaders });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
