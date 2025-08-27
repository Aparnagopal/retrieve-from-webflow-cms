import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "https://pytf-new-merged-and-improved-site.webflow.io", // staging
  "https://your-custom-domain.com", // replace with prod domain
];

// Helper to build a response with CORS
function withCors(request: NextRequest, data: any, status = 200) {
  const origin = request.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent",
    "Access-Control-Allow-Credentials": "true",
  };

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

// OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  return withCors(request, { ok: true });
}

// GET
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userName = searchParams.get("user-name");
  const applicationStatus = searchParams.get("application-status");

  return withCors(request, {
    success: true,
    received: { userName, applicationStatus },
  });
}

// POST
export async function POST(request: NextRequest) {
  const body = await request.json();
  return withCors(request, {
    success: true,
    received: body,
  });
}
