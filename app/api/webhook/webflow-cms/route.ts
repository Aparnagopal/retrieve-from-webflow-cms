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
      params.append("filter[user-name]", filters.userName); // may need to adjust slug
    }
    if (filters.applicationStatus) {
      params.append("filter[application-status]", filters.applicationStatus); // may need to adjust slug
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }

  console.log("[v1] Fetching Webflow API with URL:", url);

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

async function fetchCollectionSchema(collectionId: string, apiToken: string) {
  const url = `https://api.webflow.com/v2/collections/${collectionId}`;
  console.log("[v1] Fetching collection schema with URL:", url);

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
        `Webflow schema error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching collection schema:", error);
    throw error;
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*", // TODO: restrict in prod
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

export async function GET(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  console.log("[v1] GET request with params:", params);
  console.log("[v1] Request URL:", request.url);

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

    // Fetch schema so we can confirm the correct slugs
    const schema = await fetchCollectionSchema(collectionId, apiToken);
    console.log("[v1] Collection schema fields:", schema.fields);

    const email = params.params?.[0]
      ? decodeURIComponent(params.params[0])
      : null;
    console.log("[v1] Extracted email from path:", email);

    const { searchParams } = new URL(request.url);
    const applicationStatus = searchParams.get("application-status");
    console.log("[v1] Application status:", applicationStatus);

    const filters = { userName: email, applicationStatus };

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
        filters,
        schema, // include schema in response temporarily for debugging
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
