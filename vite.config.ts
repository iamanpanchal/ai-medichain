import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function anthropicDevProxy(apiKey: string | undefined): Plugin {
  return {
    name: "medichain-anthropic-dev-proxy",

    configureServer(server) {
      server.middlewares.use("/api/ai-chat", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }

        if (!apiKey) {
          res.statusCode = 503;
          res.end("ANTHROPIC_API_KEY is not configured.");
          return;
        }

        let body = "";

        for await (const chunk of req) {
          body += chunk;
        }

        try {
          const payload = JSON.parse(body);

          const upstream = await fetch(
            "https://api.anthropic.com/v1/messages",
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: "claude-sonnet-4-6",
                max_tokens: 700,
                stream: true,
                system: payload.system,
                messages: payload.messages,
              }),
            }
          );

          res.statusCode = upstream.status;

          res.setHeader(
            "content-type",
            upstream.headers.get("content-type") ?? "text/event-stream"
          );

          if (!upstream.body) {
            res.end();
            return;
          }

          for await (const chunk of upstream.body as unknown as AsyncIterable<Uint8Array>) {
            res.write(chunk);
          }

          res.end();
        } catch {
          res.statusCode = 500;
          res.end("The AI service request failed.");
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      viteSingleFile(),
      anthropicDevProxy(env.ANTHROPIC_API_KEY),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});