import React from "react";

const Marquee = ({
  text = "DISCOVER • WATCH • CREATE • ",
  speed = 18,
  reverse = false,
  className = "",
}) => {
  return (
    <div
      className={`marquee ${className}`}
      style={{
        "--marquee-speed": `${speed}s`,
        "--marquee-direction": reverse ? "reverse" : "normal",
      }}
    >
      <div className="marquee__track">
        <div className="marquee__content">
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
        </div>

        <div className="marquee__content" aria-hidden="true">
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
        </div>
      </div>

      <style>{`
        .marquee {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          background: #0d0f11;
          color: #f5f5f5;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .marquee__track {
          display: flex;
          width: max-content;
          animation: marquee-scroll var(--marquee-speed) linear infinite;
          animation-direction: var(--marquee-direction);
          will-change: transform;
        }

        .marquee__content {
          display: flex;
          flex-shrink: 0;
          align-items: center;
        }

        .marquee__content span {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          font-family: var(--display-font, "Arial Black", sans-serif);
          font-size: clamp(1rem, 1.5vw, 1.35rem);
          font-weight: 700;
          letter-spacing: 0.08em;
          line-height: 1;
        }

        @keyframes marquee-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .marquee:hover .marquee__track {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee__track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Marquee;