import { type NextRequest, NextResponse } from "next/server";

async function fetchWebflowCollection(
  collectionId: string,
  apiToken: string,
  siteId: string,
  filters?: { userName?: string; applicationStatus?: string }
) {
  let url = `https://api.webflow.com/v2/sites/${siteId}/collections/${collectionId}/items`;

  if (filters) {
    const params = new URLSearchParams();
    if (filters.userName) {
      params.append("filter[user-name]", filters.userName);
    }
    if (filters.applicationStatus) {
      params.append("filter[application-status]", filters.applicationStatus);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }

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

  return response.json();
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent",
    "Access-Control-Max-Age": "86400", // 24h
  };
}

export async function OPTIONS() {
  console.log("[v1] OPTIONS preflight handled");
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  console.log("[v1] GET request received with params:", params);

  try {
    const apiToken = process.env.WEBFLOW_API_TOKEN;
    const siteId = process.env.WEBFLOW_SITE_ID;
    const collectionId = process.env.WEBFLOW_GENRLAPPL_COLLECTION_ID;

    if (!apiToken || !siteId || !collectionId) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required environment variables" }),
        {
          status: 500,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    const email = params.params?.[0]
      ? decodeURIComponent(params.params[0])
      : null;
    const { searchParams } = new URL(request.url);
    const applicationStatus = searchParams.get("application-status");

    const filters = {
      userName: email,
      applicationStatus: applicationStatus || undefined,
    };

    console.log("[v1] Filtering with:", filters);

    const collectionData = await fetchWebflowCollection(
      collectionId,
      apiToken,
      siteId,
      filters
    );

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: collectionData,
        filters,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[v1] GET request error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to fetch collection data",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      }
    );
  }
}
