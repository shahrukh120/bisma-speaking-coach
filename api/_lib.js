// Shared helpers for the serverless API functions.
// These run on Vercel (Node serverless) and in local Vite dev (via the dev plugin).

const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "meta/llama-3.3-70b-instruct";

export async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  return await new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

export function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(obj));
}

// Call NVIDIA's OpenAI-compatible chat endpoint and return the assistant text.
export async function chat(messages, { json = false, temperature = 0.7, max_tokens = 2048 } = {}) {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) throw new Error("NVIDIA_API_KEY is not set on the server.");

  const body = {
    model: MODEL,
    messages,
    temperature,
    top_p: 0.95,
    max_tokens,
    stream: false,
  };
  if (json) body.response_format = { type: "json_object" };

  const r = await fetch(NVIDIA_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const t = await r.text();
    throw new Error(`NVIDIA API ${r.status}: ${t.slice(0, 500)}`);
  }
  const out = await r.json();
  return out?.choices?.[0]?.message?.content ?? "";
}

// Robustly pull a JSON object out of a model response (handles ```json fences).
export function extractJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    try {
      return JSON.parse(fence[1]);
    } catch {}
  }
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    try {
      return JSON.parse(text.slice(first, last + 1));
    } catch {}
  }
  return null;
}
