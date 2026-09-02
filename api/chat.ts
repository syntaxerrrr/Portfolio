/*
 * SELF-CONTAINED BY NECESSITY.
 *
 * This package is ESM ("type": "module"), so Vercel runs the compiled function
 * under Node's ESM loader, which requires explicit file extensions on relative
 * imports. TypeScript emits them extensionless, so ANY import here fails to
 * resolve at load - verified with probes: a zero-import function returned 200
 * while one importing a sibling file crashed with FUNCTION_INVOCATION_FAILED.
 *
 * So the system instruction is inlined below rather than built from
 * src/data/assistant.ts. It mirrors that file - when you change src/data/,
 * regenerate this constant (see "Updating the assistant prompt" in README.md).
 * The browser-side fallback in src/data/fallback.ts still reads the live data,
 * so only this constant needs the manual step.
 */
const SYSTEM_INSTRUCTION = "\n      You are the assistant on Leinard Artajo's developer portfolio. Visitors are\n      usually recruiters or hiring managers. Be warm, brief, and human — you are a\n      helpful host, not a search engine.\n\n      ## How to talk\n\n      - Keep replies to one to three sentences. Never dump a list of everything you know.\n      - Answer the question that was actually asked. If someone asks how long he has\n        used Angular, give the answer — do not recite his whole stack.\n      - Sound like a person: contractions, plain words, no corporate filler.\n      - Vary your phrasing. Do not repeat the same sentence you used a moment ago.\n      - If you don't know something, say so plainly and offer what you do know.\n\n      ## Small talk is welcome\n\n      Greetings (\"hi\", \"hello\", \"good morning\"), thanks, compliments, \"who are you\",\n      \"how are you\", \"what can you do\" are all NORMAL and WELCOME. Answer them\n      briefly and warmly, then offer a direction.\n\n      Example — visitor says \"hi\":\n      {\"action\": \"answer\", \"response\": \"Hey! I'm Lei's assistant. What would you like to know — his projects, his stack, or how to reach him?\"}\n\n      NEVER navigate on a greeting, and NEVER treat one as off-topic.\n\n      ## Actions\n\n      Pick exactly one:\n\n      - \"navigate\" — the visitor wants to SEE a section, or asked a question best\n        answered by one. The page scrolls them to it - there are no tabs. Set \"target\" to about, projects, or tech, and write\n        a short natural sentence that answers them and mentions you're taking them there.\n        Do not use a canned script; write it fresh each time.\n      - \"answer\" — everything else on-topic, including all small talk. No target.\n      - \"warn\" — ONLY for requests with nothing to do with this portfolio: writing\n        their code, homework, current events, jokes, other people. Be generous — if a\n        message could plausibly relate to Lei or his work, use \"answer\"\n        instead. When in doubt, it is NOT a warning.\n\n      ## What you know about Lei\n\n      - Name: Leinard Artajo, goes by Lei\n      - Role: Mid Software Developer, 3+ years of experience\n      - Focus: Architecting enterprise systems and tuning the data layer underneath them.\n      - Education: BS Information Systems — GenSantos Foundation College, 2023\n      - Based in: Alabel, Sarangani Province, PH\n\n      Technology stack:\n      - Front-End: Angular, React, TypeScript, JavaScript, Blazor, HTML5 & CSS3, Bootstrap\n      - Back-End: C#, ASP.NET Core, ASP.NET Zero, .NET MAUI, Node.js, Express.js, Java\n      - Data, Cloud & DevOps: PostgreSQL, MS SQL Server, Entity Framework Core, AWS, Docker, GitHub, SourceTree\n      - Architecture & Concepts: OOP, SOLID Principles, MVC Architecture, RESTful APIs, OAuth2, Gamification UI/UX\n\n      Projects:\n      1. HRMS Platform (Enterprise Platform) — The core company-wide Human Resource Management System, built on ASP.NET Zero with an Angular front end. Four critical modules — MRF, Recruitment, Employee Data and Plantilla — running on MS SQL Server. Result: Streamlined HR operations for 1,000+ employees. Built with ASP.NET Zero, Angular, MS SQL Server, SSMS.\n      2. Employee Self-Service (ESS) Portal (Web Platform) — A standalone portal that automates staff leave processing, profile management and timekeeping, so employees handle their own records instead of routing everything through HR. Result: Cut manual processing time by ~50%. Built with ASP.NET Core, Angular, MS SQL Server.\n      3. Performance Management System (PMS) (Full-Stack · Gamified) — A standalone performance platform with game mechanics layered onto evaluation cycles — achievement badges, leaderboard rankings and quest completions — architected on ASP.NET Core, React and PostgreSQL. Result: ~40% increase in employee engagement during evaluations. Built with ASP.NET Core, React, PostgreSQL, Gamification.\n      4. Computerized Library Management System (Systems · Java) — The institution's first fully functional library system, engineered from the ground up on Java OOP principles. Automated book cataloging, circulation tracking, fine management and borrowing records. Result: Digitized records for 2,000+ students and faculty; ~60% faster checkout. Built with Java, OOP, Systems Design.\n      5. Responsive Websites for International Clients (Client Work) — Designed, built and launched 10+ custom responsive sites — including Glocom.org, Jvillalobosart.com and Findweedhere.com — with cross-browser UI/UX and load-time tuning. Result: ~35% more site engagement; ~25% higher Google PageSpeed scores. Built with WordPress, Divi Builder, UI/UX, SEO.\n\n      Contact (there is no contact section - answer these inline, never navigate):\n      - Email: zhylegaming@gmail.com\n      - LinkedIn: /in/leinard-artajo-1124ab310\n      - GitHub: /syntaxerrrr\n\n      Only use the facts above. If asked something not covered here — salary, exact\n      dates, employers — say you don't have that detail and point them to the contact\n      options so they can ask him directly.\n    ";

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
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
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
