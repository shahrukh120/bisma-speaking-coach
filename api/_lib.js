// Shared helpers for the serverless API functions.
// These run on Vercel (Node serverless) and in local Vite dev (via the dev plugin).

// Provider config. Groq is preferred for its very low latency; NVIDIA is a
// fallback used automatically when Groq is rate-limited (429/413).
const PROVIDERS = {
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: () => process.env.GROQ_API_KEY,
    fast: "llama-3.1-8b-instant",       // quick tasks: words, topic
    smart: "llama-3.3-70b-versatile",   // analysis quality
    strictJson: true,                   // supports response_format json_object
  },
  nvidia: {
    url: "https://integrate.api.nvidia.com/v1/chat/completions",
    key: () => process.env.NVIDIA_API_KEY,
    fast: "meta/llama-3.3-70b-instruct",
    smart: "meta/llama-3.3-70b-instruct",
    strictJson: false,                  // rely on extractJson instead
  },
};

// Ordered list of providers to try (first available preferred).
function providerChain() {
  const chain = [];
  if (process.env.GROQ_API_KEY) chain.push(PROVIDERS.groq);
  if (process.env.NVIDIA_API_KEY) chain.push(PROVIDERS.nvidia);
  if (!chain.length) throw new Error("No AI API key set (GROQ_API_KEY or NVIDIA_API_KEY).");
  return chain;
}

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

// Status codes worth falling back to another provider for.
const FALLBACK_STATUSES = new Set([429, 413, 500, 502, 503, 529]);

class RateLimited extends Error {}

// Call one provider's OpenAI-compatible chat endpoint.
async function callProvider(p, messages, { json, temperature, max_tokens, tier }) {
  const body = {
    model: tier === "fast" ? p.fast : p.smart,
    messages,
    temperature,
    top_p: 0.95,
    max_tokens,
    stream: false,
  };
  if (json && p.strictJson) body.response_format = { type: "json_object" };

  const r = await fetch(p.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${p.key()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (r.ok) {
    const out = await r.json();
    return out?.choices?.[0]?.message?.content ?? "";
  }

  const t = await r.text();
  // Groq's strict JSON mode can 400 with "json_validate_failed" when output is
  // truncated by max_tokens; it returns the partial in error.failed_generation —
  // salvage it so extractJson can repair/parse it.
  if (json) {
    try {
      const partial = JSON.parse(t)?.error?.failed_generation;
      if (partial) return partial;
    } catch {}
  }
  const err = new Error(`AI API ${r.status}: ${t.slice(0, 300)}`);
  if (FALLBACK_STATUSES.has(r.status)) throw Object.assign(new RateLimited(err.message), { status: r.status });
  throw err;
}

// Try providers in order, automatically falling over to the next one when the
// current is rate-limited / overloaded (so a Groq TPM limit doesn't break the app).
// tier: "fast" (small low-latency model) or "smart" (larger model for analysis).
export async function chat(messages, { json = false, temperature = 0.7, max_tokens = 2048, tier = "smart" } = {}) {
  const chain = providerChain();
  const opts = { json, temperature, max_tokens, tier };
  let lastErr;
  for (const p of chain) {
    try {
      return await callProvider(p, messages, opts);
    } catch (e) {
      lastErr = e;
      // Only fall through to the next provider on transient/limit errors.
      if (!(e instanceof RateLimited)) throw e;
    }
  }
  throw lastErr;
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
  // Last resort: repair a JSON object that was truncated mid-generation by
  // closing any open string/array/object so the parseable prefix survives.
  if (first !== -1) {
    const repaired = repairJson(text.slice(first));
    if (repaired) {
      try {
        return JSON.parse(repaired);
      } catch {}
    }
  }
  return null;
}

// Close unterminated strings/arrays/objects in a truncated JSON string.
function repairJson(s) {
  let inStr = false, esc = false;
  const stack = [];
  let lastComplete = 0; // index after the last balanced char at depth>0
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{" || c === "[") stack.push(c === "{" ? "}" : "]");
    else if (c === "}" || c === "]") stack.pop();
    if (stack.length && (c === "}" || c === "]" || c === '"' || /[0-9eltursfan.]/i.test(c))) {
      lastComplete = i + 1;
    }
  }
  // Trim a dangling partial token (e.g. an incomplete key/value) back to the
  // last comma or opening bracket so we don't keep half a property.
  let body = s.slice(0, lastComplete);
  body = body.replace(/,\s*("[^"]*)?$/s, "");
  if (inStr) body += '"';
  // Recompute what still needs closing after the trim.
  const close = [];
  let str = false, e = false;
  for (const c of body) {
    if (str) { if (e) e = false; else if (c === "\\") e = true; else if (c === '"') str = false; continue; }
    if (c === '"') str = true;
    else if (c === "{") close.push("}");
    else if (c === "[") close.push("]");
    else if (c === "}" || c === "]") close.pop();
  }
  if (str) body += '"';
  return body + close.reverse().join("");
}
