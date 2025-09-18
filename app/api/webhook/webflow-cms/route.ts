import { type NextRequest, NextResponse } from "next/server";

// Webflow CMS API integration
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Webflow collection:", error);
    throw error;
  }
}

// Handle CORS for cross-origin requests from Webflow
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

// Handle POST webhook from Webflow
export async function POST(request: NextRequest) {
  console.log("[v2] POST request received:", request.url);

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

    // Parse webhook payload or form data
    let requestData;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      requestData = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      requestData = Object.fromEntries(formData.entries());
    } else {
      // Try to parse as JSON anyway
      try {
        requestData = await request.json();
      } catch {
        requestData = {};
      }
    }

    console.log("[v2] POST data received:", requestData);

    // Extract filters from POST data or URL params
    const { searchParams } = new URL(request.url);
    const userName =
      requestData["user-name"] ||
      requestData.userName ||
      searchParams.get("user-name");
    const applicationStatus =
      requestData["application-status"] ||
      requestData.applicationStatus ||
      searchParams.get("application-status");

    console.log("[v2] POST Filters:", { userName, applicationStatus });

    const collectionData = await fetchWebflowCollection(
      collectionId,
      apiToken,
      siteId
    );

    const items = collectionData?.items || [];
    console.log("[v2] POST Total items fetched:", items.length);

    // Filter items based on criteria
    const filtered = items.filter(
      (item: any) =>
        item.fieldData?.name === userName &&
        item.fieldData?.["application-status"]?.toLowerCase() ===
          applicationStatus?.toLowerCase()
    );

    console.log("[v2] POST Returning items:", filtered.length);

    return NextResponse.json(
      {
        success: true,
        count: filtered.length,
        data: filtered,
        filters: { userName, applicationStatus },
        timestamp: new Date().toISOString(),
        method: "POST",
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("[v2] POST error:", error);
    return NextResponse.json(
      {
        error: "Failed to process POST request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// Handle GET request for manual data retrieval
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
    const filters = {
      userName: searchParams.get("user-name") || searchParams.get("userName"),
      applicationStatus:
        searchParams.get("application-status") ||
        searchParams.get("applicationStatus"),
    };

    const collectionData = await fetchWebflowCollection(
      collectionId,
      apiToken,
      siteId,
      filters
    );

    return NextResponse.json(
      {
        success: true,
        data: collectionData,
        filters: filters,
        timestamp: new Date().toISOString(),
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("GET request error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch collection data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
