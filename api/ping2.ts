/**
 * Temporary diagnostic. Same as ping, but it imports from src/ the way
 * /api/chat does — this isolates whether cross-directory imports get bundled.
 */
import { profile } from "../src/data/profile";

export async function GET(): Promise<Response> {
  return new Response(JSON.stringify({ ok: true, importedName: profile.name }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
