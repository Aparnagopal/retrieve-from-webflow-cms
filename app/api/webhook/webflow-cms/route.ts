import { type NextRequest, NextResponse } from "next/server";

async function fetchWebflowCollection(
  collectionId: string,
  apiToken: string,
  siteId: string
) {
  let url = `https://api.webflow.com/v2/sites/${siteId}/collections/${collectionId}/items`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Webflow API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching Webflow collection:", error);
    throw error;
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*", // TODO: replace * with your Webflow site domain for production
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent, Cache-Control",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS() {
  console.log("[v1] OPTIONS preflight request received");
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(request: NextRequest) {
  console.log("[v1] GET request received:", request.url);

  try {
    const apiToken = process.env.WEBFLOW_API_TOKEN;
    const siteId = process.env.WEBFLOW_SITE_ID;
    const collectionId = process.env.WEBFLOW_GENRLAPPL_COLLECTION_ID;

    if (!apiToken || !siteId || !collectionId) {
      return NextResponse.json(
        { error: "Missing required environment variables" },
        { status: 500, headers: corsHeaders() }
      );
    }

    const { searchParams } = new URL(request.url);
    const userName = searchParams.get("user-name");
    const applicationStatus = searchParams.get("application-status");

    console.log("[v1] Filters:", { userName, applicationStatus });

    const collectionData = await fetchWebflowCollection(
      collectionId,
      apiToken,
      siteId
    );

    const items = collectionData?.items || [];
    console.log("[v1] Total items fetched:", items.length);

    if (items.length > 0) {
      console.log("[v1] First item sample:", JSON.stringify(items[0], null, 2));
    }

    // Filter items using actual slugs
    const filtered = items.filter(
      (item: any) =>
        item["user-name"] === userName &&
        item["application-status"] === applicationStatus
    );

    console.log("[v1] Returning items:", filtered.length);

    return NextResponse.json(
      {
        success: true,
        count: filtered.length,
        data: filtered,
        filters: { userName, applicationStatus },
        timestamp: new Date().toISOString(),
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("[v1] GET error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch collection data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
