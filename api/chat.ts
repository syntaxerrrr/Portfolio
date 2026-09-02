import { buildSystemInstruction } from "../src/data/assistant";

/**
 * Server-side proxy for the portfolio chat assistant.
 *
 * The Gemini key lives only here, in the function's environment — it is never
 * sent to the browser. Note the name has no `VITE_` prefix precisely so Vite
 * cannot inline it into the client bundle.
 */
const API_KEY = process.env.GEMINI_API_KEY;

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/**
 * Called over plain REST rather than through `@google/genai`.
 *
 * The SDK depends on google-auth-library, which does a CommonJS
 * `require("child_process")`. This package is ESM (`"type": "module"`), so
 * bundling the SDK for the function crashes it at module load. One fetch to a
 * documented endpoint avoids the dependency entirely and keeps cold starts small.
 */

/** Keeps one visitor from burning the whole free-tier quota. */
const RATE_LIMIT = { windowMs: 60_000, maxRequests: 12 };

/** Refuse absurd payloads before they reach the model. */
const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY = 20;

type Role = "user" | "model";

interface IncomingMessage {
  role: Role;
  text: string;
}

/**
 * Best-effort throttle. Fluid Compute reuses instances so this catches the
 * common case, but it is per-instance rather than global — a speed bump
 * against accidental hammering, not a security boundary.
 */
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);

  if (recent.length >= RATE_LIMIT.maxRequests) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > 5000) hits.clear(); // crude ceiling on memory growth
  return false;
}

/**
 * Enforced by Gemini itself, so the client never has to cope with malformed
 * JSON or stray markdown fences. REST spells the types in uppercase.
 */
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    action: {
      type: "STRING",
      enum: ["navigate", "answer", "warn"],
      description:
        "navigate to move the visitor to a section, answer for a normal reply, warn for off-topic questions",
    },
    target: {
      type: "STRING",
      enum: ["about", "projects", "tech"],
      description:
        "Which section to scroll to. Only meaningful when action is 'navigate'.",
    },
    response: { type: "STRING", description: "The message shown to the visitor." },
  },
  required: ["action", "response"],
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export async function GET(): Promise<Response> {
  return json({ error: "Method not allowed" }, 405);
}

export async function POST(request: Request): Promise<Response> {
  if (!API_KEY) {
    console.error("GEMINI_API_KEY is not set in the function environment");
    return json({ error: "Assistant is not configured" }, 503);
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return json({ error: "Too many messages — give it a moment." }, 429);
  }

  let payload: { messages?: IncomingMessage[] };
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const messages = (payload.messages ?? [])
    .filter(
      (m): m is IncomingMessage =>
        typeof m?.text === "string" && (m.role === "user" || m.role === "model"),
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ ...m, text: m.text.slice(0, MAX_MESSAGE_LENGTH) }));

  if (messages.length === 0 || messages.at(-1)?.role !== "user") {
    return json({ error: "Expected a trailing user message" }, 400);
  }

  try {
    const upstream = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        })),
        systemInstruction: { parts: [{ text: buildSystemInstruction() }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          maxOutputTokens: 500,
          // The assistant recites known facts; skipping the thinking pass keeps
          // replies fast, which matters more than depth here.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!upstream.ok) {
      // Surface the upstream reason in the logs — a bad key and a rejected
      // request body look identical from the client otherwise.
      console.error(
        `Gemini returned ${upstream.status}:`,
        (await upstream.text()).slice(0, 500),
      );
      return json({ error: "Assistant is unavailable" }, 502);
    }

    const data = await upstream.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return json({ error: "Empty response from model" }, 502);

    // Schema-constrained, so this parses — but never trust that blindly.
    return json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini request failed:", error);
    return json({ error: "Assistant is unavailable" }, 502);
  }
}
