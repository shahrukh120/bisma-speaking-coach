import React, { useEffect, useRef, useState } from "react";
import Bisma from "./Bisma.jsx";
import BismaAvatar from "./BismaAvatar.jsx";
import DailyWords from "./DailyWords.jsx";
import Practice from "./Practice.jsx";

const GREETINGS = [
  "Hi there! I'm Bisma, your English tutor 👋",
  "Ready to sound amazing today?",
  "Pick up today's words, then talk to me!",
  "Five minutes of speaking — I'll coach the rest ✨",
];

// Typewriter that types each greeting, holds, then moves to the next.
function useTypewriter(lines) {
  const [text, setText] = useState("");
  const [speaking, setSpeaking] = useState(true);
  useEffect(() => {
    let line = 0, i = 0, t;
    const tick = () => {
      const cur = lines[line];
      if (i <= cur.length) {
        setText(cur.slice(0, i));
        setSpeaking(true);
        i += 1;
        t = setTimeout(tick, 38);
      } else {
        setSpeaking(false);
        t = setTimeout(() => {
          line = (line + 1) % lines.length;
          i = 0;
          tick();
        }, 2600);
      }
    };
    tick();
    return () => clearTimeout(t);
  }, [lines]);
  return { text, speaking };
}

// Adds .in to .reveal elements as they scroll into view.
function useReveal() {
  useEffect(() => {
    const check = () => {
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add("in");
      });
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);
}

export default function App() {
  const { text, speaking } = useTypewriter(GREETINGS);
  const [waving, setWaving] = useState(true);
  useReveal();

  // She waves for the first few seconds, then settles down.
  useEffect(() => {
    const t = setTimeout(() => setWaving(false), 5200);
    return () => clearTimeout(t);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="app">
      {/* drifting background blobs */}
      <div className="blob b1" aria-hidden="true" />
      <div className="blob b2" aria-hidden="true" />

      <header className="nav">
        <div className="brand">
          <div className="brand-avatar"><BismaAvatar size={46} /></div>
          <span>Bisma</span>
        </div>
        <nav>
          <button onClick={() => scrollTo("words")}>Daily Words</button>
          <button onClick={() => scrollTo("practice")}>Speaking Practice</button>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-deco" aria-hidden="true">
          <span className="float-deco d1">A</span>
          <span className="float-deco d2">✦</span>
          <span className="float-deco d3">🎤</span>
          <span className="float-deco d4">b</span>
          <span className="float-deco d5">♪</span>
          <span className="float-deco d6">C</span>
        </div>

        <div className="hero-text">
          <span className="badge">✨ Your AI English Tutor</span>
          <h1>Speak English with <span className="grad">confidence</span>,<br />guided by Bisma.</h1>
          <p>
            Learn fresh vocabulary every day, then take a 5-minute impromptu talk.
            Bisma listens and coaches your storytelling, structure, pacing,
            filler words and voice modulation.
          </p>
          <div className="hero-cta">
            <button className="btn big primary glow" onClick={() => scrollTo("practice")}>🎙️ Start speaking</button>
            <button className="btn big ghost" onClick={() => scrollTo("words")}>📚 Today's words</button>
          </div>
          <div className="trust">No sign-up · Nothing stored · Runs in your browser</div>
        </div>

        <div className="hero-char enter-pop">
          <Bisma size={320} message={text} speaking={speaking} waving={waving} typed />
        </div>
      </section>

      <main>
        <div className="reveal"><DailyWords /></div>
        <div className="reveal"><Practice /></div>
      </main>

      <footer className="foot">
        <BismaAvatar size={90} />
        <p>Made with 💜 — Bisma, your English speaking coach.</p>
      </footer>
    </div>
  );
}
