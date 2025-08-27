import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "https://pytf-new-merged-and-improved-site.webflow.io", // staging
  "https://your-custom-domain.com", // replace with your live domain
];

// Utility to add CORS headers
function cors(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin") || "";
  if (allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

// Handle OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  return cors(request, NextResponse.json({}, { status: 200 }));
}

// Handle GET
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userName = searchParams.get("user-name");
  const applicationStatus = searchParams.get("application-status");

  const data = {
    success: true,
    from: "webhook/webflow-cms",
    received: { userName, applicationStatus },
  };

  return cors(request, NextResponse.json(data, { status: 200 }));
}

// Handle POST
export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = {
    success: true,
    from: "webhook/webflow-cms",
    received: body,
  };

  return cors(request, NextResponse.json(data, { status: 200 }));
}
