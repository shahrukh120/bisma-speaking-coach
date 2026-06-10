import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Runs the /api/*.js serverless handlers locally during `npm run dev`,
// so the same code works locally and on Vercel.
function devApi(env) {
  // Make server-side keys available to the handlers.
  for (const [k, v] of Object.entries(env)) {
    if (!k.startsWith("VITE_")) process.env[k] = v;
  }
  return {
    name: "dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/")) return next();
        const route = req.url.split("?")[0].replace(/\/$/, "");
        const file = path.join(process.cwd(), route + ".js");
        try {
          const mod = await server.ssrLoadModule(pathToFileURL(file).href).catch(() =>
            import(pathToFileURL(file).href)
          );
          const handler = mod.default || mod.handler;
          if (!handler) throw new Error("No handler exported for " + route);
          await handler(req, res);
        } catch (e) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: String(e.message || e) }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), devApi(env)],
    server: { port: 5173, open: true },
  };
});
