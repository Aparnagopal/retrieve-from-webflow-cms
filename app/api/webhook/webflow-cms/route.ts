// app/api/webhook/webflow-cms/route.ts
import { NextRequest } from "next/server";

const allowedOrigins = [
  "https://pytf-new-merged-and-improved-site.webflow.io",
  "https://your-custom-domain.com", // replace with your real domain
];

function corsResponse(body: any, origin: string | null, status = 200) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // allow only known origins
  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return corsResponse({}, origin, 200);
}

export async function GET(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");

    const { searchParams } = new URL(req.url);
    const userName = searchParams.get("user-name");
    const status = searchParams.get("application-status");

    console.log("🔹 GET /webhook/webflow-cms", { userName, status, origin });

    if (!userName || !status) {
      return corsResponse({ error: "Missing parameters" }, origin, 400);
    }

    return corsResponse(
      { message: "Data received", userName, status },
      origin,
      200
    );
  } catch (err: any) {
    console.error("❌ Error in route handler:", err);
    return corsResponse({ error: "Internal Server Error" }, null, 500);
  }
}
