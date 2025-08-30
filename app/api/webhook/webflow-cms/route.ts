import { NextResponse } from "next/server";

const WEBFLOW_API_URL = "https://api.webflow.com/v2";
const COLLECTION_ID = "686f7d0f338fa886ae9a636a";
const API_TOKEN = process.env.WEBFLOW_API_TOKEN;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*", // ⚠️ for production: replace * with your Webflow domain
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(req: Request) {
  try {
    // Parse query params from URL
    const { searchParams } = new URL(req.url);
    const userName = searchParams.get("user-name");
    const applicationStatus = searchParams.get("application-status");

    console.log("[v1] GET request with params:", {
      userName,
      applicationStatus,
    });

    // Fetch all items in the collection
    const res = await fetch(
      `${WEBFLOW_API_URL}/collections/${COLLECTION_ID}/items`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "accept-version": "1.0.0",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[v1] Webflow API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch items" },
        { status: 500, headers: corsHeaders() }
      );
    }

    const data = await res.json();
    const items = data.items || [];

    // Filter items
    const filtered = items.filter(
      (item: any) =>
        item["name"] === userName && // field slug is `name` (User Name)
        item["application-status"] === applicationStatus
    );

    console.log("[v1] Returning items:", filtered.length);

    return NextResponse.json(
      { items: filtered },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error("[v1] GET error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
