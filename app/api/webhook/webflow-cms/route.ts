// app/api/webhook/webflow-cms/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // debug: wide open
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// GET handler
export async function GET(req: NextRequest) {
  console.log("=== GET hit ===", req.url);

  return new Response(
    JSON.stringify({
      message: "CORS debug GET (forced nodejs)",
      url: req.url,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    }
  );
}

// POST handler (dummy)
export async function POST(req: NextRequest) {
  console.log("=== POST hit ===", req.url);

  const body = await req.json().catch(() => ({}));

  return new Response(
    JSON.stringify({
      message: "CORS debug POST (forced nodejs)",
      url: req.url,
      body,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    }
  );
}

// OPTIONS handler
export async function OPTIONS(req: NextRequest) {
  console.log("=== OPTIONS hit ===", req.url);

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
