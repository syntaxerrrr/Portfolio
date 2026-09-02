/**
 * Temporary diagnostic. No imports at all — if this responds while /api/chat
 * does not, the problem is the import of ../src/data/assistant rather than the
 * function runtime itself.
 */
export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({
      ok: true,
      node: process.version,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}
