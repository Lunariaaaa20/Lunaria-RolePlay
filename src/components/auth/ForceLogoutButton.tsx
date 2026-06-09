"use client";

import React from "react";

export default function ForceLogoutButton() {
  const handleForceLogout = () => {
    try {
      localStorage.removeItem("lunaria_session");
      sessionStorage.removeItem("lunaria_session");

      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore storage issue
    }

    window.location.href = "/signin";
  };

  return (
    <button
      type="button"
      onClick={handleForceLogout}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-red-400/25 bg-red-500/10 text-red-300 shadow-[0_0_24px_rgba(248,113,113,0.10)] transition hover:border-red-300/50 hover:bg-red-500/20"
      aria-label="Force Logout"
      title="Force Logout"
    >
      ⏻
    </button>
  );
}
