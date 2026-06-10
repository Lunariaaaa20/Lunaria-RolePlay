"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import type { CosmeticTheme } from "../data/cosmeticItems";

type PremiumCosmeticCanvasProps = {
  theme: CosmeticTheme;
  variant?: "card" | "compact" | "preview";
};

type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  alpha: number;
  pulse: number;
};

function getThemePalette(themeInput: CosmeticTheme) {
  const theme = String(themeInput);

  if (theme === "obsidian-monarch") {
    return {
      primary: "rgba(251, 191, 36, 0.88)",
      secondary: "rgba(168, 162, 158, 0.42)",
      glow: "rgba(245, 158, 11, 0.18)",
      symbol: "♛",
    };
  }

  if (theme === "blood-cathedral") {
    return {
      primary: "rgba(248, 113, 113, 0.9)",
      secondary: "rgba(251, 191, 36, 0.28)",
      glow: "rgba(220, 38, 38, 0.20)",
      symbol: "◆",
    };
  }

  if (theme === "abyss-sovereign") {
    return {
      primary: "rgba(103, 232, 249, 0.9)",
      secondary: "rgba(45, 212, 191, 0.32)",
      glow: "rgba(34, 211, 238, 0.18)",
      symbol: "◇",
    };
  }

  if (theme === "thorn-empress") {
    return {
      primary: "rgba(110, 231, 183, 0.9)",
      secondary: "rgba(250, 204, 21, 0.25)",
      glow: "rgba(52, 211, 153, 0.18)",
      symbol: "✧",
    };
  }

  if (theme === "soulfire-tyrant") {
    return {
      primary: "rgba(207, 250, 254, 0.92)",
      secondary: "rgba(34, 211, 238, 0.36)",
      glow: "rgba(125, 211, 252, 0.18)",
      symbol: "☽",
    };
  }

  return {
    primary: "rgba(255, 255, 255, 0.78)",
    secondary: "rgba(148, 163, 184, 0.30)",
    glow: "rgba(255, 255, 255, 0.12)",
    symbol: "✦",
  };
}

function createParticles(count: number, width: number, height: number): Particle[] {
  return Array.from({ length: count }).map((_, index) => ({
    x: (width * ((index * 37) % 100)) / 100,
    y: (height * ((index * 53) % 100)) / 100,
    size: 1.2 + (index % 5) * 0.55,
    speed: 0.18 + (index % 7) * 0.045,
    drift: index % 2 === 0 ? 0.12 : -0.12,
    alpha: 0.22 + (index % 6) * 0.055,
    pulse: (index % 9) * 0.35,
  }));
}

export default function PremiumCosmeticCanvas({
  theme,
  variant = "card",
}: PremiumCosmeticCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const palette = useMemo(() => getThemePalette(theme), [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let frameId = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const particleCount =
      variant === "preview" ? 34 : variant === "compact" ? 18 : 26;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = createParticles(particleCount, width, height);
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(parent);

    let tick = 0;

    const draw = () => {
      tick += 0.012;

      context.clearRect(0, 0, width, height);

      const glow = context.createRadialGradient(
        width * 0.5,
        height * 0.46,
        0,
        width * 0.5,
        height * 0.46,
        Math.max(width, height) * 0.72
      );

      glow.addColorStop(0, palette.glow);
      glow.addColorStop(0.55, "rgba(255,255,255,0.025)");
      glow.addColorStop(1, "rgba(0,0,0,0)");

      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      particles.forEach((particle, index) => {
        particle.y -= particle.speed;
        particle.x += Math.sin(tick + particle.pulse) * particle.drift;

        if (particle.y < -12) {
          particle.y = height + 12;
          particle.x = (width * ((index * 29 + Math.floor(tick * 100)) % 100)) / 100;
        }

        const flicker = 0.65 + Math.sin(tick * 3 + particle.pulse) * 0.35;
        const radius = particle.size * (0.8 + flicker * 0.35);

        context.beginPath();
        context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        context.fillStyle =
          index % 3 === 0
            ? palette.secondary
            : palette.primary.replace(
                /0\.\d+\)/,
                `${Math.min(0.95, particle.alpha * flicker).toFixed(2)})`
              );
        context.fill();
      });

      context.save();
      context.globalAlpha = 0.16;
      context.strokeStyle = palette.primary;
      context.lineWidth = 1;

      const ringRadius =
        Math.min(width, height) * (variant === "compact" ? 0.34 : 0.42) +
        Math.sin(tick * 2) * 4;

      context.beginPath();
      context.arc(width * 0.5, height * 0.5, ringRadius, 0, Math.PI * 2);
      context.stroke();

      context.globalAlpha = 0.09;
      context.beginPath();
      context.arc(width * 0.5, height * 0.5, ringRadius * 0.72, 0, Math.PI * 2);
      context.stroke();

      context.restore();

      frameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [palette, variant]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <motion.div
        className="absolute inset-x-[-30%] top-1/2 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
        animate={{
          x: ["-35%", "35%", "-35%"],
          opacity: [0.08, 0.42, 0.08],
        }}
        transition={{
          duration: variant === "compact" ? 5.5 : 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute right-4 top-4 text-6xl font-black opacity-[0.09]"
        animate={{
          rotate: [0, 6, -4, 0],
          scale: [1, 1.05, 0.98, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {palette.symbol}
      </motion.div>

      <motion.div
        className="absolute inset-8 rounded-full border border-white/10"
        animate={{
          scale: [0.96, 1.04, 0.96],
          opacity: [0.12, 0.28, 0.12],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
