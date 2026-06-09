"use client";

import React from "react";

type AbyssalLeviathanEffectProps = {
  variant?: "card" | "compact" | "preview";
};

export default function AbyssalLeviathanEffect({
  variant = "card",
}: AbyssalLeviathanEffectProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${
        isCompact ? "opacity-80" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(103,232,249,0.16),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(37,99,235,0.24),transparent_44%)]" />

      <div className="abyssal-water-glow" />
      <div className="abyssal-godray abyssal-godray-one" />
      <div className="abyssal-godray abyssal-godray-two" />
      <div className="abyssal-godray abyssal-godray-three" />

      <div className="abyssal-crystal abyssal-crystal-one" />
      <div className="abyssal-crystal abyssal-crystal-two" />
      <div className="abyssal-crystal abyssal-crystal-three" />

      <div className="abyssal-bubble abyssal-bubble-one" />
      <div className="abyssal-bubble abyssal-bubble-two" />
      <div className="abyssal-bubble abyssal-bubble-three" />
      <div className="abyssal-bubble abyssal-bubble-four" />
      <div className="abyssal-bubble abyssal-bubble-five" />
      <div className="abyssal-bubble abyssal-bubble-six" />

      <div className="abyssal-plankton abyssal-plankton-one" />
      <div className="abyssal-plankton abyssal-plankton-two" />
      <div className="abyssal-plankton abyssal-plankton-three" />
      <div className="abyssal-plankton abyssal-plankton-four" />
      <div className="abyssal-plankton abyssal-plankton-five" />

      <div className="abyssal-ripple abyssal-ripple-one" />
      <div className="abyssal-ripple abyssal-ripple-two" />

      <style jsx>{`
        .abyssal-water-glow {
          position: absolute;
          inset: -40px;
          background:
            linear-gradient(
              115deg,
              transparent 0%,
              rgba(103, 232, 249, 0.06) 24%,
              transparent 42%,
              rgba(16, 185, 129, 0.05) 58%,
              transparent 78%
            ),
            radial-gradient(
              circle at 50% 50%,
              rgba(14, 165, 233, 0.12),
              transparent 62%
            );
          filter: blur(4px);
          animation: abyssalWaterShift 10s ease-in-out infinite alternate;
        }

        .abyssal-godray {
          position: absolute;
          top: -30%;
          width: 90px;
          height: 150%;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.14),
            rgba(103, 232, 249, 0.07),
            transparent 72%
          );
          filter: blur(18px);
          opacity: 0.34;
          transform: rotate(14deg);
          animation: abyssalRayDrift 9s ease-in-out infinite alternate;
        }

        .abyssal-godray-one {
          left: 10%;
        }

        .abyssal-godray-two {
          left: 42%;
          width: 120px;
          opacity: 0.25;
          animation-delay: -2s;
        }

        .abyssal-godray-three {
          right: 6%;
          width: 80px;
          opacity: 0.3;
          animation-delay: -4s;
        }

        .abyssal-crystal {
          position: absolute;
          width: 42px;
          height: 70px;
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.5),
            rgba(103, 232, 249, 0.28),
            rgba(16, 185, 129, 0.16),
            rgba(15, 23, 42, 0.1)
          );
          clip-path: polygon(50% 0%, 88% 28%, 74% 100%, 26% 100%, 12% 28%);
          border: 1px solid rgba(103, 232, 249, 0.24);
          box-shadow:
            0 0 20px rgba(103, 232, 249, 0.18),
            inset 0 0 18px rgba(255, 255, 255, 0.12);
          opacity: 0.26;
          animation: abyssalCrystalFloat 8s ease-in-out infinite alternate;
        }

        .abyssal-crystal-one {
          left: 7%;
          bottom: 4%;
          transform: rotate(-12deg);
        }

        .abyssal-crystal-two {
          right: 10%;
          bottom: 8%;
          width: 34px;
          height: 56px;
          animation-delay: -2s;
        }

        .abyssal-crystal-three {
          left: 48%;
          bottom: -18px;
          width: 52px;
          height: 82px;
          opacity: 0.18;
          animation-delay: -4s;
        }

        .abyssal-bubble {
          position: absolute;
          border-radius: 999px;
          border: 1px solid rgba(165, 243, 252, 0.42);
          background: radial-gradient(
            circle at 30% 25%,
            rgba(255, 255, 255, 0.55),
            rgba(103, 232, 249, 0.14) 35%,
            transparent 70%
          );
          box-shadow: 0 0 14px rgba(103, 232, 249, 0.16);
          opacity: 0;
          animation: abyssalBubbleRise 7s ease-in-out infinite;
        }

        .abyssal-bubble-one {
          width: 11px;
          height: 11px;
          left: 12%;
          bottom: -10px;
        }

        .abyssal-bubble-two {
          width: 7px;
          height: 7px;
          left: 30%;
          bottom: -10px;
          animation-delay: -1.4s;
        }

        .abyssal-bubble-three {
          width: 13px;
          height: 13px;
          right: 24%;
          bottom: -10px;
          animation-delay: -2.8s;
        }

        .abyssal-bubble-four {
          width: 8px;
          height: 8px;
          right: 10%;
          bottom: -10px;
          animation-delay: -4.2s;
        }

        .abyssal-bubble-five {
          width: 6px;
          height: 6px;
          left: 58%;
          bottom: -10px;
          animation-delay: -5.2s;
        }

        .abyssal-bubble-six {
          width: 10px;
          height: 10px;
          left: 74%;
          bottom: -10px;
          animation-delay: -6s;
        }

        .abyssal-plankton {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: rgba(134, 239, 172, 0.86);
          box-shadow:
            0 0 10px rgba(134, 239, 172, 0.75),
            0 0 20px rgba(103, 232, 249, 0.35);
          animation: abyssalPlanktonDrift 8s ease-in-out infinite;
        }

        .abyssal-plankton-one {
          left: 18%;
          top: 26%;
        }

        .abyssal-plankton-two {
          left: 42%;
          top: 18%;
          animation-delay: -1.7s;
        }

        .abyssal-plankton-three {
          right: 22%;
          top: 36%;
          animation-delay: -3.1s;
        }

        .abyssal-plankton-four {
          left: 60%;
          bottom: 20%;
          animation-delay: -4.5s;
        }

        .abyssal-plankton-five {
          left: 28%;
          bottom: 28%;
          animation-delay: -5.9s;
        }

        .abyssal-ripple {
          position: absolute;
          border-radius: 999px;
          border: 1px solid rgba(103, 232, 249, 0.18);
          box-shadow:
            0 0 28px rgba(103, 232, 249, 0.12),
            inset 0 0 18px rgba(16, 185, 129, 0.08);
          opacity: 0.45;
          animation: abyssalRipplePulse 6s ease-in-out infinite;
        }

        .abyssal-ripple-one {
          width: 220px;
          height: 90px;
          left: -50px;
          bottom: 12%;
        }

        .abyssal-ripple-two {
          width: 260px;
          height: 110px;
          right: -80px;
          top: 18%;
          animation-delay: -2.5s;
        }

        @keyframes abyssalWaterShift {
          0% {
            transform: translate3d(-12px, -4px, 0) scale(1);
          }
          100% {
            transform: translate3d(16px, 8px, 0) scale(1.04);
          }
        }

        @keyframes abyssalRayDrift {
          0% {
            transform: translateX(-14px) rotate(13deg);
            opacity: 0.18;
          }
          100% {
            transform: translateX(18px) rotate(17deg);
            opacity: 0.38;
          }
        }

        @keyframes abyssalCrystalFloat {
          0% {
            transform: translateY(0) rotate(-10deg);
            opacity: 0.18;
          }
          100% {
            transform: translateY(-12px) rotate(-4deg);
            opacity: 0.34;
          }
        }

        @keyframes abyssalBubbleRise {
          0% {
            transform: translate3d(0, 0, 0) scale(0.7);
            opacity: 0;
          }
          15% {
            opacity: 0.65;
          }
          78% {
            opacity: 0.5;
          }
          100% {
            transform: translate3d(18px, -145px, 0) scale(1.15);
            opacity: 0;
          }
        }

        @keyframes abyssalPlanktonDrift {
          0% {
            transform: translate3d(0, 12px, 0) scale(0.75);
            opacity: 0.25;
          }
          50% {
            transform: translate3d(16px, -10px, 0) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate3d(-10px, -34px, 0) scale(0.85);
            opacity: 0.2;
          }
        }

        @keyframes abyssalRipplePulse {
          0%,
          100% {
            transform: scale(0.94);
            opacity: 0.24;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.58;
          }
        }
      `}</style>
    </div>
  );
}
