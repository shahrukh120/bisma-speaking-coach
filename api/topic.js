import { chat, send, extractJson } from "./_lib.js";

// GET /api/topic -> { topic, prompt }  (a random speaking topic for the 5-min talk)
export default async function handler(req, res) {
  try {
    const seed = Math.random().toString(36).slice(2, 8);
    const messages = [
      {
        role: "system",
        content: "You are Bisma, an English speaking coach. You give engaging impromptu speaking topics.",
      },
      {
        role: "user",
        content:
          `Generate ONE random impromptu speaking topic a learner can talk about for up to 5 minutes. ` +
          `Make it open-ended, opinion- or story-friendly, not requiring special knowledge. Random seed: ${seed}. ` +
          `Respond ONLY as JSON: {"topic":"<short title>","prompt":"<one encouraging sentence telling them what to do>"}.`,
      },
    ];
    const text = await chat(messages, { json: true, temperature: 1.0, max_tokens: 300 });
    const data = extractJson(text) || {};
    if (!data.topic) return send(res, 502, { error: "Could not generate a topic." });
    return send(res, 200, { topic: data.topic, prompt: data.prompt || "Speak naturally for up to 5 minutes." });
  } catch (e) {
    return send(res, 500, { error: String(e.message || e) });
  }
}
