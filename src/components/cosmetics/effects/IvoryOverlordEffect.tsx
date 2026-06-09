"use client";

import React from "react";

type IvoryOverlordEffectProps = {
  variant?: "card" | "compact" | "preview";
};

export default function IvoryOverlordEffect({
  variant = "card",
}: IvoryOverlordEffectProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${
        isCompact ? "opacity-85" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(226,232,240,0.14),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(8,47,73,0.34),transparent_48%)]" />

      <div className="ivory-throne" />

      <div className="ivory-crown ivory-crown-one" />
      <div className="ivory-crown ivory-crown-two" />

      <div className="ivory-bone ivory-bone-one" />
      <div className="ivory-bone ivory-bone-two" />
      <div className="ivory-bone ivory-bone-three" />

      <div className="ivory-soulfire ivory-soulfire-one" />
      <div className="ivory-soulfire ivory-soulfire-two" />
      <div className="ivory-soulfire ivory-soulfire-three" />
      <div className="ivory-soulfire ivory-soulfire-four" />

      <div className="ivory-ash ivory-ash-one" />
      <div className="ivory-ash ivory-ash-two" />
      <div className="ivory-ash ivory-ash-three" />
      <div className="ivory-ash ivory-ash-four" />
      <div className="ivory-ash ivory-ash-five" />
      <div className="ivory-ash ivory-ash-six" />
      <div className="ivory-ash ivory-ash-seven" />

      <div className="ivory-smoke ivory-smoke-one" />
      <div className="ivory-smoke ivory-smoke-two" />
      <div className="ivory-smoke ivory-smoke-three" />

      <div className="ivory-crack ivory-crack-one" />
      <div className="ivory-crack ivory-crack-two" />
      <div className="ivory-crack ivory-crack-three" />

      <div className="ivory-shine" />

      <style jsx>{`
        .ivory-throne {
          position: absolute;
          left: 50%;
          bottom: -30px;
          width: 210px;
          height: 150px;
          transform: translateX(-50%);
          border-radius: 36px 36px 12px 12px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.28),
              rgba(226, 232, 240, 0.12),
              rgba(14, 165, 233, 0.08),
              rgba(2, 6, 23, 0.05)
            );
          border: 1px solid rgba(226, 232, 240, 0.16);
          box-shadow:
            0 0 38px rgba(34, 211, 238, 0.12),
            inset 0 0 42px rgba(255, 255, 255, 0.08);
          opacity: 0.22;
          clip-path: polygon(
            12% 100%,
            12% 35%,
            25% 35%,
            25% 8%,
            40% 28%,
            50% 0%,
            60% 28%,
            75% 8%,
            75% 35%,
            88% 35%,
            88% 100%
          );
          animation: ivoryThronePulse 8s ease-in-out infinite;
        }

        .ivory-crown {
          position: absolute;
          width: 96px;
          height: 54px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.42),
              rgba(226, 232, 240, 0.22),
              rgba(148, 163, 184, 0.12)
            );
          border: 1px solid rgba(226, 232, 240, 0.18);
          box-shadow:
            0 0 26px rgba(34, 211, 238, 0.14),
            inset 0 0 18px rgba(255, 255, 255, 0.12);
          clip-path: polygon(
            0 100%,
            0 48%,
            16% 48%,
            22% 10%,
            38% 46%,
            50% 0%,
            62% 46%,
            78% 10%,
            84% 48%,
            100% 48%,
            100% 100%
          );
          opacity: 0.2;
          animation: ivoryCrownFloat 9s ease-in-out infinite alternate;
        }

        .ivory-crown-one {
          left: 8%;
          top: 10%;
          transform: rotate(-12deg);
        }

        .ivory-crown-two {
          right: 8%;
          bottom: 14%;
          transform: rotate(10deg) scale(0.82);
          animation-delay: -3s;
        }

        .ivory-bone {
          position: absolute;
          width: 160px;
          height: 12px;
          border-radius: 999px;
          background:
            radial-gradient(circle at 6% 50%, rgba(255, 255, 255, 0.45), transparent 12%),
            radial-gradient(circle at 94% 50%, rgba(255, 255, 255, 0.45), transparent 12%),
            linear-gradient(
              90deg,
              rgba(226, 232, 240, 0),
              rgba(226, 232, 240, 0.28),
              rgba(34, 211, 238, 0.12),
              rgba(226, 232, 240, 0)
            );
          box-shadow:
            0 0 18px rgba(226, 232, 240, 0.10),
            0 0 24px rgba(34, 211, 238, 0.08);
          opacity: 0.23;
          animation: ivoryBoneDrift 10s ease-in-out infinite alternate;
        }

        .ivory-bone-one {
          left: -46px;
          top: 30%;
          transform: rotate(18deg);
        }

        .ivory-bone-two {
          right: -50px;
          top: 18%;
          transform: rotate(-16deg);
          animation-delay: -3s;
        }

        .ivory-bone-three {
          left: 35%;
          bottom: 10%;
          transform: rotate(5deg);
          animation-delay: -5s;
        }

        .ivory-soulfire {
          position: absolute;
          width: 34px;
          height: 70px;
          border-radius: 50% 50% 45% 45%;
          background:
            radial-gradient(circle at 50% 70%, rgba(255, 255, 255, 0.72), transparent 18%),
            radial-gradient(circle at 50% 48%, rgba(103, 232, 249, 0.78), transparent 35%),
            radial-gradient(circle at 50% 62%, rgba(14, 165, 233, 0.38), transparent 58%),
            transparent;
          filter: blur(0.2px) drop-shadow(0 0 18px rgba(34, 211, 238, 0.42));
          opacity: 0.45;
          clip-path: polygon(
            50% 0%,
            72% 22%,
            64% 44%,
            86% 70%,
            56% 100%,
            48% 78%,
            32% 100%,
            10% 70%,
            34% 42%,
            26% 20%
          );
          animation: ivorySoulFlame 4.8s ease-in-out infinite;
        }

        .ivory-soulfire-one {
          left: 14%;
          bottom: 8%;
        }

        .ivory-soulfire-two {
          right: 16%;
          bottom: 12%;
          animation-delay: -1.4s;
          transform: scale(0.82);
        }

        .ivory-soulfire-three {
          left: 48%;
          top: 12%;
          animation-delay: -2.8s;
          transform: scale(0.74);
        }

        .ivory-soulfire-four {
          right: 36%;
          bottom: 4%;
          animation-delay: -3.6s;
          transform: scale(0.92);
        }

        .ivory-ash {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: rgba(226, 232, 240, 0.82);
          box-shadow:
            0 0 10px rgba(226, 232, 240, 0.48),
            0 0 18px rgba(34, 211, 238, 0.22);
          opacity: 0;
          animation: ivoryAshRise 8s ease-in-out infinite;
        }

        .ivory-ash-one {
          left: 12%;
          bottom: -8px;
        }

        .ivory-ash-two {
          left: 28%;
          bottom: -8px;
          animation-delay: -1.1s;
        }

        .ivory-ash-three {
          left: 44%;
          bottom: -8px;
          animation-delay: -2.2s;
        }

        .ivory-ash-four {
          left: 60%;
          bottom: -8px;
          animation-delay: -3.3s;
        }

        .ivory-ash-five {
          left: 74%;
          bottom: -8px;
          animation-delay: -4.4s;
        }

        .ivory-ash-six {
          left: 86%;
          bottom: -8px;
          animation-delay: -5.5s;
        }

        .ivory-ash-seven {
          left: 36%;
          bottom: -8px;
          animation-delay: -6.6s;
        }

        .ivory-smoke {
          position: absolute;
          height: 82px;
          border-radius: 999px;
          filter: blur(24px);
          background:
            radial-gradient(circle, rgba(34, 211, 238, 0.18), transparent 50%),
            radial-gradient(circle, rgba(226, 232, 240, 0.13), transparent 70%);
          opacity: 0.36;
          animation: ivorySmokeFlow 9s ease-in-out infinite alternate;
        }

        .ivory-smoke-one {
          width: 260px;
          left: -60px;
          bottom: -34px;
        }

        .ivory-smoke-two {
          width: 230px;
          right: -60px;
          bottom: -30px;
          animation-delay: -2.5s;
        }

        .ivory-smoke-three {
          width: 210px;
          left: 36%;
          bottom: -44px;
          animation-delay: -5s;
        }

        .ivory-crack {
          position: absolute;
          width: 2px;
          height: 70px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(34, 211, 238, 0.76),
            rgba(255, 255, 255, 0.58),
            transparent
          );
          clip-path: polygon(
            46% 0%,
            72% 26%,
            52% 26%,
            78% 56%,
            48% 56%,
            62% 100%,
            24% 44%,
            44% 44%
          );
          filter: drop-shadow(0 0 12px rgba(34, 211, 238, 0.54));
          opacity: 0;
          animation: ivoryCrackGlow 5.4s ease-in-out infinite;
        }

        .ivory-crack-one {
          left: 22%;
          top: 10%;
        }

        .ivory-crack-two {
          right: 28%;
          top: 24%;
          animation-delay: -1.8s;
        }

        .ivory-crack-three {
          left: 54%;
          bottom: 8%;
          animation-delay: -3.4s;
        }

        .ivory-shine {
          position: absolute;
          inset: -70px;
          background: linear-gradient(
            118deg,
            transparent 0%,
            transparent 38%,
            rgba(255, 255, 255, 0.12) 47%,
            rgba(34, 211, 238, 0.10) 52%,
            transparent 64%,
            transparent 100%
          );
          transform: translateX(-64%);
          animation: ivoryShineMove 8s ease-in-out infinite;
        }

        @keyframes ivoryThronePulse {
          0%,
          100% {
            transform: translateX(-50%) scale(0.96);
            opacity: 0.16;
          }
          50% {
            transform: translateX(-50%) scale(1.04);
            opacity: 0.28;
          }
        }

        @keyframes ivoryCrownFloat {
          0% {
            transform: translateY(0) rotate(-12deg) scale(0.96);
            opacity: 0.14;
          }
          100% {
            transform: translateY(-14px) rotate(-7deg) scale(1.04);
            opacity: 0.28;
          }
        }

        @keyframes ivoryBoneDrift {
          0% {
            opacity: 0.14;
            filter: blur(0px);
          }
          100% {
            opacity: 0.32;
            filter: blur(0.4px);
          }
        }

        @keyframes ivorySoulFlame {
          0%,
          100% {
            transform: translateY(8px) scale(0.86) rotate(-2deg);
            opacity: 0.28;
          }
          50% {
            transform: translateY(-12px) scale(1.08) rotate(3deg);
            opacity: 0.62;
          }
        }

        @keyframes ivoryAshRise {
          0% {
            transform: translate3d(0, 18px, 0) scale(0.7);
            opacity: 0;
          }
          18% {
            opacity: 0.74;
          }
          68% {
            opacity: 0.55;
          }
          100% {
            transform: translate3d(22px, -150px, 0) scale(1.15);
            opacity: 0;
          }
        }

        @keyframes ivorySmokeFlow {
          0% {
            transform: translate3d(-24px, 0, 0) scaleX(0.92);
            opacity: 0.22;
          }
          100% {
            transform: translate3d(34px, -12px, 0) scaleX(1.1);
            opacity: 0.46;
          }
        }

        @keyframes ivoryCrackGlow {
          0%,
          64%,
          100% {
            opacity: 0;
            transform: scaleY(0.72);
          }
          72% {
            opacity: 0.76;
            transform: scaleY(1.1);
          }
          82% {
            opacity: 0.28;
            transform: scaleY(0.92);
          }
          90% {
            opacity: 0.62;
            transform: scaleY(1);
          }
        }

        @keyframes ivoryShineMove {
          0%,
          24% {
            transform: translateX(-64%);
            opacity: 0;
          }
          45% {
            opacity: 0.68;
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
