import { type NextRequest, NextResponse } from "next/server";

// Webflow CMS API integration
async function fetchWebflowCollection(
  collectionId: string,
  apiToken: string,
  siteId: string
) {
  const url = `https://api.webflow.com/v2/sites/${siteId}/collections/${collectionId}/items`;

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
  try {
    const apiToken = process.env.WEBFLOW_API_TOKEN;
    const siteId = process.env.WEBFLOW_SITE_ID;
    const collectionId = process.env.WEBFLOW_COLLECTION_ID;

    if (!apiToken || !siteId || !collectionId) {
      return NextResponse.json(
        { error: "Missing required environment variables" },
        { status: 500, headers: corsHeaders() }
      );
    }

    // Parse webhook payload
    const webhookData = await request.json();
    console.log("Webhook received:", webhookData);

    // Fetch latest collection data
    const collectionData = await fetchWebflowCollection(
      collectionId,
      apiToken,
      siteId
    );

    // Process the data (customize this based on your needs)
    const processedData = {
      timestamp: new Date().toISOString(),
      webhook: webhookData,
      collection: collectionData,
      itemCount: collectionData.items?.length || 0,
    };

    console.log("Processed collection data:", processedData);

    return NextResponse.json(
      {
        success: true,
        message: "Webhook processed successfully",
        data: processedData,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// Handle GET request for manual data retrieval
export async function GET() {
  try {
    const apiToken = process.env.WEBFLOW_API_TOKEN;
    const siteId = process.env.WEBFLOW_SITE_ID;
    const collectionId = process.env.WEBFLOW_COLLECTION_ID;

    if (!apiToken || !siteId || !collectionId) {
      return NextResponse.json(
        { error: "Missing required environment variables" },
        { status: 500, headers: corsHeaders() }
      );
    }

    const collectionData = await fetchWebflowCollection(
      collectionId,
      apiToken,
      siteId
    );

    return NextResponse.json(
      {
        success: true,
        data: collectionData,
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
