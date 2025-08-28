export async function GET() {
  return new Response(
    JSON.stringify({ ok: true, message: "Hello from test route" }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
