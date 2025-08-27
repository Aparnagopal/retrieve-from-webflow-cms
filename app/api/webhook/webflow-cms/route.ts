import { type NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "https://pytf-new-merged-and-improved-site.webflow.io", // staging
  "https://your-custom-domain.com", // replace with your custom domain
];

function createCorsResponse(body: any, status: number, origin?: string) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else {
    headers["Access-Control-Allow-Origin"] = "null";
  }

  return NextResponse.json(body, { status, headers });
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  return createCorsResponse({}, 200, origin);
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin") || "";

  // 🔹 Dummy response to prove CORS works
  const { searchParams } = new URL(request.url);
  const userName = searchParams.get("user-name");
  const applicationStatus = searchParams.get("application-status");

  const data = {
    success: true,
    received: { userName, applicationStatus },
  };

  return createCorsResponse(data, 200, origin);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const body = await request.json();

  const data = {
    success: true,
    received: body,
  };

  return createCorsResponse(data, 200, origin);
}
