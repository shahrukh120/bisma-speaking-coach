import React from "react";

function scoreColor(s) {
  if (s >= 80) return "#37d67a";
  if (s >= 60) return "#ffc23c";
  if (s >= 40) return "#ff8a4c";
  return "#ff5d73";
}

function Ring({ score = 0 }) {
  const r = 52, c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, score)) / 100);
  return (
    <div className="ring-wrap">
      <svg viewBox="0 0 130 130" className="ring">
        <circle cx="65" cy="65" r={r} className="ring-bg" />
        <circle
          cx="65" cy="65" r={r}
          stroke={scoreColor(score)}
          strokeDasharray={c}
          strokeDashoffset={off}
          className="ring-fg"
        />
      </svg>
      <div className="ring-num">
        <strong>{Math.round(score)}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}

function Bar({ label, item }) {
  const s = item?.score ?? 0;
  return (
    <div className="metric">
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <span className="metric-score" style={{ color: scoreColor(s) }}>{Math.round(s)}</span>
      </div>
      <div className="bar"><i style={{ width: s + "%", background: scoreColor(s) }} /></div>
      <p className="metric-fb">{item?.feedback}</p>
    </div>
  );
}

export default function Report({ data, metrics, topic }) {
  if (!data) return null;
  const sp = data.speech || {};
  const vm = data.voiceModulation || {};

  return (
    <div className="report">
      <div className="report-hero">
        <Ring score={data.overallScore} />
        <div>
          <h3>Bisma's Report</h3>
          {topic && <p className="muted">On: <strong>{topic}</strong></p>}
          <p className="summary">{data.summary}</p>
        </div>
      </div>

      {metrics && (
        <div className="stat-row">
          <div className="stat"><b>{metrics.wordCount}</b><span>words</span></div>
          <div className="stat"><b>{metrics.wpm}</b><span>words/min</span></div>
          <div className="stat"><b>{metrics.fillerTotal}</b><span>fillers</span></div>
          <div className="stat"><b>{metrics.pauseCount}</b><span>pauses</span></div>
          <div className="stat"><b>{Math.round(metrics.durationSec)}s</b><span>spoken</span></div>
        </div>
      )}

      <div className="report-cols">
        <div className="report-card">
          <h4>🗣️ Speech</h4>
          <Bar label="Storytelling" item={sp.storytelling} />
          <Bar label="Thought organization" item={sp.thoughtOrganization} />
          <Bar label="Logical structure" item={sp.logicalStructure} />
          <Bar label="Pacing & pauses" item={sp.pacing} />
          <Bar label="Filler words" item={sp.fillerWords} />
        </div>
        <div className="report-card">
          <h4>🎵 Voice Modulation</h4>
          <Bar label="Elongation" item={vm.elongation} />
          <Bar label="Emphasis" item={vm.emphasis} />
          <Bar label="Tone" item={vm.tone} />
          <Bar label="Pauses" item={vm.pauses} />
        </div>
      </div>

      <div className="report-cols">
        {Array.isArray(data.strengths) && (
          <div className="report-card good">
            <h4>💪 Strengths</h4>
            <ul>{data.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
        {Array.isArray(data.improvements) && (
          <div className="report-card work">
            <h4>🎯 Work on this</h4>
            <ul>{data.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
      </div>

      {data.drill && (
        <div className="drill"><strong>Next practice drill:</strong> {data.drill}</div>
      )}
      {data.encouragement && (
        <div className="encourage">“{data.encouragement}” <span>— Bisma</span></div>
      )}
    </div>
  );
}
