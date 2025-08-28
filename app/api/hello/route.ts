import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return new Response(JSON.stringify({ message: "Hello from Next.js API!" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
