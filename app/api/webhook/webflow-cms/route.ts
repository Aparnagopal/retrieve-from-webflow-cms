import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "https://pytf-new-merged-and-improved-site.webflow.io", // Webflow staging
  "https://your-custom-domain.com", // replace with real custom domain
];

function corsResponse(request: NextRequest, body: any, status = 200) {
  const origin = request.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent",
    "Access-Control-Allow-Credentials": "true",
  };

  // Allow origin only if it's in whitelist
  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

export async function OPTIONS(request: NextRequest) {
  console.log("OPTIONS:", request.url);
  return corsResponse(request, { ok: true });
}

export async function GET(request: NextRequest) {
  try {
    console.log("GET:", request.url);

    const { searchParams } = new URL(request.url);
    const userName = searchParams.get("user-name");
    const applicationStatus = searchParams.get("application-status");

    console.log("Query params:", { userName, applicationStatus });

    return corsResponse(request, {
      success: true,
      received: { userName, applicationStatus },
    });
  } catch (err: any) {
    console.error("GET error:", err);
    return corsResponse(request, { error: "Server error" }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST:", request.url);

    const body = await request.json().catch(() => null);
    console.log("POST body:", body);

    return corsResponse(request, {
      success: true,
      received: body,
    });
  } catch (err: any) {
    console.error("POST error:", err);
    return corsResponse(request, { error: "Server error" }, 500);
  }
}
