// app/api/webhook/webflow-cms/route.ts
import { NextRequest } from "next/server";

const allowedOrigins = [
  "https://your-custom-domain.com", // replace with your production domain
];

function isAllowedOrigin(origin: string | null) {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;

  // allow any webflow.io subdomain
  if (origin.endsWith(".webflow.io")) return true;

  return false;
}

function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (isAllowedOrigin(origin)) {
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
