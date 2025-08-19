import { type NextRequest, NextResponse } from "next/server";

// Simple trigger endpoint for button clicks from Webflow
export async function POST(request: NextRequest) {
  try {
    // Parse any data sent from the Webflow button
    const buttonData = await request.json().catch(() => ({}));

    console.log("Button trigger received:", buttonData);

    // Call the main webhook endpoint internally
    const webhookUrl = new URL("/api/webhook/webflow-cms", request.url);

    const webhookResponse = await fetch(webhookUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trigger: "button_click",
        source: "webflow_site",
        data: buttonData,
        timestamp: new Date().toISOString(),
      }),
    });

    const result = await webhookResponse.json();

    return NextResponse.json(
      {
        success: true,
        message: "Webhook triggered successfully",
        result,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("Trigger error:", error);
    return NextResponse.json(
      {
        error: "Failed to trigger webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get("user-name");
    const applicationStatus = searchParams.get("application-status");

    console.log("[v0] GET trigger received:", { userName, applicationStatus });

    // Call the main webhook endpoint internally with query parameters
    const webhookUrl = new URL("/api/webhook/webflow-cms", request.url);
    if (userName) webhookUrl.searchParams.set("user-name", userName);
    if (applicationStatus)
      webhookUrl.searchParams.set("application-status", applicationStatus);

    const webhookResponse = await fetch(webhookUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await webhookResponse.json();

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("GET trigger error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch CMS data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
