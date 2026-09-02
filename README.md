# Leinard Artajo — Developer Portfolio

An interactive personal portfolio built with **React 19 + TypeScript + Vite**,
featuring a tabbed layout, three themes (dark / light / flashlight),
cursor-reactive background particles, and a Gemini-powered chat assistant that
scrolls you to whichever section answers your question.

## Run locally

**Prerequisites:** Node.js 20+

```bash
npm install
cp .env.example .env.local   # paste your Gemini key into it
npm run dev                  # http://localhost:3000
```

`npm run dev` also serves the `/api/chat` function, so the assistant works
locally exactly as it does in production — no Vercel CLI needed.

| Script              | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Dev server + `/api/chat`, with hot reload            |
| `npm run build`     | Typecheck, then build to `dist/`                     |
| `npm run preview`   | Serve the built front-end (no API — chat falls back) |
| `npm run typecheck` | Typecheck only                                       |

## Editing the content

Everything on the page is driven by plain typed data — you shouldn't need to
touch a component to update the portfolio:

| File                    | Controls                                                 |
| ----------------------- | -------------------------------------------------------- |
| `src/data/profile.ts`   | Name, role, tagline, avatar, stats row, "About Me" cards   |
| `src/data/projects.ts`  | The Projects section — append an entry to add a card          |
| `src/data/tech.ts`      | The Tech section, grouped by category                         |
| `src/data/contact.ts`   | The social links in the sidebar, and what the chat replies    |
| `src/data/assistant.ts` | The chat assistant's persona and rules                    |
| `src/data/fallback.ts`  | Offline answers used when the API is unreachable          |

The assistant's system prompt is **generated from the same data the page
renders**, so adding a project in `projects.ts` also teaches the chatbot about
it — and updates the offline fallback too.

Icons are referenced by name (`icon: "monitor"`). The full set lives in
`src/components/Icon.tsx` — add a new `<path>` there under a new key and it
becomes available to every data file.

## Design system

The look is driven by CSS custom properties at the top of `src/styles/app.css`.
Retune the palette there and the whole site follows:

| Token | Role |
| ----- | ---- |
| `--bg`, `--bg-card` | Slate ground and the barely-there card lift |
| `--text`, `--text-muted`, `--text-dim` | The three steps of the text ramp |
| `--accent`, `--accent-subtle`, `--accent-glow` | Teal - the only chromatic colour |
| `--tracking-tight`, `--tracking-label` | Display tracking and uppercase labels |

The rule the design follows: **teal is a highlight, never a fill.** Tag pills,
active states and links get a translucent teal wash with teal text; nothing gets
a solid teal background. Cards are flat - no drop shadows, no hover lift, just a
quiet background wash and a teal-tinted border.

## How the chat assistant works

```
browser  ──POST /api/chat──►  Vercel Function  ──►  Gemini
   │         (no API key)       (holds the key)
   │
   └── on any failure, answers locally from src/data/fallback.ts
```

Three things worth knowing:

**The API key never reaches the browser.** It's read as `GEMINI_API_KEY` —
deliberately *without* a `VITE_` prefix, since that prefix is exactly what makes
Vite inline a variable into the client bundle. Only `api/chat.ts` reads it.

This matters because **Gemini keys cannot be restricted by HTTP referrer** (the
only options are IP and API restrictions, neither of which works for a public
website). Google's own guidance is to "run a backend proxy server to make the
actual API calls." A key shipped in the bundle gets scraped and revoked — which
is the most likely reason the previous one died.

**Replies are schema-constrained.** `api/chat.ts` passes a `responseSchema` to
Gemini, so the model is structurally unable to return malformed JSON. The
"trouble formatting my response" failure mode is gone by construction.

**It degrades instead of breaking.** If the key expires, the quota runs out, or
the visitor is offline, `src/data/fallback.ts` answers from the same portfolio
data with keyword matching — including tab navigation. A visitor never sees an
error bubble.

The function also rate-limits to 12 messages/minute per IP so one visitor can't
burn the free-tier quota.

## Updating the assistant prompt

`api/chat.ts` carries its system instruction as an inlined constant rather than
importing it from `src/data/assistant.ts`.

This is a Vercel constraint, not a preference. The package is ESM
(`"type": "module"`), so the compiled function runs under Node's ESM loader,
which requires explicit file extensions on relative imports — and TypeScript
emits them extensionless. Any import in a function therefore fails to resolve at
load. Verified with probes: a zero-import function returned 200 while one
importing a single sibling file crashed with `FUNCTION_INVOCATION_FAILED`.

After editing `src/data/`, regenerate the constant:

```bash
npx esbuild src/data/assistant.ts --bundle --format=esm --platform=node --outfile=/tmp/p.mjs
node --input-type=module -e "import {buildSystemInstruction} from '/tmp/p.mjs'; console.log(JSON.stringify(buildSystemInstruction()))"
```

and paste the result over `SYSTEM_INSTRUCTION` in `api/chat.ts`. Only the Gemini
prompt needs this — `src/data/fallback.ts` reads the live data, so the
browser-side answers stay in sync on their own.

## Deploying to Vercel

1. Push to `main` — `vercel.json` handles the rest (framework `vite`, output
   `dist/`, SPA rewrites that exclude `/api/*`).
2. Add `GEMINI_API_KEY` under **Settings → Environment Variables**, for
   Production *and* Preview.
3. Redeploy so the function picks it up.

Get a key at [aistudio.google.com](https://aistudio.google.com) — the free tier
needs no credit card and is far more than a portfolio will use.

## Layout

A two-column split: the left rail is `position: sticky` at full viewport
height, the right column scrolls past it. An IntersectionObserver highlights
whichever section is in view. Below 1024px it collapses to one column, the rail
nav hides, and each section grows a sticky uppercase header instead.

```
api/chat.ts               # serverless proxy - holds the key, calls Gemini
src/
├── App.tsx               # split layout, theme + overlay state, global listeners
├── components/
│   ├── SideRail.tsx      # sticky identity, scroll-spy nav, socials
│   ├── *Section.tsx      # one per section, stacked in the content column
│   ├── Chat.tsx          # assistant widget
│   └── Icon.tsx          # every SVG glyph
├── data/                 # <- all editable content lives here
├── hooks/                # useScrollSpy, useParticles, useChat
├── services/             # assistant.ts - fetches /api/chat
└── styles/app.css        # tokens at the top, layout at the bottom
```
