"use client";

import React from "react";

type SovereignTempestEffectProps = {
  variant?: "card" | "compact" | "preview";
};

export default function SovereignTempestEffect({
  variant = "card",
}: SovereignTempestEffectProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${
        isCompact ? "opacity-80" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.20),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.12),transparent_36%)]" />

      <div className="tempest-cloud tempest-cloud-one" />
      <div className="tempest-cloud tempest-cloud-two" />
      <div className="tempest-cloud tempest-cloud-three" />

      <div className="tempest-lightning tempest-lightning-one" />
      <div className="tempest-lightning tempest-lightning-two" />
      <div className="tempest-lightning tempest-lightning-three" />

      <div className="tempest-ring tempest-ring-one" />
      <div className="tempest-ring tempest-ring-two" />

      <div className="tempest-spark tempest-spark-one" />
      <div className="tempest-spark tempest-spark-two" />
      <div className="tempest-spark tempest-spark-three" />
      <div className="tempest-spark tempest-spark-four" />
      <div className="tempest-spark tempest-spark-five" />

      <div className="tempest-shine" />

      <style jsx>{`
        .tempest-cloud {
          position: absolute;
          border-radius: 999px;
          filter: blur(18px);
          opacity: 0.45;
          background:
            radial-gradient(circle, rgba(255, 255, 255, 0.34), transparent 35%),
            radial-gradient(circle, rgba(250, 204, 21, 0.26), transparent 48%),
            radial-gradient(circle, rgba(168, 85, 247, 0.22), transparent 70%);
          animation: tempestCloudDrift 9s ease-in-out infinite alternate;
        }

        .tempest-cloud-one {
          width: 220px;
          height: 88px;
          left: -38px;
          top: 18px;
        }

        .tempest-cloud-two {
          width: 190px;
          height: 80px;
          right: -34px;
          top: 52px;
          animation-duration: 11s;
          animation-delay: -2s;
        }

        .tempest-cloud-three {
          width: 260px;
          height: 92px;
          left: 30%;
          bottom: -34px;
          animation-duration: 13s;
          animation-delay: -4s;
        }

        .tempest-lightning {
          position: absolute;
          width: 2px;
          height: 72px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(255, 255, 255, 0.94),
            rgba(250, 204, 21, 0.95),
            rgba(168, 85, 247, 0.75),
            transparent
          );
          clip-path: polygon(
            45% 0,
            78% 30%,
            58% 30%,
            92% 100%,
            28% 45%,
            48% 45%
          );
          filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.75));
          opacity: 0;
          animation: tempestLightning 3.8s ease-in-out infinite;
        }

        .tempest-lightning-one {
          left: 22%;
          top: 4%;
        }

        .tempest-lightning-two {
          right: 20%;
          top: 18%;
          height: 54px;
          animation-delay: 1.2s;
        }

        .tempest-lightning-three {
          left: 56%;
          bottom: 10%;
          height: 62px;
          animation-delay: 2.1s;
        }

        .tempest-ring {
          position: absolute;
          border-radius: 999px;
          border: 1px solid rgba(250, 204, 21, 0.24);
          box-shadow:
            0 0 18px rgba(250, 204, 21, 0.13),
            inset 0 0 18px rgba(168, 85, 247, 0.12);
          animation: tempestPulse 5s ease-in-out infinite;
        }

        .tempest-ring-one {
          width: 180px;
          height: 180px;
          right: -70px;
          top: -70px;
        }

        .tempest-ring-two {
          width: 140px;
          height: 140px;
          left: -52px;
          bottom: -58px;
          animation-delay: -2s;
        }

        .tempest-spark {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: rgba(250, 204, 21, 0.95);
          box-shadow:
            0 0 12px rgba(250, 204, 21, 0.95),
            0 0 24px rgba(168, 85, 247, 0.45);
          animation: tempestSparkFloat 6s ease-in-out infinite;
        }

        .tempest-spark-one {
          left: 12%;
          top: 24%;
        }

        .tempest-spark-two {
          left: 44%;
          top: 12%;
          animation-delay: -1.6s;
        }

        .tempest-spark-three {
          right: 18%;
          top: 40%;
          animation-delay: -2.8s;
        }

        .tempest-spark-four {
          left: 34%;
          bottom: 18%;
          animation-delay: -3.6s;
        }

        .tempest-spark-five {
          right: 34%;
          bottom: 12%;
          animation-delay: -4.4s;
        }

        .tempest-shine {
          position: absolute;
          inset: -80px;
          background: linear-gradient(
            115deg,
            transparent 0%,
            transparent 36%,
            rgba(255, 255, 255, 0.12) 46%,
            rgba(250, 204, 21, 0.10) 50%,
            transparent 62%,
            transparent 100%
          );
          transform: translateX(-45%);
          animation: tempestShineMove 7s ease-in-out infinite;
        }

        @keyframes tempestCloudDrift {
          0% {
            transform: translate3d(-12px, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(18px, 8px, 0) scale(1.08);
          }
        }

        @keyframes tempestLightning {
          0%,
          72%,
          100% {
            opacity: 0;
            transform: scaleY(0.7);
          }
          76% {
            opacity: 1;
            transform: scaleY(1.08);
          }
          80% {
            opacity: 0.15;
            transform: scaleY(0.92);
          }
          84% {
            opacity: 0.86;
            transform: scaleY(1);
          }
          88% {
            opacity: 0;
            transform: scaleY(0.8);
          }
        }

        @keyframes tempestPulse {
          0%,
          100% {
            transform: scale(0.95);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.85;
          }
        }

        @keyframes tempestSparkFloat {
          0% {
            transform: translate3d(0, 18px, 0) scale(0.75);
            opacity: 0;
          }
          18% {
            opacity: 1;
          }
          65% {
            opacity: 0.85;
          }
          100% {
            transform: translate3d(18px, -46px, 0) scale(1.08);
            opacity: 0;
          }
        }

        @keyframes tempestShineMove {
          0%,
          25% {
            transform: translateX(-60%) rotate(0deg);
            opacity: 0;
          }
          45% {
            opacity: 0.7;
          }
          70% {
            transform: translateX(55%) rotate(0deg);
            opacity: 0;
          }
          100% {
            transform: translateX(55%) rotate(0deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
