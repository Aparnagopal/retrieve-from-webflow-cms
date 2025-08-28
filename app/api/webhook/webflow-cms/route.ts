import { NextRequest } from "next/server";

function getCorsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*", // reflect back origin
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  console.log(">>> OPTIONS Origin Header:", origin);

  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  console.log(">>> GET Origin Header:", origin);

  const { searchParams } = new URL(req.url);
  const userName = searchParams.get("user-name");
  const status = searchParams.get("application-status");

  if (!userName || !status) {
    return new Response(JSON.stringify({ error: "Missing params" }), {
      status: 400,
      headers: {
        ...getCorsHeaders(origin),
        "Content-Type": "application/json",
      },
    });
  }

  // For now just echo back the params so we know CORS works
  return new Response(JSON.stringify({ userName, status }), {
    status: 200,
    headers: {
      ...getCorsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}
