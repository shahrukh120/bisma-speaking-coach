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
  const [level, setLevel] = useState(0); // speech-activity pulse 0..1
  const [error, setError] = useState("");

  const recRef = useRef(null);
  const timerRef = useRef(null);
  const finalRef = useRef("");
  const interimRef = useRef("");
  const startRef = useRef(0);
  const recordingRef = useRef(false);

  // pause tracking (derived from the recognizer's own speech events — no
  // second microphone stream, which would otherwise starve recognition)
  const pausesRef = useRef([]);
  const silenceStartRef = useRef(null);
  const spokeRef = useRef(false);

  const cleanup = useCallback(() => {
    recordingRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    const rec = recRef.current;
    if (rec) {
      rec.onresult = rec.onerror = rec.onend = rec.onspeechstart = rec.onspeechend = null;
      try { rec.stop(); } catch {}
      try { rec.abort(); } catch {}
    }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const closePause = () => {
    if (silenceStartRef.current != null) {
      const dur = performance.now() / 1000 - silenceStartRef.current;
      if (dur > 0.7 && spokeRef.current) pausesRef.current.push(dur);
      silenceStartRef.current = null;
    }
  };

  const start = useCallback(async () => {
    setError("");
    setTranscript("");
    setInterim("");
    setElapsed(0);
    setLevel(0);
    finalRef.current = "";
    interimRef.current = "";
    pausesRef.current = [];
    silenceStartRef.current = null;
    spokeRef.current = false;

    if (!isSpeechSupported()) {
      setError("Live transcription isn't supported in this browser. Please use Google Chrome (desktop or Android).");
      return;
    }

    const rec = getRecognition();
    recRef.current = rec;
    recordingRef.current = true;

    rec.onresult = (e) => {
      let intr = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalRef.current += res[0].transcript + " ";
        else intr += res[0].transcript;
      }
      interimRef.current = intr;
      spokeRef.current = true;
      setTranscript(finalRef.current.trim());
      setInterim(intr);
      setLevel(0.85);
    };

    // Speech-activity events give us pauses without a competing mic capture.
    rec.onspeechstart = () => {
      closePause();
      spokeRef.current = true;
      setLevel(0.85);
    };
    rec.onspeechend = () => {
      silenceStartRef.current = performance.now() / 1000;
      setLevel(0.15);
    };

    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("Microphone access was blocked. Click the camera/lock icon in the address bar, allow the mic, then try again.");
      } else if (e.error === "audio-capture") {
        setError("No microphone was found. Please connect a mic and reload.");
      } else if (e.error === "network") {
        setError("The speech service couldn't be reached. This browser may block it — try Google Chrome.");
      }
    };

    // Chrome ends recognition on long silence; restart while still recording so
    // the user can keep talking up to the 5-minute cap.
    rec.onend = () => {
      if (recordingRef.current) {
        try { rec.start(); } catch {}
      }
    };

    try {
      rec.start();
    } catch {
      setError("Couldn't start recording. Please reload and try again.");
      recordingRef.current = false;
      return;
    }

    startRef.current = Date.now();
    setStatus("recording");
    timerRef.current = setInterval(() => {
      const s = (Date.now() - startRef.current) / 1000;
      setElapsed(s);
      setLevel((l) => Math.max(0, l - 0.07)); // gentle decay between speech events
      if (s >= MAX_SECONDS) stop();
    }, 150);
  }, []); // eslint-disable-line

  const stop = useCallback(() => {
    closePause();
    // keep any trailing words that hadn't been finalized yet
    if (interimRef.current.trim()) {
      finalRef.current += interimRef.current.trim() + " ";
      interimRef.current = "";
    }
    const secs = (Date.now() - startRef.current) / 1000;
    cleanup();
    recRef.current = null;
    setTranscript(finalRef.current.trim());
    setInterim("");
    setLevel(0);
    setElapsed(Math.min(secs, MAX_SECONDS));
    setStatus("done");
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    recRef.current = null;
    finalRef.current = "";
    interimRef.current = "";
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
