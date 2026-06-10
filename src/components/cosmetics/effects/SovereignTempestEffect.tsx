 "use client";

import React from "react";

type SovereignLunarEclipseEffectProps = {
  variant?: "name" | "border" | "background" | "aura" | "particle" | "full";
  children?: React.ReactNode;
  className?: string;
};

export default function SovereignLunarEclipseEffect({
  variant = "full",
  children,
  className = "",
}: SovereignLunarEclipseEffectProps) {
  if (variant === "name") {
    return <LunarNameEffect className={className}>{children}</LunarNameEffect>;
  }

  if (variant === "border") {
    return <LunarBorderEffect className={className}>{children}</LunarBorderEffect>;
  }

  if (variant === "background") {
    return (
      <LunarBackgroundEffect className={className}>
        {children}
      </LunarBackgroundEffect>
    );
  }

  if (variant === "aura") {
    return <LunarAuraEffect className={className}>{children}</LunarAuraEffect>;
  }

  if (variant === "particle") {
    return (
      <LunarParticleEffect className={className}>
        {children}
      </LunarParticleEffect>
    );
  }

  return <LunarFullEffect className={className}>{children}</LunarFullEffect>;
}

export function LunarNameEffect({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`sle-name relative inline-block ${className}`}>
      <span className="sle-name-core relative z-10">{children}</span>
      <span className="sle-name-shine pointer-events-none absolute inset-0 z-20" />
    </span>
  );
}

export function LunarBorderEffect({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`sle-border relative overflow-hidden ${className}`}>
      <span className="sle-border-glow pointer-events-none absolute inset-0" />
      <span className="sle-corner sle-corner-tl" />
      <span className="sle-corner sle-corner-tr" />
      <span className="sle-corner sle-corner-bl" />
      <span className="sle-corner sle-corner-br" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function LunarBackgroundEffect({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`sle-background relative overflow-hidden ${className}`}>
      <div className="sle-fullmoon pointer-events-none absolute" />
      <div className="sle-palace pointer-events-none absolute" />
      <div className="sle-water pointer-events-none absolute" />
      <div className="sle-cloud sle-cloud-1 pointer-events-none absolute" />
      <div className="sle-cloud sle-cloud-2 pointer-events-none absolute" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function LunarAuraEffect({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`sle-aura relative ${className}`}>
      <span className="sle-aura-ring sle-aura-ring-1 pointer-events-none absolute" />
      <span className="sle-aura-ring sle-aura-ring-2 pointer-events-none absolute" />
      <span className="sle-aura-halo pointer-events-none absolute" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function LunarParticleEffect({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`sle-particle-wrap relative overflow-hidden ${className}`}>
      <LunarParticles />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function LunarFullEffect({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`sle-full relative overflow-hidden ${className}`}>
      <div className="sle-fullmoon pointer-events-none absolute" />
      <div className="sle-palace pointer-events-none absolute" />
      <div className="sle-water pointer-events-none absolute" />
      <div className="sle-cloud sle-cloud-1 pointer-events-none absolute" />
      <div className="sle-cloud sle-cloud-2 pointer-events-none absolute" />

      <span className="sle-aura-ring sle-aura-ring-1 pointer-events-none absolute" />
      <span className="sle-aura-ring sle-aura-ring-2 pointer-events-none absolute" />
      <span className="sle-aura-halo pointer-events-none absolute" />

      <LunarParticles />

      <span className="sle-border-glow pointer-events-none absolute inset-0" />
      <span className="sle-corner sle-corner-tl" />
      <span className="sle-corner sle-corner-tr" />
      <span className="sle-corner sle-corner-bl" />
      <span className="sle-corner sle-corner-br" />

      <div className="relative z-10">{children}</div>

      <style jsx>{styles}</style>
    </div>
  );
}

function LunarParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
      {Array.from({ length: 18 }).map((_, index) => (
        <span
          key={`sle-particle-${index}`}
          className="sle-particle absolute"
          style={{
            left: `${5 + ((index * 17) % 90)}%`,
            animationDelay: `${(index % 9) * 0.55}s`,
            animationDuration: `${5.5 + (index % 5) * 0.65}s`,
            opacity: 0.26 + (index % 5) * 0.08,
          }}
        />
      ))}
    </div>
  );
}

const styles = `
  @keyframes sle-name-glow {
    0%, 100% {
      filter: drop-shadow(0 0 7px rgba(226, 232, 240, 0.34))
        drop-shadow(0 0 14px rgba(251, 191, 36, 0.18));
    }
    50% {
      filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.55))
        drop-shadow(0 0 22px rgba(125, 211, 252, 0.28))
        drop-shadow(0 0 28px rgba(251, 191, 36, 0.18));
    }
  }

  @keyframes sle-shine-pass {
    0% {
      transform: translateX(-130%) skewX(-18deg);
      opacity: 0;
    }
    18% {
      opacity: 0.75;
    }
    45% {
      opacity: 0.28;
    }
    100% {
      transform: translateX(140%) skewX(-18deg);
      opacity: 0;
    }
  }

  @keyframes sle-border-pulse {
    0%, 100% {
      box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.10),
        0 0 24px rgba(251, 191, 36, 0.10),
        0 0 48px rgba(125, 211, 252, 0.06);
    }
    50% {
      box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.18),
        0 0 36px rgba(251, 191, 36, 0.18),
        0 0 70px rgba(125, 211, 252, 0.10);
    }
  }

  @keyframes sle-moon-breathe {
    0%, 100% {
      opacity: 0.70;
      transform: scale(1);
    }
    50% {
      opacity: 0.95;
      transform: scale(1.035);
    }
  }

  @keyframes sle-palace-drift {
    0%, 100% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(8px, -3px, 0);
    }
  }

  @keyframes sle-cloud-drift {
    0% {
      transform: translateX(-8%);
    }
    100% {
      transform: translateX(8%);
    }
  }

  @keyframes sle-water-shimmer {
    0% {
      background-position: 0% 50%;
      opacity: 0.24;
    }
    50% {
      background-position: 100% 50%;
      opacity: 0.42;
    }
    100% {
      background-position: 0% 50%;
      opacity: 0.24;
    }
  }

  @keyframes sle-ring-rotate {
    0% {
      transform: translate(-50%, -50%) rotateX(64deg) rotateZ(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotateX(64deg) rotateZ(360deg);
    }
  }

  @keyframes sle-ring-rotate-reverse {
    0% {
      transform: translate(-50%, -50%) rotateX(66deg) rotateZ(360deg);
    }
    100% {
      transform: translate(-50%, -50%) rotateX(66deg) rotateZ(0deg);
    }
  }

  @keyframes sle-halo-pulse {
    0%, 100% {
      opacity: 0.22;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 0.46;
      transform: translate(-50%, -50%) scale(1.08);
    }
  }

  @keyframes sle-particle-fall {
    0% {
      top: -12%;
      transform: translateX(0) scale(0.7);
      opacity: 0;
    }
    15% {
      opacity: var(--sle-particle-opacity, 0.45);
    }
    65% {
      opacity: var(--sle-particle-opacity, 0.45);
    }
    100% {
      top: 112%;
      transform: translateX(18px) scale(1.05);
      opacity: 0;
    }
  }

  .sle-name {
    isolation: isolate;
    color: transparent;
    background:
      linear-gradient(115deg, #ffffff 0%, #dbeafe 18%, #fef3c7 38%, #ffffff 58%, #7dd3fc 78%, #fef9c3 100%);
    background-size: 220% 220%;
    -webkit-background-clip: text;
    background-clip: text;
    animation: sle-name-glow 3.8s ease-in-out infinite;
    text-shadow:
      0 0 1px rgba(255, 255, 255, 0.72),
      0 0 16px rgba(147, 197, 253, 0.22);
  }

  .sle-name-core {
    font-weight: 950;
    letter-spacing: -0.02em;
  }

  .sle-name-shine {
    width: 42%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.78),
      rgba(251, 191, 36, 0.28),
      transparent
    );
    mix-blend-mode: screen;
    animation: sle-shine-pass 4.8s ease-in-out infinite;
  }

  .sle-border,
  .sle-full {
    border-radius: 30px;
    border: 1px solid rgba(253, 224, 171, 0.24);
    background:
      radial-gradient(circle at top, rgba(255, 255, 255, 0.10), transparent 30%),
      radial-gradient(circle at bottom right, rgba(125, 211, 252, 0.10), transparent 32%),
      linear-gradient(135deg, rgba(8, 12, 28, 0.96), rgba(15, 23, 42, 0.94), rgba(30, 41, 59, 0.86));
    animation: sle-border-pulse 5.2s ease-in-out infinite;
  }

  .sle-border-glow {
    border-radius: inherit;
    background:
      linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent),
      radial-gradient(circle at top left, rgba(251, 191, 36, 0.16), transparent 34%),
      radial-gradient(circle at bottom right, rgba(125, 211, 252, 0.13), transparent 32%);
    pointer-events: none;
  }

  .sle-corner {
    position: absolute;
    z-index: 5;
    width: 38px;
    height: 38px;
    border-color: rgba(253, 230, 138, 0.54);
    filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.20));
    pointer-events: none;
  }

  .sle-corner-tl {
    left: 12px;
    top: 12px;
    border-left: 1px solid;
    border-top: 1px solid;
    border-top-left-radius: 18px;
  }

  .sle-corner-tr {
    right: 12px;
    top: 12px;
    border-right: 1px solid;
    border-top: 1px solid;
    border-top-right-radius: 18px;
  }

  .sle-corner-bl {
    left: 12px;
    bottom: 12px;
    border-left: 1px solid;
    border-bottom: 1px solid;
    border-bottom-left-radius: 18px;
  }

  .sle-corner-br {
    right: 12px;
    bottom: 12px;
    border-right: 1px solid;
    border-bottom: 1px solid;
    border-bottom-right-radius: 18px;
  }

  .sle-background,
  .sle-full {
    min-height: 100%;
    background:
      radial-gradient(circle at 68% 8%, rgba(255, 255, 255, 0.24), transparent 20%),
      radial-gradient(circle at 22% 24%, rgba(125, 211, 252, 0.13), transparent 30%),
      linear-gradient(180deg, rgba(4, 7, 20, 0.96), rgba(15, 23, 42, 0.96) 52%, rgba(3, 7, 18, 0.98));
  }

  .sle-fullmoon {
    z-index: 1;
    right: 8%;
    top: 8%;
    width: 150px;
    height: 150px;
    border-radius: 9999px;
    background:
      radial-gradient(circle at 36% 32%, #ffffff, #f8fafc 36%, #dbeafe 62%, rgba(125, 211, 252, 0.50) 78%, transparent 79%);
    box-shadow:
      0 0 32px rgba(255, 255, 255, 0.25),
      0 0 78px rgba(147, 197, 253, 0.22),
      0 0 116px rgba(251, 191, 36, 0.10);
    animation: sle-moon-breathe 6s ease-in-out infinite;
  }

  .sle-palace {
    z-index: 1;
    right: 14%;
    bottom: 23%;
    width: 250px;
    height: 96px;
    opacity: 0.28;
    background:
      linear-gradient(to top, rgba(255, 255, 255, 0.55), transparent 78%),
      repeating-linear-gradient(
        90deg,
        transparent 0 12px,
        rgba(255, 255, 255, 0.34) 12px 14px,
        transparent 14px 25px
      );
    clip-path: polygon(
      0% 100%,
      8% 55%,
      16% 100%,
      24% 38%,
      32% 100%,
      42% 18%,
      52% 100%,
      62% 32%,
      70% 100%,
      80% 48%,
      88% 100%,
      100% 66%,
      100% 100%
    );
    filter: blur(0.2px) drop-shadow(0 0 18px rgba(191, 219, 254, 0.20));
    animation: sle-palace-drift 10s ease-in-out infinite;
  }

  .sle-water {
    z-index: 1;
    inset: auto 0 0 0;
    height: 38%;
    background:
      linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.16), transparent),
      repeating-linear-gradient(
        0deg,
        rgba(125, 211, 252, 0.08) 0 1px,
        transparent 1px 12px
      );
    background-size: 220% 100%, 100% 100%;
    animation: sle-water-shimmer 7s ease-in-out infinite;
    mask-image: linear-gradient(to top, black, transparent);
  }

  .sle-cloud {
    z-index: 1;
    width: 220px;
    height: 66px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.14), transparent 70%);
    filter: blur(10px);
    opacity: 0.46;
    animation: sle-cloud-drift 11s ease-in-out infinite alternate;
  }

  .sle-cloud-1 {
    left: 10%;
    top: 14%;
  }

  .sle-cloud-2 {
    right: 16%;
    top: 34%;
    animation-duration: 14s;
  }

  .sle-aura,
  .sle-full {
    isolation: isolate;
  }

  .sle-aura-ring {
    z-index: 3;
    left: 50%;
    top: 50%;
    border-radius: 9999px;
    border: 1px solid rgba(253, 230, 138, 0.34);
    box-shadow:
      0 0 14px rgba(253, 230, 138, 0.20),
      inset 0 0 16px rgba(125, 211, 252, 0.14);
  }

  .sle-aura-ring-1 {
    width: 58%;
    height: 58%;
    animation: sle-ring-rotate 13s linear infinite;
  }

  .sle-aura-ring-2 {
    width: 72%;
    height: 72%;
    border-color: rgba(191, 219, 254, 0.24);
    animation: sle-ring-rotate-reverse 18s linear infinite;
  }

  .sle-aura-halo {
    z-index: 2;
    left: 50%;
    top: 50%;
    width: 82%;
    height: 82%;
    border-radius: 9999px;
    background:
      radial-gradient(circle, rgba(255, 255, 255, 0.14), transparent 52%),
      radial-gradient(circle, rgba(251, 191, 36, 0.10), transparent 70%);
    filter: blur(12px);
    animation: sle-halo-pulse 5s ease-in-out infinite;
  }

  .sle-particle {
    width: 4px;
    height: 11px;
    border-radius: 999px;
    background:
      linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(253, 230, 138, 0.95), rgba(125, 211, 252, 0.0));
    box-shadow:
      0 0 8px rgba(253, 230, 138, 0.45),
      0 0 14px rgba(125, 211, 252, 0.20);
    animation-name: sle-particle-fall;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
`;
