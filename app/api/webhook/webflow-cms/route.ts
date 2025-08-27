import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "https://pytf-new-merged-and-improved-site.webflow.io", // staging
  "https://your-custom-domain.com", // replace with prod domain
];

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

export async function OPTIONS(request: NextRequest) {
  console.log("OPTIONS request received", request.url);
  return withCors(request, { ok: true });
}

export async function GET(request: NextRequest) {
  console.log("GET request received:", request.url);

  const { searchParams } = new URL(request.url);
  const userName = searchParams.get("user-name");
  const applicationStatus = searchParams.get("application-status");

  console.log("Query params:", { userName, applicationStatus });

  return withCors(request, {
    success: true,
    received: { userName, applicationStatus },
  });
}

export async function POST(request: NextRequest) {
  console.log("POST request received:", request.url);

  const body = await request.json().catch(() => null);
  console.log("POST body:", body);

  return withCors(request, {
    success: true,
    received: body,
  });
}
