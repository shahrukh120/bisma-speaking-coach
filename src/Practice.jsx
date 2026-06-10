import React, { useState } from "react";
import { useRecorder, isSpeechSupported } from "./useRecorder.js";
import { getTopic, analyze } from "./api.js";
import Report from "./Report.jsx";
import Bisma from "./Bisma.jsx";

function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function Practice() {
  const rec = useRecorder();
  const [topic, setTopic] = useState(null);
  const [topicLoading, setTopicLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [err, setErr] = useState("");

  const supported = isSpeechSupported();
  const pct = Math.min(100, (rec.elapsed / rec.MAX_SECONDS) * 100);

  const newTopic = async () => {
    setTopicLoading(true);
    setErr("");
    setReport(null);
    rec.reset();
    try {
      setTopic(await getTopic());
    } catch (e) {
      setErr(e.message);
    } finally {
      setTopicLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setErr("");
    try {
      const m = rec.getMetrics();
      setMetrics(m);
      const data = await analyze({
        topic: topic?.topic || "Free talk",
        transcript: m.transcript,
        durationSec: m.durationSec,
        metrics: m,
      });
      setReport(data);
      document.getElementById("report-anchor")?.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      setErr(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section id="practice" className="section">
      <div className="section-head">
        <div>
          <h2>5-Minute Speaking Practice</h2>
          <p className="muted">Bisma gives you a topic. Speak for up to 5 minutes. She analyses everything.</p>
        </div>
      </div>

      {!supported && (
        <div className="error-box">
          Live speech recognition needs Chrome or Edge on desktop. The rest of the site still works.
        </div>
      )}

      {/* Topic card */}
      <div className="topic-card">
        <div className="topic-bisma">
          <Bisma
            size={150}
            speaking={rec.status === "recording"}
            message={
              rec.status === "recording" ? "I'm listening… you're doing great! 🎧" :
              rec.status === "done" ? "Lovely! Want my analysis? ✨" :
              topic ? "Take a breath… and begin!" : ""
            }
          />
        </div>
        {topic ? (
          <>
            <span className="kicker">Your topic</span>
            <h3>{topic.topic}</h3>
            <p className="muted">{topic.prompt}</p>
          </>
        ) : (
          <>
            <span className="kicker">Ready when you are</span>
            <h3>Get a random speaking topic</h3>
            <p className="muted">Bisma will think of something fun for you to talk about.</p>
          </>
        )}
        <button className="btn" onClick={newTopic} disabled={topicLoading || rec.status === "recording"}>
          {topicLoading ? "Picking…" : topic ? "↻ New topic" : "🎲 Give me a topic"}
        </button>
      </div>

      {/* Recorder */}
      {topic && (
        <div className="recorder">
          <div className="rec-top">
            <div className={"mic " + rec.status} style={{ "--level": rec.level }}>
              <span className="mic-core">🎙️</span>
              <span className="mic-pulse" />
            </div>
            <div className="rec-meta">
              <div className="timer">{fmt(rec.elapsed)} <span className="max">/ 5:00</span></div>
              <div className="progress"><i style={{ width: pct + "%" }} /></div>
              <div className="rec-state">
                {rec.status === "recording" ? "Listening… speak naturally" :
                 rec.status === "done" ? "Recorded. Ready to analyse." : "Press start and begin speaking."}
              </div>
            </div>
          </div>

          <div className="rec-controls">
            {rec.status !== "recording" ? (
              <button className="btn big" onClick={rec.start} disabled={!supported || analyzing}>
                ● {rec.status === "done" ? "Record again" : "Start speaking"}
              </button>
            ) : (
              <button className="btn big stop" onClick={rec.stop}>■ Stop</button>
            )}
            {rec.status === "done" && (
              <button className="btn big primary" onClick={runAnalysis} disabled={analyzing}>
                {analyzing ? "Bisma is analysing…" : "✨ Get my analysis"}
              </button>
            )}
          </div>

          {(rec.transcript || rec.interim) && (
            <div className="transcript">
              <div className="t-label">Live transcript</div>
              <p>{rec.transcript} <span className="interim">{rec.interim}</span></p>
            </div>
          )}

          {rec.error && <div className="error-box">{rec.error}</div>}
        </div>
      )}

      {err && <div className="error-box">{err}</div>}

      <div id="report-anchor" />
      {analyzing && !report && (
        <div className="analyzing">
          <Bisma size={140} speaking message="Hmm… let me listen back carefully 🤔" />
          <div className="spinner" />
          <p>Bisma is analysing your speech…</p>
        </div>
      )}
      {report && <Report data={report} metrics={metrics} topic={topic?.topic} />}
    </section>
  );
}
