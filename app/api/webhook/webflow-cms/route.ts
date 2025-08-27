// app/api/webhook/webflow-cms/route.ts
import { NextRequest } from "next/server";

const allowedOrigins = [
  "https://pytf-new-merged-and-improved-site.webflow.io",
  "https://your-custom-domain.com", // replace with your custom domain
];

function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const { searchParams } = new URL(req.url);

  const userName = searchParams.get("user-name");
  const status = searchParams.get("application-status");

  console.log("🔹 GET /webhook/webflow-cms", { userName, status, origin });

  if (!userName || !status) {
    return new Response(JSON.stringify({ error: "Missing parameters" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(origin),
      },
    });
  }

  return new Response(
    JSON.stringify({ message: "Data received", userName, status }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(origin),
      },
    }
  );
}
