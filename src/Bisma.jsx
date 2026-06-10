import React from "react";
import BismaAvatar from "./BismaAvatar.jsx";

// Brand character block: nameplate on her head, aura, animated avatar,
// ground shadow, sparkles, and an optional speech bubble.
export default function Bisma({ size = 260, message = "", speaking = false, waving = false, typed = false }) {
  return (
    <div className="bisma" style={{ "--bisma-size": size + "px" }}>
      {typed ? (
        // Fixed-height slot keeps the bubble mounted while text retypes,
        // so the page never reflows/jumps between greetings.
        <div className="bisma-bubble-slot">
          <div className={"bisma-bubble" + (speaking ? " talking" : "")}>
            <span>{message}</span>
            <span className="caret" />
            <span className="bubble-tail" />
          </div>
        </div>
      ) : message ? (
        <div className={"bisma-bubble" + (speaking ? " talking" : "")}>
          <span>{message}</span>
          <span className="bubble-tail" />
        </div>
      ) : null}

      <div className="bisma-stage">
        <div className="bisma-nameplate">✦ Bisma ✦</div>
        <div className="bisma-float">
          <div className="bisma-aura" />
          <BismaAvatar size={size} speaking={speaking} waving={waving} />
          <span className="spark s1">✦</span>
          <span className="spark s2">✧</span>
          <span className="spark s3">✦</span>
          <span className="spark s4">♪</span>
        </div>
        <div className="bisma-shadow" />
      </div>
    </div>
  );
}
