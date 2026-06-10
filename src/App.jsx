import React, { useEffect, useState } from "react";
import Bisma from "./Bisma.jsx";
import DailyWords from "./DailyWords.jsx";
import Practice from "./Practice.jsx";

const GREETINGS = [
  "Hi! I'm Bisma, your English speaking coach 👋",
  "Let's build your vocabulary together today!",
  "Talk to me for 5 minutes — I'll show you how to shine ✨",
  "Confidence comes from practice. Ready?",
];

export default function App() {
  const [g, setG] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setG((x) => (x + 1) % GREETINGS.length), 3500);
    return () => clearInterval(id);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="app">
      <header className="nav">
        <div className="brand">
          <img src="/assets/bisma.jpg" alt="" className="brand-pic" />
          <span>Bisma</span>
        </div>
        <nav>
          <button onClick={() => scrollTo("words")}>Daily Words</button>
          <button onClick={() => scrollTo("practice")}>Speaking Practice</button>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-text">
          <span className="badge">AI English Tutor</span>
          <h1>Speak English with <span className="grad">confidence</span>, guided by Bisma.</h1>
          <p>
            Get a fresh set of daily vocabulary, then take a 5-minute impromptu talk.
            Bisma listens and gives you a detailed report on storytelling, structure,
            pacing, filler words and voice modulation.
          </p>
          <div className="hero-cta">
            <button className="btn big primary" onClick={() => scrollTo("practice")}>Start speaking</button>
            <button className="btn big ghost" onClick={() => scrollTo("words")}>Today's words</button>
          </div>
          <div className="trust">No sign-up · Nothing stored · Runs in your browser</div>
        </div>
        <div className="hero-char">
          <Bisma size={300} message={GREETINGS[g]} speaking />
        </div>
      </section>

      <main>
        <DailyWords />
        <Practice />
      </main>

      <footer className="foot">
        <Bisma size={84} />
        <p>Made with 💜 — Bisma, your English speaking coach.</p>
      </footer>
    </div>
  );
}
