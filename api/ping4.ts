/** Temporary diagnostic: multi-file function, but every import stays inside api/. */
import { helperValue } from "./_helper";

export async function GET(): Promise<Response> {
  return new Response(JSON.stringify({ ok: true, helperValue }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
