"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type LunariaSession = {
  role: "player" | "admin";
  playerId?: string;
  username: string;
  characterName?: string;
  rank?: string;
  pathway?: string;
  loginAt?: string;
};

const PUBLIC_ROUTES = [
  "/signin",
  "/signup",
  "/reset-password",
  "/form-elements",
];

const ADMIN_ONLY_ROUTES = [
  "/basic-tables",
  "/familiar-grant",
  "/familiar-manage",
  "/familiar-encounter-admin",
];

const PLAYER_ALLOWED_ROUTES = [
  "/",
  "/profile",
  "/buttons",
  "/calendar",
  "/line-chart",
  "/economy-archive",
  "/familiar",
  "/familiar-encounter",
  "/familiar-lobby",
  "/player-guide",
  "/fortune-game",
];

function getStoredSession(): LunariaSession | null {
  if (typeof window === "undefined") return null;

  const localSession = localStorage.getItem("lunaria_session");
  const sessionSession = sessionStorage.getItem("lunaria_session");
  const rawSession = localSession || sessionSession;

  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession) as LunariaSession;
  } catch {
    localStorage.removeItem("lunaria_session");
    sessionStorage.removeItem("lunaria_session");
    return null;
  }
}

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

function isAdminOnlyRoute(pathname: string) {
  return ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route));
}

function isPlayerAllowedRoute(pathname: string) {
  return PLAYER_ALLOWED_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  });
}

export default function LunariaPageGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">(
    "checking"
  );
  const [message, setMessage] = useState("Checking Lunaria access...");

  useEffect(() => {
    const session = getStoredSession();

    if (isPublicRoute(pathname)) {
      setStatus("allowed");
      return;
    }

    if (!session) {
      setStatus("blocked");
      setMessage("Access denied. Redirecting to Access Gate...");

      setTimeout(() => {
        window.location.href = "/signin";
      }, 700);

      return;
    }

    if (session.role === "admin") {
      setStatus("allowed");
      return;
    }

    if (session.role === "player") {
      if (isAdminOnlyRoute(pathname)) {
        setStatus("blocked");
        setMessage("Admin-only page. Redirecting to Adventurer ID Card...");

        setTimeout(() => {
          window.location.href = "/profile";
        }, 800);

        return;
      }

      if (isPlayerAllowedRoute(pathname)) {
        setStatus("allowed");
        return;
      }

      setStatus("blocked");
      setMessage("This page is not available for player access.");

      setTimeout(() => {
        window.location.href = "/profile";
      }, 800);

      return;
    }

    setStatus("blocked");
    setMessage("Invalid session. Redirecting to Access Gate...");

    localStorage.removeItem("lunaria_session");
    sessionStorage.removeItem("lunaria_session");

    setTimeout(() => {
      window.location.href = "/signin";
    }, 800);
  }, [pathname]);

  if (status === "checking" || status === "blocked") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050611] px-4 text-slate-100">
        <div className="w-full max-w-md rounded-[32px] border border-amber-400/20 bg-black/45 p-6 text-center shadow-[0_0_60px_rgba(245,158,11,0.12)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
            Lunaria Access Guard
          </p>

          <h1 className="mt-4 text-2xl font-black text-white">
            {status === "checking" ? "Verifying Session" : "Access Restricted"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">{message}</p>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-amber-400/60" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
