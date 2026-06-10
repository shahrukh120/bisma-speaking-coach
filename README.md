# Bisma — AI English Speaking Coach 💜

A heavy-UI React site with **Bisma**, an animated English tutor character. No database — voice is processed in the browser and analysed by AI on the fly.

## Features
- **Daily vocabulary** — 6 fresh words (meaning, example, synonyms, "hear it" button).
- **5-minute speaking practice** — Bisma generates a random topic; you talk up to 5 min.
- **AI analysis report** — storytelling, thought organization, logical structure, pacing, filler words, plus voice modulation (elongation, emphasis, tone, pauses), scores + drills.
- **Live metrics in-browser** — transcript (Web Speech API), real pause detection & mic level (Web Audio), filler-word counting, words-per-minute. Nothing is stored.

## Run locally
```bash
npm install
npm run dev          # http://localhost:5173
```
The `/api/*` functions run inside the Vite dev server automatically.

> Mic + live transcription work best in **Chrome or Edge on desktop**.

## Environment
The NVIDIA API key lives server-side only (never shipped to the browser).
Local: it's read from `.env` → `NVIDIA_API_KEY=...`

## Deploy to Vercel (free)
1. Push this folder to GitHub.
2. Import the repo in Vercel (it auto-detects Vite + the `/api` functions).
3. Add an Environment Variable: `NVIDIA_API_KEY` = your key.
4. Deploy.

## Tech
React + Vite frontend. `/api/words`, `/api/topic`, `/api/analyze` are serverless
functions that proxy NVIDIA's OpenAI-compatible endpoint (model `meta/llama-3.3-70b-instruct`).
