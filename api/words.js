import { chat, send, extractJson } from "./_lib.js";

// GET /api/words -> { words: [{word, partOfSpeech, meaning, example, synonyms}] }
export default async function handler(req, res) {
  try {
    const seed = Math.random().toString(36).slice(2, 8);
    const messages = [
      {
        role: "system",
        content:
          "You are Bisma, a warm and encouraging English tutor. You build vocabulary for adult learners aiming for fluent, expressive spoken English.",
      },
      {
        role: "user",
        content:
          `Give me 6 useful English vocabulary words for today (varied difficulty, the kind that make speech sound articulate). ` +
          `Avoid extremely obscure words. Keep "meaning" under 12 words and "example" under 16 words. ` +
          `Use this random seed for variety: ${seed}. ` +
          `Respond ONLY as JSON: {"words":[{"word":"","partOfSpeech":"","meaning":"","example":"","synonyms":["",""]}]}.`,
      },
    ];
    const text = await chat(messages, { json: true, temperature: 0.9, max_tokens: 1400, tier: "fast" });
    const data = extractJson(text);
    if (!data || !Array.isArray(data.words)) {
      return send(res, 502, { error: "Could not parse word list from AI." });
    }
    return send(res, 200, { words: data.words.slice(0, 6) });
  } catch (e) {
    return send(res, 500, { error: String(e.message || e) });
  }
}
