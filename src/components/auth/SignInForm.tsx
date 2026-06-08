"use client";

import Link from "next/link";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

type PlayerSession = {
  role: "player";
  playerId: string;
  username: string;
  characterName: string;
  rank: string;
  pathway: string;
};

type AdminSession = {
  role: "admin";
  username: string;
};

const ADMIN_CODE = "LUNARIA-ADMIN-2026";

export default function SignInForm() {
  const [mode, setMode] = useState<"player" | "admin">("player");
  const [username, setUsername] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [keepLogin, setKeepLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const saveSession = (session: PlayerSession | AdminSession) => {
    const payload = {
      ...session,
      loginAt: new Date().toISOString(),
    };

    if (keepLogin) {
      localStorage.setItem("lunaria_session", JSON.stringify(payload));
    } else {
      sessionStorage.setItem("lunaria_session", JSON.stringify(payload));
    }
  };

  const handlePlayerLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    setErrorMessage("");
    setIsLoading(true);

    const cleanUsername = username.trim();
    const cleanCode = accessCode.trim();

    if (!cleanUsername || !cleanCode) {
      setIsLoading(false);
      setErrorMessage("Username dan access code wajib diisi.");
      return;
    }

    const { data, error } = await supabase
      .from("players")
      .select(
        `
        id,
        username,
        access_code,
        character_name,
        guild_rank,
        pathway,
        status
      `
      )
      .eq("username", cleanUsername)
      .eq("access_code", cleanCode)
      .eq("status", "active")
      .maybeSingle();

    setIsLoading(false);

    if (error) {
      setErrorMessage(`Login failed: ${error.message}`);
      return;
    }

    if (!data) {
      setErrorMessage("Username atau access code salah, atau akun belum aktif.");
      return;
    }

    saveSession({
      role: "player",
      playerId: data.id,
      username: data.username,
      characterName: data.character_name,
      rank: data.guild_rank,
      pathway: data.pathway,
    });

    setNotice(`Welcome, ${data.character_name}. Redirecting to ID Card...`);

    setTimeout(() => {
      window.location.href = "/profile";
    }, 900);
  };

  const handleAdminLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    setErrorMessage("");

    if (adminCode.trim() !== ADMIN_CODE) {
      setErrorMessage("Admin code salah.");
      return;
    }

    saveSession({
      role: "admin",
      username: "Guild Admin",
    });

    setNotice("Admin access granted. Redirecting to Admin Panel...");

    setTimeout(() => {
      window.location.href = "/basic-tables";
    }, 900);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#050611] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.18),transparent_35%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:54px_54px]" />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <section className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-[36px] border border-amber-400/20 bg-black/45 shadow-[0_0_80px_rgba(245,158,11,0.12)] lg:grid-cols-12">
          <aside className="relative hidden min-h-[680px] border-r border-amber-400/15 bg-gradient-to-br from-black via-slate-950 to-violet-950/60 p-8 lg:col-span-5 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_35%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.42em] text-amber-300">
                  Lunaria
                </p>
                <h1 className="mt-4 text-5xl font-black leading-tight text-white">
                  Roleplay Guild Access Gate
                </h1>
                <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                  Login khusus adventurer dan admin Lunaria. Player hanya masuk
                  memakai username dan access code yang diberikan setelah
                  pendaftaran di-approve.
                </p>
              </div>

              <div className="space-y-4">
                <InfoPanel
                  title="Player Access"
                  text="Gunakan username + access code dari admin untuk membuka ID Card dan fitur player."
                  icon="⚜"
                />
                <InfoPanel
                  title="Admin Control"
                  text="Admin memakai kode khusus untuk masuk ke panel approval dan edit ID Card."
                  icon="♛"
                />
              </div>
            </div>
          </aside>

          <section className="lg:col-span-7">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="mb-8 flex items-center justify-between gap-4">
                <Link
                  href="/"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-300 transition hover:border-amber-400/30 hover:text-amber-300"
                >
                  Back
                </Link>

                <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-amber-300">
                  Secure MVP Gate
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
                  Access Verification
                </p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                  Sign In
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Pilih mode login. Player memakai credential dari Admin Panel.
                  Admin memakai kode khusus.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("player");
                    setErrorMessage("");
                    setNotice("");
                  }}
                  className={`rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.16em] transition ${
                    mode === "player"
                      ? "border border-amber-400/30 bg-amber-500/15 text-amber-300"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Player
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("admin");
                    setErrorMessage("");
                    setNotice("");
                  }}
                  className={`rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.16em] transition ${
                    mode === "admin"
                      ? "border border-violet-400/30 bg-violet-500/15 text-violet-300"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Admin
                </button>
              </div>

              {notice ? (
                <div className="mt-6 rounded-3xl border border-emerald-400/25 bg-emerald-400/10 p-5 text-emerald-200">
                  <p className="text-sm font-bold">{notice}</p>
                </div>
              ) : null}

              {errorMessage ? (
                <div className="mt-6 rounded-3xl border border-red-400/25 bg-red-400/10 p-5 text-red-200">
                  <p className="text-sm font-bold">{errorMessage}</p>
                </div>
              ) : null}

              {mode === "player" ? (
                <form onSubmit={handlePlayerLogin} className="mt-8 space-y-5">
                  <Field label="Username">
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Example: lucia384"
                      className="lunaria-gate-input"
                      autoComplete="username"
                    />
                  </Field>

                  <Field label="Access Code">
                    <div className="relative">
                      <input
                        value={accessCode}
                        onChange={(event) => setAccessCode(event.target.value)}
                        type={showCode ? "text" : "password"}
                        placeholder="Example: LUCI-9132"
                        className="lunaria-gate-input pr-28"
                        autoComplete="current-password"
                      />

                      <button
                        type="button"
                        onClick={() => setShowCode((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400"
                      >
                        {showCode ? "Hide" : "Show"}
                      </button>
                    </div>
                  </Field>

                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      checked={keepLogin}
                      onChange={(event) => setKeepLogin(event.target.checked)}
                      className="h-4 w-4 accent-amber-400"
                    />
                    Keep me logged in on this device
                  </label>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-violet-600/20 px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-amber-200 shadow-[0_0_28px_rgba(245,158,11,0.10)] transition hover:border-amber-300/50 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "Checking..." : "Enter Guild System"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAdminLogin} className="mt-8 space-y-5">
                  <Field label="Admin Code">
                    <div className="relative">
                      <input
                        value={adminCode}
                        onChange={(event) => setAdminCode(event.target.value)}
                        type={showCode ? "text" : "password"}
                        placeholder="Enter admin code"
                        className="lunaria-gate-input pr-28"
                      />

                      <button
                        type="button"
                        onClick={() => setShowCode((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400"
                      >
                        {showCode ? "Hide" : "Show"}
                      </button>
                    </div>
                  </Field>

                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      checked={keepLogin}
                      onChange={(event) => setKeepLogin(event.target.checked)}
                      className="h-4 w-4 accent-violet-400"
                    />
                    Keep admin session on this device
                  </label>

                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-violet-400/30 bg-gradient-to-r from-violet-600/30 via-violet-500/20 to-amber-600/20 px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-violet-200 shadow-[0_0_28px_rgba(124,58,237,0.10)] transition hover:border-violet-300/50 hover:bg-violet-500/20"
                  >
                    Enter Admin Panel
                  </button>

                  <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">
                      Admin Code
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Untuk MVP, admin code masih ditulis di file frontend.
                      Nanti tahap final kita pindahkan ke server/API agar lebih
                      aman.
                    </p>
                  </div>
                </form>
              )}

              <div className="mt-8 rounded-3xl border border-sky-400/20 bg-sky-400/10 p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                  Registration
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Belum punya access code? Daftar dulu lewat Registration,
                  tunggu admin approve, lalu admin akan mengirim username dan
                  access code.
                </p>

                <Link
                  href="/form-elements"
                  className="mt-4 inline-flex rounded-2xl border border-sky-400/25 bg-sky-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-sky-300"
                >
                  Open Registration
                </Link>
              </div>
            </div>
          </section>
        </section>
      </main>

      <style jsx>{`
        .lunaria-gate-input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(245, 158, 11, 0.18);
          background: rgba(0, 0, 0, 0.28);
          padding: 0.95rem 1rem;
          color: rgb(241, 245, 249);
          outline: none;
          transition: 180ms ease;
        }

        .lunaria-gate-input::placeholder {
          color: rgb(100, 116, 139);
        }

        .lunaria-gate-input:focus {
          border-color: rgba(245, 158, 11, 0.45);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function InfoPanel({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10 text-xl">
          {icon}
        </div>

        <div>
          <p className="font-black text-white">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
        </div>
      </div>
    </div>
  );
}
