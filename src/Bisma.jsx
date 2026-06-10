import React from "react";

// Animated brand character. The portrait floats/breathes, with an aura ring,
// sparkles, a "Bisma" name plate on her head, and an optional speech bubble.
export default function Bisma({ size = 220, message = "", speaking = false, mood = "happy" }) {
  return (
    <div className="bisma" style={{ "--bisma-size": size + "px" }}>
      {message ? (
        <div className={"bisma-bubble" + (speaking ? " talking" : "")}>
          {message}
          <span className="bubble-tail" />
        </div>
      ) : null}

      <div className="bisma-stage">
        <div className="bisma-nameplate">Bisma</div>

        <div className={"bisma-float" + (speaking ? " speaking" : "")}>
          <div className="bisma-aura" />
          <div className="bisma-ring" />
          <div className="bisma-portrait" data-mood={mood}>
            <img src="/assets/bisma.jpg" alt="Bisma, your English tutor" draggable="false" />
          </div>

          {/* floating sparkles (decorative) */}
          <span className="spark s1">✦</span>
          <span className="spark s2">✧</span>
          <span className="spark s3">✦</span>
          <span className="spark s4">·</span>
        </div>

        <div className="bisma-shadow" />
      </div>
    </div>
  );
}
