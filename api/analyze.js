import { chat, readJson, send, extractJson } from "./_lib.js";

// POST /api/analyze  { topic, transcript, durationSec, metrics }
export default async function handler(req, res) {
  try {
    let { topic = "", transcript = "", durationSec = 0, metrics = {} } = await readJson(req);
    if (!transcript || transcript.trim().split(/\s+/).length < 5) {
      return send(res, 400, { error: "Transcript too short to analyse. Please speak a bit more." });
    }
    // Cap transcript length to keep the request comfortably within token limits.
    transcript = transcript.trim();
    if (transcript.length > 6000) transcript = transcript.slice(0, 6000) + " …";

    const m = {
      wordCount: metrics.wordCount ?? 0,
      wpm: metrics.wpm ?? 0,
      fillers: metrics.fillers ?? {},
      fillerTotal: metrics.fillerTotal ?? 0,
      pauseCount: metrics.pauseCount ?? 0,
      longestPauseSec: metrics.longestPauseSec ?? 0,
    };

    const messages = [
      {
        role: "system",
        content:
          "You are Bisma, an expert, warm English speaking coach. You analyse a learner's spoken English from a transcript " +
          "plus objective metrics captured from their recording. The transcript comes from speech-to-text so punctuation and " +
          "exact pauses are approximate — use the provided metrics for pacing/pauses/fillers, and infer storytelling, structure, " +
          "and likely voice modulation from word choice, sentence variety, and phrasing. Be specific, kind, and actionable. " +
          "Score each dimension 0-100. Keep every \"feedback\" to ONE concise sentence (max ~22 words). " +
          "Quote short phrases from the transcript as evidence where useful. " +
          "If the recording is very short, still fill in every field with brief, encouraging guidance.",
      },
      {
        role: "user",
        content:
          `TOPIC: ${topic}\n\n` +
          `RECORDING METRICS:\n` +
          `- Duration: ${Math.round(durationSec)}s\n` +
          `- Words: ${m.wordCount}\n` +
          `- Speaking rate: ${m.wpm} words/min\n` +
          `- Filler words used: ${JSON.stringify(m.fillers)} (total ${m.fillerTotal})\n` +
          `- Noticeable pauses (>0.7s): ${m.pauseCount}, longest ${m.longestPauseSec}s\n\n` +
          `TRANSCRIPT:\n"""${transcript}"""\n\n` +
          `Return ONLY this JSON shape:\n` +
          `{
  "overallScore": 0,
  "summary": "2-3 sentence overall impression",
  "speech": {
    "storytelling": {"score":0,"feedback":""},
    "thoughtOrganization": {"score":0,"feedback":""},
    "logicalStructure": {"score":0,"feedback":""},
    "pacing": {"score":0,"feedback":""},
    "fillerWords": {"score":0,"feedback":""}
  },
  "voiceModulation": {
    "elongation": {"score":0,"feedback":""},
    "emphasis": {"score":0,"feedback":""},
    "tone": {"score":0,"feedback":""},
    "pauses": {"score":0,"feedback":""}
  },
  "strengths": ["",""],
  "improvements": ["",""],
  "drill": "one short practice exercise to do next",
  "encouragement": "one warm closing line from Bisma"
}`,
      },
    ];

    const text = await chat(messages, { json: true, temperature: 0.4, max_tokens: 1400, tier: "smart" });
    const data = extractJson(text);
    if (!data || !data.speech) return send(res, 502, { error: "Could not parse analysis from AI." });
    return send(res, 200, data);
  } catch (e) {
    return send(res, 500, { error: String(e.message || e) });
  }
}
