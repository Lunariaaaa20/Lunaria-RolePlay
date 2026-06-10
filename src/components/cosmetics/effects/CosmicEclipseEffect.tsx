"use client";

import React from "react";

type CosmicEclipseEffectProps = {
  variant?: "name" | "border" | "background" | "aura" | "particle" | "full";
  children?: React.ReactNode;
  className?: string;
};

export default function CosmicEclipseEffect({
  variant = "full",
  children,
  className = "",
}: CosmicEclipseEffectProps) {
  if (variant === "name") {
    return <CosmicNameEffect className={className}>{children}</CosmicNameEffect>;
  }

  if (variant === "border") {
    return <CosmicBorderEffect className={className}>{children}</CosmicBorderEffect>;
  }

  if (variant === "background") {
    return (
      <CosmicBackgroundEffect className={className}>
        {children}
      </CosmicBackgroundEffect>
    );
  }

  if (variant === "aura") {
    return <CosmicAuraEffect className={className}>{children}</CosmicAuraEffect>;
  }

  if (variant === "particle") {
    return (
      <CosmicParticleEffect className={className}>
        {children}
      </CosmicParticleEffect>
    );
  }

  return <CosmicFullEffect className={className}>{children}</CosmicFullEffect>;
}

export function CosmicNameEffect({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`ce-name relative inline-block ${className}`}>
      <span className="ce-name-core relative z-10">{children}</span>
      <span className="ce-name-shadow pointer-events-none absolute inset-0 z-20" />
      <span className="ce-name-crack pointer-events-none absolute inset-0 z-30" />
    </span>
  );
}

export function CosmicBorderEffect({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`ce-border relative overflow-hidden ${className}`}>
      <span className="ce-border-corona pointer-events-none absolute inset-0" />
      <span className="ce-border-smoke pointer-events-none absolute inset-0" />
      <span className="ce-corner ce-corner-tl" />
      <span className="ce-corner ce-corner-tr" />
      <span className="ce-corner ce-corner-bl" />
      <span className="ce-corner ce-corner-br" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function CosmicBackgroundEffect({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`ce-background relative overflow-hidden ${className}`}>
      <div className="ce-eclipse pointer-events-none absolute" />
      <div className="ce-corona pointer-events-none absolute" />
      <div className="ce-temple pointer-events-none absolute" />
      <div className="ce-storm ce-storm-1 pointer-events-none absolute" />
      <div className="ce-storm ce-storm-2 pointer-events-none absolute" />
      <div className="ce-lightning ce-lightning-1 pointer-events-none absolute" />
      <div className="ce-lightning ce-lightning-2 pointer-events-none absolute" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function CosmicAuraEffect({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`ce-aura relative ${className}`}>
      <span className="ce-aura-shadow pointer-events-none absolute" />
      <span className="ce-aura-corona ce-aura-corona-1 pointer-events-none absolute" />
      <span className="ce-aura-corona ce-aura-corona-2 pointer-events-none absolute" />
      <span className="ce-aura-devour pointer-events-none absolute" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function CosmicParticleEffect({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`ce-particle-wrap relative overflow-hidden ${className}`}>
      <CosmicParticles />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function CosmicFullEffect({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`ce-full relative overflow-hidden ${className}`}>
      <div className="ce-eclipse pointer-events-none absolute" />
      <div className="ce-corona pointer-events-none absolute" />
      <div className="ce-temple pointer-events-none absolute" />
      <div className="ce-storm ce-storm-1 pointer-events-none absolute" />
      <div className="ce-storm ce-storm-2 pointer-events-none absolute" />
      <div className="ce-lightning ce-lightning-1 pointer-events-none absolute" />
      <div className="ce-lightning ce-lightning-2 pointer-events-none absolute" />

      <span className="ce-aura-shadow pointer-events-none absolute" />
      <span className="ce-aura-corona ce-aura-corona-1 pointer-events-none absolute" />
      <span className="ce-aura-corona ce-aura-corona-2 pointer-events-none absolute" />
      <span className="ce-aura-devour pointer-events-none absolute" />

      <CosmicParticles />

      <span className="ce-border-corona pointer-events-none absolute inset-0" />
      <span className="ce-border-smoke pointer-events-none absolute inset-0" />
      <span className="ce-corner ce-corner-tl" />
      <span className="ce-corner ce-corner-tr" />
      <span className="ce-corner ce-corner-bl" />
      <span className="ce-corner ce-corner-br" />

      <div className="relative z-10">{children}</div>

      <style jsx>{styles}</style>
    </div>
  );
}

function CosmicParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
      {Array.from({ length: 22 }).map((_, index) => (
        <span
          key={`ce-particle-${index}`}
          className="ce-particle absolute"
          style={{
            left: `${4 + ((index * 19) % 92)}%`,
            top: `${8 + ((index * 23) % 86)}%`,
            animationDelay: `${(index % 11) * 0.42}s`,
            animationDuration: `${4.2 + (index % 6) * 0.55}s`,
            opacity: 0.22 + (index % 5) * 0.08,
          }}
        />
      ))}
    </div>
  );
}

const styles = `
  @keyframes ce-name-pulse {
    0%, 100% {
      filter:
        drop-shadow(0 0 5px rgba(248, 113, 113, 0.28))
        drop-shadow(0 0 14px rgba(127, 29, 29, 0.34));
    }
    50% {
      filter:
        drop-shadow(0 0 10px rgba(252, 165, 165, 0.45))
        drop-shadow(0 0 22px rgba(185, 28, 28, 0.42))
        drop-shadow(0 0 34px rgba(251, 191, 36, 0.14));
    }
  }

  @keyframes ce-shadow-sweep {
    0% {
      transform: translateX(-150%) skewX(-15deg);
      opacity: 0;
    }
    22% {
      opacity: 0.78;
    }
    48% {
      opacity: 0.44;
    }
    100% {
      transform: translateX(160%) skewX(-15deg);
      opacity: 0;
    }
  }

  @keyframes ce-crack-flare {
    0%, 100% {
      opacity: 0.18;
    }
    45% {
      opacity: 0.78;
    }
    55% {
      opacity: 0.34;
    }
  }

  @keyframes ce-border-breathe {
    0%, 100% {
      box-shadow:
        inset 0 0 0 1px rgba(127, 29, 29, 0.24),
        0 0 28px rgba(127, 29, 29, 0.14),
        0 0 52px rgba(251, 191, 36, 0.04);
    }
    50% {
      box-shadow:
        inset 0 0 0 1px rgba(239, 68, 68, 0.32),
        0 0 42px rgba(185, 28, 28, 0.24),
        0 0 80px rgba(251, 191, 36, 0.08);
    }
  }

  @keyframes ce-eclipse-breathe {
    0%, 100% {
      transform: scale(1);
      opacity: 0.82;
    }
    50% {
      transform: scale(1.045);
      opacity: 1;
    }
  }

  @keyframes ce-corona-spin {
    0% {
      transform: rotate(0deg) scale(1);
    }
    100% {
      transform: rotate(360deg) scale(1);
    }
  }

  @keyframes ce-storm-drift {
    0% {
      transform: translateX(-7%) translateY(0);
      opacity: 0.28;
    }
    50% {
      opacity: 0.46;
    }
    100% {
      transform: translateX(7%) translateY(-4px);
      opacity: 0.32;
    }
  }

  @keyframes ce-temple-shift {
    0%, 100% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(-7px, 2px, 0);
    }
  }

  @keyframes ce-lightning-flash {
    0%, 88%, 100% {
      opacity: 0;
    }
    90% {
      opacity: 0.74;
    }
    92% {
      opacity: 0.12;
    }
    94% {
      opacity: 0.46;
    }
  }

  @keyframes ce-aura-spin {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  @keyframes ce-aura-spin-reverse {
    0% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
  }

  @keyframes ce-devour-pulse {
    0%, 100% {
      opacity: 0.18;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 0.44;
      transform: translate(-50%, -50%) scale(1.08);
    }
  }

  @keyframes ce-particle-drift {
    0% {
      transform: translate3d(0, 0, 0) scale(0.78);
      opacity: 0;
    }
    18% {
      opacity: var(--ce-particle-opacity, 0.34);
    }
    72% {
      opacity: var(--ce-particle-opacity, 0.34);
    }
    100% {
      transform: translate3d(-18px, -46px, 0) scale(1.08);
      opacity: 0;
    }
  }

  .ce-name {
    isolation: isolate;
    color: transparent;
    background:
      linear-gradient(115deg, #18181b 0%, #3f3f46 18%, #991b1b 38%, #fca5a5 47%, #451a03 62%, #ef4444 78%, #0a0a0a 100%);
    background-size: 230% 230%;
    -webkit-background-clip: text;
    background-clip: text;
    animation: ce-name-pulse 3.4s ease-in-out infinite;
    text-shadow:
      0 0 1px rgba(254, 202, 202, 0.72),
      0 0 18px rgba(127, 29, 29, 0.34);
  }

  .ce-name-core {
    font-weight: 950;
    letter-spacing: -0.025em;
  }

  .ce-name-shadow {
    width: 46%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 0, 0, 0.86),
      rgba(127, 29, 29, 0.42),
      transparent
    );
    mix-blend-mode: multiply;
    animation: ce-shadow-sweep 4.4s ease-in-out infinite;
  }

  .ce-name-crack {
    background:
      linear-gradient(115deg, transparent 0 32%, rgba(248, 113, 113, 0.38) 33%, transparent 35% 52%, rgba(251, 191, 36, 0.20) 53%, transparent 55%),
      linear-gradient(72deg, transparent 0 44%, rgba(185, 28, 28, 0.34) 45%, transparent 47%);
    mix-blend-mode: screen;
    animation: ce-crack-flare 3.2s ease-in-out infinite;
  }

  .ce-border,
  .ce-full {
    border-radius: 30px;
    border: 1px solid rgba(239, 68, 68, 0.22);
    background:
      radial-gradient(circle at top, rgba(239, 68, 68, 0.10), transparent 30%),
      radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.06), transparent 34%),
      linear-gradient(135deg, rgba(6, 6, 10, 0.98), rgba(24, 24, 27, 0.96), rgba(45, 8, 12, 0.88));
    animation: ce-border-breathe 4.8s ease-in-out infinite;
  }

  .ce-border-corona {
    border-radius: inherit;
    background:
      radial-gradient(circle at center, transparent 44%, rgba(127, 29, 29, 0.18) 52%, transparent 68%),
      radial-gradient(circle at top left, rgba(239, 68, 68, 0.14), transparent 34%),
      radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.10), transparent 34%);
  }

  .ce-border-smoke {
    border-radius: inherit;
    background:
      linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.28), transparent),
      radial-gradient(circle at 30% 20%, rgba(82, 82, 91, 0.16), transparent 34%);
    opacity: 0.55;
  }

  .ce-corner {
    position: absolute;
    z-index: 5;
    width: 40px;
    height: 40px;
    border-color: rgba(248, 113, 113, 0.52);
    filter:
      drop-shadow(0 0 8px rgba(239, 68, 68, 0.24))
      drop-shadow(0 0 14px rgba(251, 191, 36, 0.10));
    pointer-events: none;
  }

  .ce-corner-tl {
    left: 12px;
    top: 12px;
    border-left: 1px solid;
    border-top: 1px solid;
    border-top-left-radius: 18px;
  }

  .ce-corner-tr {
    right: 12px;
    top: 12px;
    border-right: 1px solid;
    border-top: 1px solid;
    border-top-right-radius: 18px;
  }

  .ce-corner-bl {
    left: 12px;
    bottom: 12px;
    border-left: 1px solid;
    border-bottom: 1px solid;
    border-bottom-left-radius: 18px;
  }

  .ce-corner-br {
    right: 12px;
    bottom: 12px;
    border-right: 1px solid;
    border-bottom: 1px solid;
    border-bottom-right-radius: 18px;
  }

  .ce-background,
  .ce-full {
    min-height: 100%;
    background:
      radial-gradient(circle at 70% 8%, rgba(239, 68, 68, 0.26), transparent 22%),
      radial-gradient(circle at 22% 20%, rgba(113, 63, 18, 0.18), transparent 30%),
      linear-gradient(180deg, rgba(3, 3, 6, 0.98), rgba(24, 24, 27, 0.98) 52%, rgba(10, 4, 7, 0.99));
  }

  .ce-eclipse {
    z-index: 1;
    right: 7%;
    top: 7%;
    width: 158px;
    height: 158px;
    border-radius: 9999px;
    background:
      radial-gradient(circle at center, #050505 0 48%, rgba(69, 10, 10, 0.98) 49% 57%, rgba(248, 113, 113, 0.58) 58% 63%, transparent 64%);
    box-shadow:
      0 0 24px rgba(127, 29, 29, 0.40),
      0 0 72px rgba(239, 68, 68, 0.20),
      0 0 120px rgba(251, 191, 36, 0.08);
    animation: ce-eclipse-breathe 5.5s ease-in-out infinite;
  }

  .ce-corona {
    z-index: 1;
    right: calc(7% - 18px);
    top: calc(7% - 18px);
    width: 194px;
    height: 194px;
    border-radius: 9999px;
    background:
      conic-gradient(
        from 0deg,
        transparent,
        rgba(239, 68, 68, 0.46),
        transparent,
        rgba(251, 191, 36, 0.22),
        transparent,
        rgba(185, 28, 28, 0.50),
        transparent
      );
    filter: blur(2px);
    opacity: 0.54;
    animation: ce-corona-spin 14s linear infinite;
  }

  .ce-temple {
    z-index: 1;
    left: 10%;
    bottom: 13%;
    width: 330px;
    height: 128px;
    opacity: 0.28;
    background:
      linear-gradient(to top, rgba(24, 24, 27, 0.95), rgba(82, 82, 91, 0.40), transparent 82%),
      repeating-linear-gradient(
        90deg,
        transparent 0 22px,
        rgba(127, 29, 29, 0.50) 22px 25px,
        transparent 25px 44px
      );
    clip-path: polygon(
      0% 100%,
      5% 56%,
      12% 100%,
      20% 34%,
      29% 100%,
      38% 18%,
      47% 100%,
      57% 38%,
      66% 100%,
      76% 48%,
      86% 100%,
      96% 60%,
      100% 100%
    );
    filter:
      drop-shadow(0 0 18px rgba(127, 29, 29, 0.18))
      drop-shadow(0 0 32px rgba(0, 0, 0, 0.42));
    animation: ce-temple-shift 9s ease-in-out infinite;
  }

  .ce-storm {
    z-index: 1;
    width: 260px;
    height: 82px;
    border-radius: 999px;
    background:
      radial-gradient(circle, rgba(63, 63, 70, 0.28), transparent 70%),
      radial-gradient(circle at 30% 50%, rgba(127, 29, 29, 0.16), transparent 70%);
    filter: blur(13px);
    opacity: 0.38;
    animation: ce-storm-drift 11s ease-in-out infinite alternate;
  }

  .ce-storm-1 {
    left: 8%;
    top: 12%;
  }

  .ce-storm-2 {
    right: 12%;
    top: 34%;
    animation-duration: 15s;
  }

  .ce-lightning {
    z-index: 2;
    width: 2px;
    height: 74px;
    background: linear-gradient(to bottom, transparent, rgba(248, 113, 113, 0.76), transparent);
    clip-path: polygon(45% 0%, 100% 34%, 62% 34%, 88% 100%, 0% 42%, 40% 42%);
    filter:
      drop-shadow(0 0 7px rgba(248, 113, 113, 0.48))
      drop-shadow(0 0 15px rgba(251, 191, 36, 0.16));
    animation: ce-lightning-flash 7s ease-in-out infinite;
  }

  .ce-lightning-1 {
    left: 28%;
    top: 18%;
  }

  .ce-lightning-2 {
    right: 32%;
    top: 24%;
    animation-delay: 2.8s;
  }

  .ce-aura,
  .ce-full {
    isolation: isolate;
  }

  .ce-aura-shadow {
    z-index: 2;
    left: 50%;
    top: 50%;
    width: 82%;
    height: 82%;
    border-radius: 9999px;
    background:
      radial-gradient(circle, rgba(0, 0, 0, 0.40), transparent 54%),
      radial-gradient(circle, rgba(88, 28, 135, 0.18), transparent 72%);
    filter: blur(12px);
    animation: ce-devour-pulse 4.8s ease-in-out infinite;
  }

  .ce-aura-corona {
    z-index: 3;
    left: 50%;
    top: 50%;
    border-radius: 9999px;
    background:
      conic-gradient(
        from 0deg,
        transparent,
        rgba(239, 68, 68, 0.48),
        transparent,
        rgba(251, 191, 36, 0.20),
        transparent,
        rgba(127, 29, 29, 0.46),
        transparent
      );
    mask-image: radial-gradient(circle, transparent 52%, black 55%, black 62%, transparent 66%);
    filter:
      drop-shadow(0 0 12px rgba(239, 68, 68, 0.24))
      drop-shadow(0 0 20px rgba(251, 191, 36, 0.08));
  }

  .ce-aura-corona-1 {
    width: 72%;
    height: 72%;
    animation: ce-aura-spin 9s linear infinite;
  }

  .ce-aura-corona-2 {
    width: 88%;
    height: 88%;
    opacity: 0.60;
    animation: ce-aura-spin-reverse 15s linear infinite;
  }

  .ce-aura-devour {
    z-index: 2;
    left: 50%;
    top: 50%;
    width: 70%;
    height: 70%;
    border-radius: 9999px;
    background: radial-gradient(circle, rgba(127, 29, 29, 0.24), transparent 62%);
    filter: blur(16px);
    animation: ce-devour-pulse 5.6s ease-in-out infinite;
  }

  .ce-particle {
    width: 5px;
    height: 5px;
    border-radius: 999px;
    background:
      radial-gradient(circle, rgba(248, 113, 113, 0.95), rgba(127, 29, 29, 0.55), transparent 72%);
    box-shadow:
      0 0 8px rgba(239, 68, 68, 0.42),
      0 0 16px rgba(251, 191, 36, 0.10);
    animation-name: ce-particle-drift;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }
`;
