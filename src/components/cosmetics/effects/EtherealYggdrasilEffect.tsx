"use client";

import React from "react";

type EtherealYggdrasilEffectProps = {
  variant?: "card" | "compact" | "preview";
};

export default function EtherealYggdrasilEffect({
  variant = "card",
}: EtherealYggdrasilEffectProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${
        isCompact ? "opacity-85" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(134,239,172,0.16),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(250,204,21,0.10),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(21,128,61,0.22),transparent_46%)]" />

      <div className="yggdrasil-breath" />

      <div className="yggdrasil-root yggdrasil-root-one" />
      <div className="yggdrasil-root yggdrasil-root-two" />
      <div className="yggdrasil-root yggdrasil-root-three" />

      <div className="yggdrasil-vine yggdrasil-vine-one" />
      <div className="yggdrasil-vine yggdrasil-vine-two" />

      <div className="yggdrasil-leaf yggdrasil-leaf-one" />
      <div className="yggdrasil-leaf yggdrasil-leaf-two" />
      <div className="yggdrasil-leaf yggdrasil-leaf-three" />
      <div className="yggdrasil-leaf yggdrasil-leaf-four" />
      <div className="yggdrasil-leaf yggdrasil-leaf-five" />
      <div className="yggdrasil-leaf yggdrasil-leaf-six" />

      <div className="yggdrasil-spore yggdrasil-spore-one" />
      <div className="yggdrasil-spore yggdrasil-spore-two" />
      <div className="yggdrasil-spore yggdrasil-spore-three" />
      <div className="yggdrasil-spore yggdrasil-spore-four" />
      <div className="yggdrasil-spore yggdrasil-spore-five" />
      <div className="yggdrasil-spore yggdrasil-spore-six" />
      <div className="yggdrasil-spore yggdrasil-spore-seven" />

      <div className="yggdrasil-butterfly yggdrasil-butterfly-one" />
      <div className="yggdrasil-butterfly yggdrasil-butterfly-two" />
      <div className="yggdrasil-butterfly yggdrasil-butterfly-three" />

      <div className="yggdrasil-waterfall" />
      <div className="yggdrasil-shine" />

      <style jsx>{`
        .yggdrasil-breath {
          position: absolute;
          inset: -48px;
          background:
            radial-gradient(circle at 24% 22%, rgba(187, 247, 208, 0.12), transparent 34%),
            radial-gradient(circle at 72% 70%, rgba(250, 204, 21, 0.08), transparent 38%),
            linear-gradient(
              115deg,
              transparent 0%,
              rgba(34, 197, 94, 0.05) 28%,
              transparent 48%,
              rgba(187, 247, 208, 0.06) 62%,
              transparent 82%
            );
          filter: blur(3px);
          animation: yggdrasilBreath 10s ease-in-out infinite alternate;
        }

        .yggdrasil-root {
          position: absolute;
          height: 6px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            rgba(74, 222, 128, 0),
            rgba(120, 113, 108, 0.55),
            rgba(134, 239, 172, 0.34),
            rgba(250, 204, 21, 0.12),
            rgba(74, 222, 128, 0)
          );
          box-shadow:
            0 0 16px rgba(74, 222, 128, 0.16),
            inset 0 0 8px rgba(250, 204, 21, 0.12);
          opacity: 0.4;
          animation: yggdrasilRootGrow 8s ease-in-out infinite alternate;
        }

        .yggdrasil-root-one {
          width: 260px;
          left: -52px;
          bottom: 18%;
          transform: rotate(-9deg);
        }

        .yggdrasil-root-two {
          width: 210px;
          right: -44px;
          bottom: 32%;
          transform: rotate(11deg);
          animation-delay: -2.5s;
        }

        .yggdrasil-root-three {
          width: 300px;
          left: 24%;
          bottom: -4px;
          transform: rotate(2deg);
          animation-delay: -4.2s;
        }

        .yggdrasil-vine {
          position: absolute;
          width: 58px;
          height: 190px;
          border: 2px solid rgba(74, 222, 128, 0.18);
          border-left-color: transparent;
          border-bottom-color: transparent;
          border-radius: 999px 999px 0 0;
          filter: drop-shadow(0 0 14px rgba(74, 222, 128, 0.12));
          opacity: 0.46;
          animation: yggdrasilVineSway 8s ease-in-out infinite alternate;
        }

        .yggdrasil-vine-one {
          left: -18px;
          top: -18px;
          transform: rotate(18deg);
        }

        .yggdrasil-vine-two {
          right: -20px;
          top: 10%;
          transform: rotate(-28deg);
          animation-delay: -3s;
        }

        .yggdrasil-leaf {
          position: absolute;
          width: 16px;
          height: 10px;
          border-radius: 100% 0 100% 0;
          background: linear-gradient(
            135deg,
            rgba(187, 247, 208, 0.95),
            rgba(74, 222, 128, 0.42),
            rgba(21, 128, 61, 0.28)
          );
          box-shadow:
            0 0 14px rgba(134, 239, 172, 0.42),
            0 0 24px rgba(250, 204, 21, 0.12);
          opacity: 0;
          animation: yggdrasilLeafFall 9s linear infinite;
        }

        .yggdrasil-leaf-one {
          left: 10%;
          top: -18px;
        }

        .yggdrasil-leaf-two {
          left: 26%;
          top: -18px;
          animation-delay: -1.5s;
          transform: scale(0.85);
        }

        .yggdrasil-leaf-three {
          left: 48%;
          top: -18px;
          animation-delay: -3s;
          transform: scale(1.08);
        }

        .yggdrasil-leaf-four {
          right: 24%;
          top: -18px;
          animation-delay: -4.5s;
          transform: scale(0.78);
        }

        .yggdrasil-leaf-five {
          right: 10%;
          top: -18px;
          animation-delay: -6s;
          transform: scale(1.12);
        }

        .yggdrasil-leaf-six {
          left: 70%;
          top: -18px;
          animation-delay: -7.4s;
          transform: scale(0.92);
        }

        .yggdrasil-spore {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: rgba(187, 247, 208, 0.95);
          box-shadow:
            0 0 12px rgba(187, 247, 208, 0.82),
            0 0 24px rgba(250, 204, 21, 0.22);
          animation: yggdrasilSporeFloat 7s ease-in-out infinite;
        }

        .yggdrasil-spore-one {
          left: 14%;
          bottom: 16%;
        }

        .yggdrasil-spore-two {
          left: 31%;
          bottom: 10%;
          animation-delay: -1s;
        }

        .yggdrasil-spore-three {
          left: 48%;
          bottom: 22%;
          animation-delay: -2s;
        }

        .yggdrasil-spore-four {
          right: 34%;
          bottom: 12%;
          animation-delay: -3s;
        }

        .yggdrasil-spore-five {
          right: 18%;
          bottom: 28%;
          animation-delay: -4s;
        }

        .yggdrasil-spore-six {
          left: 64%;
          top: 22%;
          animation-delay: -5s;
        }

        .yggdrasil-spore-seven {
          left: 22%;
          top: 30%;
          animation-delay: -6s;
        }

        .yggdrasil-butterfly {
          position: absolute;
          width: 24px;
          height: 18px;
          opacity: 0;
          filter: drop-shadow(0 0 10px rgba(187, 247, 208, 0.45));
          animation: yggdrasilButterflyOrbit 12s ease-in-out infinite;
        }

        .yggdrasil-butterfly::before,
        .yggdrasil-butterfly::after {
          content: "";
          position: absolute;
          top: 2px;
          width: 11px;
          height: 14px;
          border-radius: 80% 80% 45% 45%;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.78),
            rgba(134, 239, 172, 0.55),
            rgba(250, 204, 21, 0.18)
          );
          box-shadow: 0 0 16px rgba(134, 239, 172, 0.34);
          animation: yggdrasilWingFlutter 1.2s ease-in-out infinite alternate;
        }

        .yggdrasil-butterfly::before {
          left: 1px;
          transform-origin: right center;
        }

        .yggdrasil-butterfly::after {
          right: 1px;
          transform-origin: left center;
        }

        .yggdrasil-butterfly-one {
          left: 6%;
          bottom: 18%;
        }

        .yggdrasil-butterfly-two {
          right: 10%;
          bottom: 28%;
          animation-delay: -4s;
          transform: scale(0.8);
        }

        .yggdrasil-butterfly-three {
          left: 46%;
          top: 14%;
          animation-delay: -7s;
          transform: scale(0.9);
        }

        .yggdrasil-waterfall {
          position: absolute;
          right: 16%;
          top: 0;
          width: 42px;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(187, 247, 208, 0.12),
            rgba(74, 222, 128, 0.06),
            transparent
          );
          filter: blur(12px);
          opacity: 0.26;
          animation: yggdrasilWaterfallFlow 5s linear infinite;
        }

        .yggdrasil-shine {
          position: absolute;
          inset: -70px;
          background: linear-gradient(
            118deg,
            transparent 0%,
            transparent 36%,
            rgba(187, 247, 208, 0.10) 46%,
            rgba(250, 204, 21, 0.08) 52%,
            transparent 64%,
            transparent 100%
          );
          transform: translateX(-62%);
          animation: yggdrasilShineMove 8s ease-in-out infinite;
        }

        @keyframes yggdrasilBreath {
          0% {
            transform: scale(1) translate3d(-10px, 0, 0);
            opacity: 0.65;
          }
          100% {
            transform: scale(1.05) translate3d(12px, -8px, 0);
            opacity: 1;
          }
        }

        @keyframes yggdrasilRootGrow {
          0% {
            transform: scaleX(0.82) translateY(5px);
            opacity: 0.18;
          }
          100% {
            transform: scaleX(1.08) translateY(-3px);
            opacity: 0.48;
          }
        }

        @keyframes yggdrasilVineSway {
          0% {
            transform: rotate(14deg) translateY(0);
            opacity: 0.24;
          }
          100% {
            transform: rotate(22deg) translateY(8px);
            opacity: 0.55;
          }
        }

        @keyframes yggdrasilLeafFall {
          0% {
            transform: translate3d(0, -20px, 0) rotate(0deg) scale(0.72);
            opacity: 0;
          }
          12% {
            opacity: 0.84;
          }
          64% {
            opacity: 0.68;
          }
          100% {
            transform: translate3d(42px, 190px, 0) rotate(210deg) scale(1.04);
            opacity: 0;
          }
        }

        @keyframes yggdrasilSporeFloat {
          0% {
            transform: translate3d(0, 18px, 0) scale(0.7);
            opacity: 0;
          }
          18% {
            opacity: 0.9;
          }
          62% {
            opacity: 0.75;
          }
          100% {
            transform: translate3d(22px, -64px, 0) scale(1.12);
            opacity: 0;
          }
        }

        @keyframes yggdrasilButterflyOrbit {
          0% {
            transform: translate3d(0, 18px, 0) scale(0.8);
            opacity: 0;
          }
          14% {
            opacity: 0.88;
          }
          50% {
            transform: translate3d(70px, -38px, 0) scale(1);
            opacity: 0.92;
          }
          86% {
            opacity: 0.75;
          }
          100% {
            transform: translate3d(130px, 8px, 0) scale(0.78);
            opacity: 0;
          }
        }

        @keyframes yggdrasilWingFlutter {
          0% {
            transform: rotateY(0deg) rotateZ(-8deg);
          }
          100% {
            transform: rotateY(54deg) rotateZ(8deg);
          }
        }

        @keyframes yggdrasilWaterfallFlow {
          0% {
            transform: translateY(-22px);
            opacity: 0.18;
          }
          50% {
            opacity: 0.36;
          }
          100% {
            transform: translateY(22px);
            opacity: 0.18;
          }
        }

        @keyframes yggdrasilShineMove {
          0%,
          25% {
            transform: translateX(-64%);
            opacity: 0;
          }
          45% {
            opacity: 0.6;
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
