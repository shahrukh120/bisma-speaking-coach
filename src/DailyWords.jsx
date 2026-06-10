import React, { useEffect, useState } from "react";
import { getWords } from "./api.js";

export default function DailyWords() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { words } = await getWords();
      setWords(words);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const speak = (w) => {
    try {
      const u = new SpeechSynthesisUtterance(w);
      u.lang = "en-US";
      speechSynthesis.speak(u);
    } catch {}
  };

  return (
    <section id="words" className="section">
      <div className="section-head">
        <div>
          <h2>Today's Words with Bisma</h2>
          <p className="muted">Six words to make your speech sound more articulate.</p>
        </div>
        <button className="btn ghost" onClick={load} disabled={loading}>
          {loading ? "Thinking…" : "↻ New set"}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="words-grid">
        {loading && words.length === 0
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="word-card skeleton" />)
          : words.map((w, i) => (
              <article className="word-card" key={i} style={{ "--i": i }}>
                <header>
                  <h3>{w.word}</h3>
                  <button className="speak" title="Hear it" onClick={() => speak(w.word)}>🔊</button>
                </header>
                <span className="pos">{w.partOfSpeech}</span>
                <p className="meaning">{w.meaning}</p>
                {w.example && <p className="example">“{w.example}”</p>}
                {Array.isArray(w.synonyms) && w.synonyms.length > 0 && (
                  <div className="syns">
                    {w.synonyms.map((s, j) => <span key={j} className="chip">{s}</span>)}
                  </div>
                )}
              </article>
            ))}
      </div>
    </section>
  );
}
