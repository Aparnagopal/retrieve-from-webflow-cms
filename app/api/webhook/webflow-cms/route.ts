import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "https://pytf-new-merged-and-improved-site.webflow.io",
  "https://webflow.io", // allow staging subdomains
];

function getCorsHeaders(origin: string | null) {
  if (origin && allowedOrigins.some((allowed) => origin.endsWith(allowed))) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
  }
  return {};
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userName = searchParams.get("user-name");
  const applicationStatus = searchParams.get("application-status");

  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);

  // 🔍 Debug logging
  console.log("=== GET Request Debug ===");
  console.log("URL:", req.url);
  console.log("Origin Header:", origin);
  console.log("CORS Headers Returned:", headers);
  console.log("Query Params:", { userName, applicationStatus });

  return NextResponse.json(
    { userName, applicationStatus, debug: true },
    { status: 200, headers }
  );
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);

  // 🔍 Debug logging
  console.log("=== OPTIONS Request Debug ===");
  console.log("URL:", req.url);
  console.log("Origin Header:", origin);
  console.log("CORS Headers Returned:", headers);

  return new NextResponse(null, { status: 204, headers });
}
