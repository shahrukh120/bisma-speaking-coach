import { useCallback, useEffect, useRef, useState } from "react";

const MAX_SECONDS = 300; // 5 minutes
const FILLERS = [
  "um", "uh", "umm", "uhh", "er", "erm", "hmm", "like", "you know",
  "i mean", "basically", "actually", "literally", "sort of", "kind of", "so yeah", "well",
];

function getRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = "en-US";
  r.continuous = true;
  r.interimResults = true;
  return r;
}

export function isSpeechSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function countFillers(text) {
  const lower = " " + text.toLowerCase().replace(/[^a-z\s]/g, " ") + " ";
  const counts = {};
  let total = 0;
  for (const f of FILLERS) {
    const re = new RegExp("\\b" + f.replace(/ /g, "\\s+") + "\\b", "g");
    const n = (lower.match(re) || []).length;
    if (n) {
      counts[f] = n;
      total += n;
    }
  }
  return { counts, total };
}

export function useRecorder() {
  const [status, setStatus] = useState("idle"); // idle | recording | done
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0); // live mic level 0..1
  const [error, setError] = useState("");

  const recRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);
  const timerRef = useRef(null);
  const finalRef = useRef("");
  const startRef = useRef(0);

  // pause tracking
  const pausesRef = useRef([]); // seconds durations of silences after speech began
  const silenceStartRef = useRef(null);
  const hasSpokenRef = useRef(false);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    try { recRef.current && recRef.current.stop(); } catch {}
    try { streamRef.current && streamRef.current.getTracks().forEach((t) => t.stop()); } catch {}
    try { audioCtxRef.current && audioCtxRef.current.close(); } catch {}
    rafRef.current = null;
    timerRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const start = useCallback(async () => {
    setError("");
    setTranscript("");
    setInterim("");
    setElapsed(0);
    finalRef.current = "";
    pausesRef.current = [];
    silenceStartRef.current = null;
    hasSpokenRef.current = false;

    if (!isSpeechSupported()) {
      setError("Speech recognition isn't supported in this browser. Please use Chrome or Edge on desktop.");
      return;
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access was blocked. Please allow the mic and try again.");
      return;
    }
    streamRef.current = stream;

    // ----- Audio analysis for real pause / level detection -----
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    src.connect(analyser);
    const buf = new Uint8Array(analyser.fftSize);

    const SILENCE = 0.018; // RMS threshold
    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      setLevel(Math.min(1, rms * 4));
      const now = performance.now() / 1000;
      if (rms < SILENCE) {
        if (silenceStartRef.current == null) silenceStartRef.current = now;
      } else {
        hasSpokenRef.current = true;
        if (silenceStartRef.current != null) {
          const dur = now - silenceStartRef.current;
          if (dur > 0.7 && hasSpokenRef.current) pausesRef.current.push(dur);
          silenceStartRef.current = null;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // ----- Speech recognition for transcript -----
    const rec = getRecognition();
    recRef.current = rec;
    rec.onresult = (e) => {
      let intr = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalRef.current += res[0].transcript + " ";
        else intr += res[0].transcript;
      }
      setTranscript(finalRef.current.trim());
      setInterim(intr);
    };
    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (e.error === "not-allowed") setError("Microphone permission denied.");
    };
    rec.onend = () => {
      // auto-restart while recording (Chrome stops after silence)
      if (status === "recording" || recRef.current === rec) {
        try { rec.start(); } catch {}
      }
    };
    try { rec.start(); } catch {}

    startRef.current = Date.now();
    setStatus("recording");
    timerRef.current = setInterval(() => {
      const s = (Date.now() - startRef.current) / 1000;
      setElapsed(s);
      if (s >= MAX_SECONDS) stop();
    }, 200);
  }, [status]); // eslint-disable-line

  const stop = useCallback(() => {
    const secs = (Date.now() - startRef.current) / 1000;
    cleanup();
    recRef.current = null;
    setInterim("");
    setLevel(0);
    setElapsed(Math.min(secs, MAX_SECONDS));
    setStatus("done");
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    recRef.current = null;
    setStatus("idle");
    setTranscript("");
    setInterim("");
    setElapsed(0);
    setError("");
    setLevel(0);
  }, [cleanup]);

  const getMetrics = useCallback(() => {
    const full = finalRef.current.trim();
    const words = full ? full.split(/\s+/).length : 0;
    const durationSec = Math.min(elapsed, MAX_SECONDS) || 1;
    const wpm = Math.round((words / durationSec) * 60);
    const { counts, total } = countFillers(full);
    const pauses = pausesRef.current;
    const longest = pauses.length ? Math.max(...pauses) : 0;
    return {
      transcript: full,
      durationSec,
      wordCount: words,
      wpm,
      fillers: counts,
      fillerTotal: total,
      pauseCount: pauses.length,
      longestPauseSec: Math.round(longest * 10) / 10,
    };
  }, [elapsed]);

  return { status, transcript, interim, elapsed, level, error, start, stop, reset, getMetrics, MAX_SECONDS };
}
