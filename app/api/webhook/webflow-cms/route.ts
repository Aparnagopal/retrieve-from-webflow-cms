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
    "Access-Control-Allow-Origin":
      "https://pytf-new-merged-and-improved-site.webflow.io", // 👈 safer than *
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent, Cache-Control",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(request: NextRequest) {
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
    const email = searchParams.get("user-name");
    const applicationStatus = searchParams.get("application-status");

    const filters = { userName: email || undefined, applicationStatus };

    const collectionData = await fetchWebflowCollection(
      collectionId,
      apiToken,
      siteId,
      filters
    );
    console.log(
      "Collection Data Raw:",
      JSON.stringify(collectionData, null, 2)
    );

    return NextResponse.json(
      { success: true, data: collectionData.items ?? [] },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch collection data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
