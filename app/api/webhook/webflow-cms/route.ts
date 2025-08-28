import { NextRequest } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // allow all (debug)
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(req: NextRequest) {
  console.log("=== GET hit ===", req.url);

  return new Response(
    JSON.stringify({ message: "CORS debug GET (raw Response)", url: req.url }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    }
  );
}

export async function OPTIONS(req: NextRequest) {
  console.log("=== OPTIONS hit ===", req.url);

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
