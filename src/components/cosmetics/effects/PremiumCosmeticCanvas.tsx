"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import type { CosmeticTheme } from "../data/cosmeticItems";

type PremiumCosmeticCanvasProps = {
  theme: CosmeticTheme;
  variant?: "card" | "compact" | "preview";
};

type ThemeMode =
  | "obsidian"
  | "blood"
  | "abyss"
  | "thorn"
  | "soulfire"
  | "default";

type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  alpha: number;
  pulse: number;
  rotate: number;
};

type ThemeVisual = {
  mode: ThemeMode;
  primary: string;
  secondary: string;
  soft: string;
  glow: string;
  line: string;
  symbol: string;
  symbolTwo: string;
  overlayClass: string;
};

function getThemeVisual(themeInput: CosmeticTheme): ThemeVisual {
  const theme = String(themeInput);

  if (theme === "obsidian-monarch") {
    return {
      mode: "obsidian",
      primary: "rgba(251, 191, 36, 0.92)",
      secondary: "rgba(180, 83, 9, 0.48)",
      soft: "rgba(168, 162, 158, 0.30)",
      glow: "rgba(245, 158, 11, 0.20)",
      line: "rgba(251, 191, 36, 0.32)",
      symbol: "♛",
      symbolTwo: "◆",
      overlayClass:
        "bg-[radial-gradient(circle_at_18%_12%,rgba(245,158,11,0.14),transparent_28%),linear-gradient(135deg,rgba(0,0,0,0.18),transparent,rgba(245,158,11,0.04))]",
    };
  }

  if (theme === "blood-cathedral") {
    return {
      mode: "blood",
      primary: "rgba(248, 113, 113, 0.94)",
      secondary: "rgba(127, 29, 29, 0.58)",
      soft: "rgba(251, 191, 36, 0.22)",
      glow: "rgba(220, 38, 38, 0.22)",
      line: "rgba(248, 113, 113, 0.28)",
      symbol: "◆",
      symbolTwo: "✦",
      overlayClass:
        "bg-[radial-gradient(circle_at_16%_14%,rgba(220,38,38,0.16),transparent_30%),linear-gradient(120deg,rgba(127,29,29,0.12),transparent,rgba(251,191,36,0.04))]",
    };
  }

  if (theme === "abyss-sovereign") {
    return {
      mode: "abyss",
      primary: "rgba(103, 232, 249, 0.94)",
      secondary: "rgba(45, 212, 191, 0.42)",
      soft: "rgba(14, 165, 233, 0.24)",
      glow: "rgba(34, 211, 238, 0.20)",
      line: "rgba(103, 232, 249, 0.26)",
      symbol: "◇",
      symbolTwo: "○",
      overlayClass:
        "bg-[radial-gradient(circle_at_18%_16%,rgba(34,211,238,0.14),transparent_30%),linear-gradient(180deg,rgba(14,165,233,0.06),transparent,rgba(45,212,191,0.05))]",
    };
  }

  if (theme === "thorn-empress") {
    return {
      mode: "thorn",
      primary: "rgba(110, 231, 183, 0.94)",
      secondary: "rgba(250, 204, 21, 0.30)",
      soft: "rgba(21, 128, 61, 0.34)",
      glow: "rgba(52, 211, 153, 0.20)",
      line: "rgba(110, 231, 183, 0.28)",
      symbol: "✧",
      symbolTwo: "❦",
      overlayClass:
        "bg-[radial-gradient(circle_at_18%_12%,rgba(52,211,153,0.14),transparent_30%),linear-gradient(140deg,rgba(20,83,45,0.16),transparent,rgba(250,204,21,0.04))]",
    };
  }

  if (theme === "soulfire-tyrant") {
    return {
      mode: "soulfire",
      primary: "rgba(207, 250, 254, 0.96)",
      secondary: "rgba(34, 211, 238, 0.44)",
      soft: "rgba(148, 163, 184, 0.26)",
      glow: "rgba(125, 211, 252, 0.22)",
      line: "rgba(207, 250, 254, 0.30)",
      symbol: "☽",
      symbolTwo: "✷",
      overlayClass:
        "bg-[radial-gradient(circle_at_18%_14%,rgba(207,250,254,0.11),transparent_30%),linear-gradient(145deg,rgba(34,211,238,0.07),transparent,rgba(255,255,255,0.04))]",
    };
  }

  return {
    mode: "default",
    primary: "rgba(255, 255, 255, 0.80)",
    secondary: "rgba(148, 163, 184, 0.34)",
    soft: "rgba(255, 255, 255, 0.12)",
    glow: "rgba(255, 255, 255, 0.12)",
    line: "rgba(255, 255, 255, 0.20)",
    symbol: "✦",
    symbolTwo: "◇",
    overlayClass:
      "bg-[radial-gradient(circle_at_20%_16%,rgba(255,255,255,0.08),transparent_30%)]",
  };
}

function createParticles(count: number, width: number, height: number): Particle[] {
  return Array.from({ length: count }).map((_, index) => ({
    x: (width * ((index * 37) % 100)) / 100,
    y: (height * ((index * 53) % 100)) / 100,
    size: 1.1 + (index % 6) * 0.55,
    speed: 0.18 + (index % 7) * 0.045,
    drift: index % 2 === 0 ? 0.16 : -0.16,
    alpha: 0.2 + (index % 6) * 0.055,
    pulse: (index % 9) * 0.42,
    rotate: (index * 41) % 360,
  }));
}

function drawObsidian(
  ctx: CanvasRenderingContext2D,
  visual: ThemeVisual,
  width: number,
  height: number,
  tick: number
) {
  ctx.save();

  ctx.globalAlpha = 0.24;
  ctx.strokeStyle = visual.line;
  ctx.lineWidth = 1;

  for (let i = 0; i < 7; i += 1) {
    const startX = width * (0.12 + i * 0.12);
    const startY = height * (0.12 + ((i * 19) % 60) / 100);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + width * 0.08, startY + height * 0.10);
    ctx.lineTo(startX + width * 0.04, startY + height * 0.22);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.12 + Math.sin(tick * 2) * 0.04;
  ctx.fillStyle = visual.primary;
  ctx.font = `${Math.max(44, width * 0.16)}px Georgia`;
  ctx.fillText("♛", width * 0.74, height * 0.32);

  ctx.restore();
}

function drawBlood(
  ctx: CanvasRenderingContext2D,
  visual: ThemeVisual,
  width: number,
  height: number,
  tick: number
) {
  ctx.save();

  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = visual.line;
  ctx.lineWidth = 1;

  for (let i = 0; i < 5; i += 1) {
    const x = width * (0.16 + i * 0.16);
    const y = height * (0.18 + Math.sin(tick + i) * 0.05);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - 18, y + 28, x + 18, y + 42, x, y + 72);
    ctx.stroke();
  }

  for (let i = 0; i < 6; i += 1) {
    const x = width * (0.12 + ((i * 17) % 78) / 100);
    const y = height * (0.18 + ((i * 23) % 64) / 100);

    ctx.save();
    ctx.translate(x, y + Math.sin(tick * 2 + i) * 5);
    ctx.rotate(Math.PI / 4);
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = i % 2 === 0 ? visual.primary : visual.secondary;
    ctx.fillRect(-4, -4, 8, 8);
    ctx.restore();
  }

  ctx.globalAlpha = 0.11;
  ctx.fillStyle = visual.primary;
  ctx.font = `${Math.max(40, width * 0.13)}px Georgia`;
  ctx.fillText("◆", width * 0.76, height * 0.36);

  ctx.restore();
}

function drawAbyss(
  ctx: CanvasRenderingContext2D,
  visual: ThemeVisual,
  width: number,
  height: number,
  tick: number
) {
  ctx.save();

  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = visual.line;
  ctx.lineWidth = 1;

  for (let wave = 0; wave < 4; wave += 1) {
    ctx.beginPath();
    for (let x = 0; x <= width; x += 12) {
      const y =
        height * (0.28 + wave * 0.13) +
        Math.sin(x * 0.018 + tick * 3 + wave) * 8;

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  for (let i = 0; i < 9; i += 1) {
    const x = width * (0.1 + ((i * 13) % 82) / 100);
    const y = height * (0.18 + ((i * 21) % 70) / 100);
    const r = 3 + (i % 4) * 2 + Math.sin(tick * 2 + i) * 1.2;

    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.12;
  ctx.fillStyle = visual.primary;
  ctx.font = `${Math.max(42, width * 0.14)}px serif`;
  ctx.fillText("◇", width * 0.76, height * 0.38);

  ctx.restore();
}

function drawThorn(
  ctx: CanvasRenderingContext2D,
  visual: ThemeVisual,
  width: number,
  height: number,
  tick: number
) {
  ctx.save();

  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = visual.line;
  ctx.lineWidth = 1.2;

  for (let vine = 0; vine < 4; vine += 1) {
    const baseX = width * (0.08 + vine * 0.22);

    ctx.beginPath();
    ctx.moveTo(baseX, height);
    ctx.bezierCurveTo(
      baseX + Math.sin(tick + vine) * 18,
      height * 0.72,
      baseX - 28,
      height * 0.44,
      baseX + 18,
      height * 0.18
    );
    ctx.stroke();

    for (let leaf = 0; leaf < 3; leaf += 1) {
      const y = height * (0.75 - leaf * 0.18);
      const x = baseX + Math.sin(tick + leaf + vine) * 12;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.6 + leaf * 0.4);
      ctx.globalAlpha = 0.20;
      ctx.fillStyle = leaf % 2 === 0 ? visual.primary : visual.secondary;
      ctx.beginPath();
      ctx.ellipse(0, 0, 4, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.globalAlpha = 0.11;
  ctx.fillStyle = visual.primary;
  ctx.font = `${Math.max(42, width * 0.14)}px Georgia`;
  ctx.fillText("✧", width * 0.76, height * 0.36);

  ctx.restore();
}

function drawSoulfire(
  ctx: CanvasRenderingContext2D,
  visual: ThemeVisual,
  width: number,
  height: number,
  tick: number
) {
  ctx.save();

  for (let i = 0; i < 5; i += 1) {
    const x = width * (0.14 + i * 0.17);
    const y = height * (0.78 - ((i * 9) % 32) / 100);

    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = i % 2 === 0 ? visual.primary : visual.secondary;
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x - 18,
      y - 22,
      x + 18,
      y - 42,
      x + Math.sin(tick * 3 + i) * 16,
      y - 78
    );
    ctx.stroke();
  }

  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = visual.line;
  ctx.lineWidth = 1;

  const cx = width * 0.5;
  const cy = height * 0.5;
  const radius = Math.min(width, height) * 0.26 + Math.sin(tick * 2) * 4;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 6; i += 1) {
    const angle = tick + i * ((Math.PI * 2) / 6);
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    ctx.globalAlpha = 0.20;
    ctx.fillStyle = visual.primary;
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 0.13;
  ctx.fillStyle = visual.primary;
  ctx.font = `${Math.max(42, width * 0.14)}px Georgia`;
  ctx.fillText("☽", width * 0.77, height * 0.36);

  ctx.restore();
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  visual: ThemeVisual,
  particle: Particle,
  index: number,
  tick: number
) {
  const flicker = 0.65 + Math.sin(tick * 3 + particle.pulse) * 0.35;
  const alpha = Math.min(0.95, particle.alpha * flicker);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = index % 3 === 0 ? visual.secondary : visual.primary;
  ctx.strokeStyle = visual.primary;
  ctx.lineWidth = 1;

  if (visual.mode === "blood") {
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotate + tick * 40) * (Math.PI / 180));
    ctx.beginPath();
    ctx.moveTo(0, -particle.size * 2.2);
    ctx.lineTo(particle.size * 1.4, 0);
    ctx.lineTo(0, particle.size * 2.2);
    ctx.lineTo(-particle.size * 1.4, 0);
    ctx.closePath();
    ctx.fill();
  } else if (visual.mode === "abyss") {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 1.8, 0, Math.PI * 2);
    ctx.stroke();
  } else if (visual.mode === "thorn") {
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotate + Math.sin(tick + index)) * (Math.PI / 180));
    ctx.beginPath();
    ctx.ellipse(0, 0, particle.size * 1.2, particle.size * 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (visual.mode === "soulfire") {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 0.35;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 4.2, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export default function PremiumCosmeticCanvas({
  theme,
  variant = "card",
}: PremiumCosmeticCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const visual = useMemo(() => getThemeVisual(theme), [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frameId = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let tick = 0;

    const particleCount =
      variant === "preview" ? 38 : variant === "compact" ? 18 : 28;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = createParticles(particleCount, width, height);
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(parent);

    const draw = () => {
      tick += 0.012;

      ctx.clearRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.46,
        0,
        width * 0.5,
        height * 0.46,
        Math.max(width, height) * 0.72
      );

      glow.addColorStop(0, visual.glow);
      glow.addColorStop(0.55, "rgba(255,255,255,0.025)");
      glow.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      if (visual.mode === "obsidian") {
        drawObsidian(ctx, visual, width, height, tick);
      } else if (visual.mode === "blood") {
        drawBlood(ctx, visual, width, height, tick);
      } else if (visual.mode === "abyss") {
        drawAbyss(ctx, visual, width, height, tick);
      } else if (visual.mode === "thorn") {
        drawThorn(ctx, visual, width, height, tick);
      } else if (visual.mode === "soulfire") {
        drawSoulfire(ctx, visual, width, height, tick);
      }

      particles.forEach((particle, index) => {
        particle.y -= particle.speed;
        particle.x += Math.sin(tick + particle.pulse) * particle.drift;

        if (visual.mode === "abyss") {
          particle.x += Math.sin(tick * 2 + index) * 0.08;
        }

        if (visual.mode === "soulfire") {
          particle.y -= particle.speed * 0.45;
        }

        if (particle.y < -18) {
          particle.y = height + 18;
          particle.x =
            (width * ((index * 29 + Math.floor(tick * 100)) % 100)) / 100;
        }

        drawParticle(ctx, visual, particle, index, tick);
      });

      frameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [visual, variant]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className={`absolute inset-0 ${visual.overlayClass}`} />

      <motion.div
        className="absolute inset-x-[-35%] top-1/2 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
        animate={{
          x: ["-40%", "40%", "-40%"],
          opacity: [0.06, 0.42, 0.06],
        }}
        transition={{
          duration: visual.mode === "blood" ? 5.2 : visual.mode === "abyss" ? 8 : 6.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute right-4 top-4 text-6xl font-black opacity-[0.10]"
        animate={{
          rotate:
            visual.mode === "abyss"
              ? [0, 18, 0]
              : visual.mode === "thorn"
              ? [0, -7, 7, 0]
              : [0, 6, -4, 0],
          scale:
            visual.mode === "soulfire"
              ? [1, 1.12, 0.95, 1]
              : [1, 1.05, 0.98, 1],
        }}
        transition={{
          duration: visual.mode === "obsidian" ? 9 : 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {visual.symbol}
      </motion.div>

      <motion.div
        className="absolute left-5 bottom-5 text-4xl font-black opacity-[0.08]"
        animate={{
          y: [0, -8, 0],
          opacity: [0.05, 0.14, 0.05],
        }}
        transition={{
          duration: 5.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {visual.symbolTwo}
      </motion.div>

      <motion.div
        className="absolute inset-8 rounded-full border border-white/10"
        animate={{
          scale: [0.96, 1.04, 0.96],
          opacity: [0.08, 0.26, 0.08],
        }}
        transition={{
          duration: visual.mode === "abyss" ? 8 : 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
