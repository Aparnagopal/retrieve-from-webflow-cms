import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // 🔥 allow everything temporarily
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(req: NextRequest) {
  console.log("=== GET hit ===", req.url);

  return NextResponse.json(
    { message: "CORS debug GET", url: req.url },
    { status: 200, headers: corsHeaders }
  );
}

export async function OPTIONS(req: NextRequest) {
  console.log("=== OPTIONS hit ===", req.url);

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
