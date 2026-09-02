import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv, type Plugin } from "vite";

/**
 * Serves `api/chat.ts` during `npm run dev`.
 *
 * In production Vercel runs that file as a serverless function. Locally this
 * adapter bridges Vite's Node request/response objects to the Web `Request` /
 * `Response` the handler expects, so `npm run dev` behaves like production
 * without needing the Vercel CLI installed.
 */
function devApiRoutes(env: Record<string, string>): Plugin {
  return {
    name: "dev-api-routes",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (req, res, next) => {
        if (!req.method) return next();

        // The handler reads the key from the process environment, exactly as
        // it will on Vercel.
        process.env.GEMINI_API_KEY ??= env.GEMINI_API_KEY;

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);

          const { default: handler } = await server.ssrLoadModule("/api/chat.ts");

          const request = new Request(`http://localhost${req.url ?? "/"}`, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: chunks.length ? Buffer.concat(chunks) : undefined,
          });

          const response: Response = await handler.fetch(request);

          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          console.error("[dev-api] /api/chat failed:", error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Dev API route crashed" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), devApiRoutes(env)],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: { port: 3000 },
  };
});
