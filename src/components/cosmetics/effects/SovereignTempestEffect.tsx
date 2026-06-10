"use client";

import React from "react";

type SovereignTempestEffectProps = {
  variant?: "card" | "compact" | "preview" | "background";
};

export default function SovereignTempestEffect({
  variant = "card",
}: SovereignTempestEffectProps) {
  const isCompact = variant === "compact";
  const isPreview = variant === "preview";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${
        isCompact ? "opacity-70" : isPreview ? "opacity-90" : "opacity-80"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_42%),radial-gradient(circle_at_center,rgba(56,189,248,0.10),transparent_48%)]" />

      <div className="tempest-cloud absolute -left-12 top-8 h-32 w-56 rounded-full bg-sky-200/10 blur-2xl" />
      <div className="tempest-cloud tempest-cloud-delay absolute -right-10 bottom-10 h-32 w-56 rounded-full bg-violet-300/10 blur-2xl" />

      <span className="tempest-lightning tempest-lightning-1" />
      <span className="tempest-lightning tempest-lightning-2" />
      <span className="tempest-lightning tempest-lightning-3" />

      <TempestParticles />

      <div className="tempest-shimmer absolute inset-0" />

      <style jsx>{`
        @keyframes tempest-drift {
          0%,
          100% {
            transform: translateX(0) translateY(0);
            opacity: 0.38;
          }
          50% {
            transform: translateX(18px) translateY(-8px);
            opacity: 0.68;
          }
        }

        @keyframes tempest-flash {
          0%,
          86%,
          100% {
            opacity: 0;
            transform: scaleY(0.8);
          }
          88% {
            opacity: 0.9;
            transform: scaleY(1.1);
          }
          91% {
            opacity: 0.18;
          }
          94% {
            opacity: 0.65;
          }
        }

        @keyframes tempest-particle {
          0% {
            transform: translateY(18px) scale(0.7);
            opacity: 0;
          }
          20% {
            opacity: var(--particle-opacity);
          }
          75% {
            opacity: var(--particle-opacity);
          }
          100% {
            transform: translateY(-70px) translateX(var(--particle-drift)) scale(1);
            opacity: 0;
          }
        }

        @keyframes tempest-shimmer-pass {
          0% {
            transform: translateX(-150%) skewX(-18deg);
            opacity: 0;
          }
          25% {
            opacity: 0.42;
          }
          55% {
            opacity: 0.16;
          }
          100% {
            transform: translateX(150%) skewX(-18deg);
            opacity: 0;
          }
        }

        .tempest-cloud {
          animation: tempest-drift 8s ease-in-out infinite;
        }

        .tempest-cloud-delay {
          animation-delay: 2.2s;
          animation-duration: 10s;
        }

        .tempest-lightning {
          position: absolute;
          width: 2px;
          height: 72px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(251, 191, 36, 0.9),
            rgba(56, 189, 248, 0.5),
            transparent
          );
          clip-path: polygon(
            45% 0%,
            100% 34%,
            62% 34%,
            88% 100%,
            0% 42%,
            40% 42%
          );
          filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.55));
          animation: tempest-flash 6.5s ease-in-out infinite;
        }

        .tempest-lightning-1 {
          left: 22%;
          top: 16%;
        }

        .tempest-lightning-2 {
          right: 24%;
          top: 30%;
          animation-delay: 2s;
        }

        .tempest-lightning-3 {
          left: 58%;
          bottom: 18%;
          animation-delay: 3.7s;
        }

        .tempest-particle {
          position: absolute;
          height: 5px;
          width: 5px;
          border-radius: 9999px;
          background: rgba(251, 191, 36, 0.95);
          box-shadow: 0 0 12px rgba(251, 191, 36, 0.8);
          animation-name: tempest-particle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        .tempest-shimmer {
          width: 48%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.13),
            rgba(251, 191, 36, 0.10),
            transparent
          );
          animation: tempest-shimmer-pass 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function TempestParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 16 }).map((_, index) => (
        <span
          key={`tempest-particle-${index}`}
          className="tempest-particle"
          style={
            {
              left: `${6 + ((index * 17) % 88)}%`,
              top: `${12 + ((index * 19) % 76)}%`,
              animationDelay: `${(index % 8) * 0.45}s`,
              animationDuration: `${4.8 + (index % 5) * 0.55}s`,
              "--particle-opacity": `${0.18 + (index % 5) * 0.08}`,
              "--particle-drift": `${index % 2 === 0 ? 16 : -16}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
