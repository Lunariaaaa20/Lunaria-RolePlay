"use client";

import React from "react";

type CrimsonAristocratEffectProps = {
  variant?: "card" | "compact" | "preview";
};

export default function CrimsonAristocratEffect({
  variant = "card",
}: CrimsonAristocratEffectProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${
        isCompact ? "opacity-85" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(248,113,113,0.18),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(127,29,29,0.30),transparent_48%)]" />

      <div className="crimson-moon" />
      <div className="crimson-window crimson-window-one" />
      <div className="crimson-window crimson-window-two" />

      <div className="crimson-rose crimson-rose-one" />
      <div className="crimson-rose crimson-rose-two" />
      <div className="crimson-rose crimson-rose-three" />
      <div className="crimson-rose crimson-rose-four" />
      <div className="crimson-rose crimson-rose-five" />
      <div className="crimson-rose crimson-rose-six" />

      <div className="crimson-mist crimson-mist-one" />
      <div className="crimson-mist crimson-mist-two" />
      <div className="crimson-mist crimson-mist-three" />

      <div className="crimson-bat crimson-bat-one" />
      <div className="crimson-bat crimson-bat-two" />
      <div className="crimson-bat crimson-bat-three" />

      <div className="crimson-gold-line crimson-gold-line-one" />
      <div className="crimson-gold-line crimson-gold-line-two" />

      <div className="crimson-shine" />

      <style jsx>{`
        .crimson-moon {
          position: absolute;
          right: 8%;
          top: 8%;
          width: 94px;
          height: 94px;
          border-radius: 999px;
          background:
            radial-gradient(circle at 38% 32%, rgba(255, 255, 255, 0.36), transparent 20%),
            radial-gradient(circle, rgba(248, 113, 113, 0.40), rgba(127, 29, 29, 0.28) 55%, transparent 72%);
          box-shadow:
            0 0 42px rgba(248, 113, 113, 0.22),
            0 0 78px rgba(127, 29, 29, 0.18);
          filter: blur(0.2px);
          opacity: 0.48;
          animation: crimsonMoonPulse 7s ease-in-out infinite;
        }

        .crimson-window {
          position: absolute;
          width: 70px;
          height: 135px;
          border-radius: 999px 999px 10px 10px;
          border: 1px solid rgba(245, 158, 11, 0.14);
          background:
            linear-gradient(90deg, transparent 48%, rgba(245, 158, 11, 0.11) 50%, transparent 52%),
            linear-gradient(0deg, transparent 30%, rgba(245, 158, 11, 0.08) 32%, transparent 34%),
            radial-gradient(circle at 50% 18%, rgba(248, 113, 113, 0.16), transparent 55%);
          box-shadow: inset 0 0 28px rgba(127, 29, 29, 0.24);
          opacity: 0.22;
          animation: crimsonWindowGlow 8s ease-in-out infinite alternate;
        }

        .crimson-window-one {
          left: 8%;
          top: 4%;
        }

        .crimson-window-two {
          right: 23%;
          bottom: -28px;
          transform: scale(0.82);
          animation-delay: -3s;
        }

        .crimson-rose {
          position: absolute;
          width: 16px;
          height: 12px;
          background:
            radial-gradient(circle at 35% 45%, rgba(185, 28, 28, 0.95), transparent 46%),
            radial-gradient(circle at 65% 45%, rgba(127, 29, 29, 0.95), transparent 48%),
            radial-gradient(circle at 50% 65%, rgba(20, 5, 8, 0.9), transparent 60%);
          border-radius: 70% 40% 70% 40%;
          box-shadow:
            0 0 12px rgba(248, 113, 113, 0.18),
            0 0 22px rgba(245, 158, 11, 0.08);
          opacity: 0;
          animation: crimsonPetalFall 8s linear infinite;
        }

        .crimson-rose-one {
          left: 12%;
          top: -16px;
        }

        .crimson-rose-two {
          left: 30%;
          top: -16px;
          animation-delay: -1.4s;
          transform: scale(0.8);
        }

        .crimson-rose-three {
          left: 52%;
          top: -16px;
          animation-delay: -2.8s;
          transform: scale(1.1);
        }

        .crimson-rose-four {
          right: 24%;
          top: -16px;
          animation-delay: -4.2s;
          transform: scale(0.9);
        }

        .crimson-rose-five {
          right: 10%;
          top: -16px;
          animation-delay: -5.6s;
          transform: scale(1.15);
        }

        .crimson-rose-six {
          left: 72%;
          top: -16px;
          animation-delay: -6.7s;
          transform: scale(0.75);
        }

        .crimson-mist {
          position: absolute;
          height: 70px;
          border-radius: 999px;
          filter: blur(22px);
          background:
            radial-gradient(circle, rgba(248, 113, 113, 0.22), transparent 55%),
            radial-gradient(circle, rgba(127, 29, 29, 0.26), transparent 70%);
          opacity: 0.4;
          animation: crimsonMistCrawl 9s ease-in-out infinite alternate;
        }

        .crimson-mist-one {
          width: 280px;
          left: -70px;
          bottom: -28px;
        }

        .crimson-mist-two {
          width: 240px;
          right: -55px;
          bottom: -24px;
          animation-delay: -2.5s;
        }

        .crimson-mist-three {
          width: 200px;
          left: 36%;
          bottom: -38px;
          animation-delay: -5s;
        }

        .crimson-bat {
          position: absolute;
          width: 28px;
          height: 12px;
          background: rgba(15, 5, 8, 0.72);
          clip-path: polygon(
            0 58%,
            18% 28%,
            34% 58%,
            50% 20%,
            66% 58%,
            82% 28%,
            100% 58%,
            76% 76%,
            50% 50%,
            24% 76%
          );
          filter: drop-shadow(0 0 8px rgba(248, 113, 113, 0.2));
          opacity: 0;
          animation: crimsonBatFlight 10s ease-in-out infinite;
        }

        .crimson-bat-one {
          left: -30px;
          top: 22%;
        }

        .crimson-bat-two {
          left: -30px;
          top: 40%;
          animation-delay: -3.5s;
          transform: scale(0.8);
        }

        .crimson-bat-three {
          left: -30px;
          top: 15%;
          animation-delay: -6.2s;
          transform: scale(1.15);
        }

        .crimson-gold-line {
          position: absolute;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(245, 158, 11, 0.48),
            rgba(248, 113, 113, 0.26),
            transparent
          );
          opacity: 0.28;
          animation: crimsonGoldLinePulse 5s ease-in-out infinite;
        }

        .crimson-gold-line-one {
          left: 8%;
          right: 8%;
          top: 22%;
        }

        .crimson-gold-line-two {
          left: 12%;
          right: 12%;
          bottom: 24%;
          animation-delay: -2.4s;
        }

        .crimson-shine {
          position: absolute;
          inset: -70px;
          background: linear-gradient(
            118deg,
            transparent 0%,
            transparent 38%,
            rgba(245, 158, 11, 0.10) 47%,
            rgba(248, 113, 113, 0.09) 51%,
            transparent 64%,
            transparent 100%
          );
          transform: translateX(-60%);
          animation: crimsonNobleShine 8s ease-in-out infinite;
        }

        @keyframes crimsonMoonPulse {
          0%,
          100% {
            transform: scale(0.94);
            opacity: 0.32;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.56;
          }
        }

        @keyframes crimsonWindowGlow {
          0% {
            opacity: 0.14;
            filter: brightness(0.85);
          }
          100% {
            opacity: 0.32;
            filter: brightness(1.2);
          }
        }

        @keyframes crimsonPetalFall {
          0% {
            transform: translate3d(0, -20px, 0) rotate(0deg) scale(0.75);
            opacity: 0;
          }
          12% {
            opacity: 0.82;
          }
          62% {
            opacity: 0.72;
          }
          100% {
            transform: translate3d(38px, 185px, 0) rotate(230deg) scale(1.05);
            opacity: 0;
          }
        }

        @keyframes crimsonMistCrawl {
          0% {
            transform: translate3d(-24px, 0, 0) scaleX(0.94);
            opacity: 0.24;
          }
          100% {
            transform: translate3d(32px, -10px, 0) scaleX(1.1);
            opacity: 0.5;
          }
        }

        @keyframes crimsonBatFlight {
          0% {
            transform: translate3d(0, 0, 0) scale(0.7);
            opacity: 0;
          }
          18% {
            opacity: 0.55;
          }
          50% {
            transform: translate3d(48vw, -20px, 0) scale(1);
            opacity: 0.7;
          }
          100% {
            transform: translate3d(90vw, 18px, 0) scale(0.75);
            opacity: 0;
          }
        }

        @keyframes crimsonGoldLinePulse {
          0%,
          100% {
            opacity: 0.12;
            transform: scaleX(0.88);
          }
          50% {
            opacity: 0.45;
            transform: scaleX(1);
          }
        }

        @keyframes crimsonNobleShine {
          0%,
          24% {
            transform: translateX(-62%);
            opacity: 0;
          }
          45% {
            opacity: 0.65;
          }
          72% {
            transform: translateX(58%);
            opacity: 0;
          }
          100% {
            transform: translateX(58%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
