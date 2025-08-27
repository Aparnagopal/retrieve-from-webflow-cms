import { type NextRequest, NextResponse } from "next/server";

// ---- Utility: Webflow fetch ----
async function fetchWebflowCollection(
  collectionId: string,
  apiToken: string,
  siteId: string,
  filters?: { userName?: string | null; applicationStatus?: string | null }
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

  console.log("[fetchWebflowCollection] Final URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("[fetchWebflowCollection] Response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("[fetchWebflowCollection] Error body:", text);
      throw new Error(
        `Webflow API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      "[fetchWebflowCollection] Data received:",
      JSON.stringify(data, null, 2)
    );
    return data;
  } catch (error) {
    console.error("[fetchWebflowCollection] Exception:", error);
    throw error;
  }
}

// ---- Utility: CORS wrapper ----
function withCorsHeaders(
  response: NextResponse,
  origin?: string
): NextResponse {
  const allowedOrigins = [
    "https://pytf-new-merged-and-improved-site.webflow.io", // staging
    "https://your-custom-domain.com", // TODO: replace with your custom domain
  ];

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else {
    response.headers.set("Access-Control-Allow-Origin", "null");
  }

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent"
  );

  return response;
}

// ---- Handle OPTIONS (CORS preflight) ----
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  console.log("[OPTIONS] Preflight from:", origin);

  const response = new NextResponse(null, { status: 200 });
  return withCorsHeaders(response, origin);
}

// ---- Handle GET (query param style) ----
export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  console.log("[GET] Incoming request from:", origin, request.url);

  try {
    const apiToken = process.env.WEBFLOW_API_TOKEN;
    const siteId = process.env.WEBFLOW_SITE_ID;
    const collectionId = process.env.WEBFLOW_GENRLAPPL_COLLECTION_ID;

    if (!apiToken || !siteId || !collectionId) {
      console.error("[GET] Missing required environment variables", {
        apiToken: !!apiToken,
        siteId: !!siteId,
        collectionId: !!collectionId,
      });

      const response = NextResponse.json(
        { error: "Missing required environment variables" },
        { status: 500 }
      );
      return withCorsHeaders(response, origin);
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      userName: searchParams.get("user-name") || searchParams.get("userName"),
      applicationStatus:
        searchParams.get("application-status") ||
        searchParams.get("applicationStatus"),
    };

    console.log("[GET] Filters extracted:", filters);

    const collectionData = await fetchWebflowCollection(
      collectionId,
      apiToken,
      siteId,
      filters
    );

    const responseBody = {
      success: true,
      filters,
      timestamp: new Date().toISOString(),
      itemCount: collectionData.items?.length ?? 0,
      data: collectionData,
    };

    console.log(
      "[GET] Success response:",
      JSON.stringify(responseBody, null, 2)
    );

    const response = NextResponse.json(responseBody, { status: 200 });
    return withCorsHeaders(response, origin);
  } catch (error) {
    console.error("[GET] Error:", error);

    const response = NextResponse.json(
      {
        error: "Failed to fetch collection data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
    return withCorsHeaders(response, origin);
  }
}

// ---- Handle POST (Webhook) ----
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  console.log("[POST] Incoming webhook from:", origin);

  try {
    const apiToken = process.env.WEBFLOW_API_TOKEN;
    const siteId = process.env.WEBFLOW_SITE_ID;
    const collectionId = process.env.WEBFLOW_GENRLAPPL_COLLECTION_ID;

    if (!apiToken || !siteId || !collectionId) {
      console.error("[POST] Missing required environment variables");

      const response = NextResponse.json(
        { error: "Missing required environment variables" },
        { status: 500 }
      );
      return withCorsHeaders(response, origin);
    }

    const webhookData = await request.json();
    console.log("[POST] Webhook payload:", webhookData);

    const filters = {
      userName: webhookData["user-name"] || webhookData.userName,
      applicationStatus:
        webhookData["application-status"] || webhookData.applicationStatus,
    };

    console.log("[POST] Filters from webhook:", filters);

    const collectionData = await fetchWebflowCollection(
      collectionId,
      apiToken,
      siteId,
      filters
    );

    const responseBody = {
      success: true,
      message: "Webhook processed successfully",
      filters,
      timestamp: new Date().toISOString(),
      itemCount: collectionData.items?.length ?? 0,
      collection: collectionData,
    };

    console.log(
      "[POST] Success response:",
      JSON.stringify(responseBody, null, 2)
    );

    const response = NextResponse.json(responseBody, { status: 200 });
    return withCorsHeaders(response, origin);
  } catch (error) {
    console.error("[POST] Error:", error);

    const response = NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
    return withCorsHeaders(response, origin);
  }
}
