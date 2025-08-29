export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const {
        ["user-name"]: userName,
        ["application-status"]: applicationStatus,
      } = req.query;

      if (!userName || !applicationStatus) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required query parameters: user-name, application-status",
        });
      }

      // Fetch collection from Webflow
      const response = await fetch(
        `https://api.webflow.com/v2/collections/${process.env.WEBFLOW_COLLECTION_ID}/items`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
            "accept-version": "1.0.0",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webflow API error: ${errorText}`);
      }

      const result = await response.json();

      // Filter items by user-name and application-status
      const matchingItem = result.items.find(
        (item) =>
          item.fieldData?.["user-name"] === userName &&
          item.fieldData?.["application-status"] === applicationStatus
      );

      if (!matchingItem) {
        return res.status(404).json({
          success: false,
          message: "No matching draft found",
        });
      }

      // ✅ Only return fieldData
      return res.status(200).json({
        success: true,
        data: matchingItem.fieldData,
      });
    } catch (error) {
      console.error("API error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  } else if (req.method === "POST") {
    return res.status(200).json({
      message: "POST received (debug)",
      body: req.body,
    });
  } else if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).end();
  } else {
    res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
