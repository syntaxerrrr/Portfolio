/** Temporary diagnostic: imports a zero-dependency module from src/. */
import type { IconName } from "../src/types";
import { techGroups } from "../src/data/tech";

export async function GET(): Promise<Response> {
  const first: IconName | undefined = techGroups[0].items[0].icon;
  return new Response(
    JSON.stringify({ ok: true, groups: techGroups.length, firstIcon: first ?? null }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}
