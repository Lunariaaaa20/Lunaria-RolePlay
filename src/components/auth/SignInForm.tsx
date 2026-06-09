"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
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

const ADMIN_ACCESS_CODE = "Dyzen-Lucia-9955";

// Kalau nanti punya URL background foto fantasy malam,
// tempel di sini. Contoh:
// const BACKGROUND_IMAGE_URL = "https://....jpg";
const BACKGROUND_IMAGE_URL = "https://cdn.phototourl.com/free/2026-06-09-b13b591d-0018-4868-9d3a-e25a286f768b.png";

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

  const welcomeText = useMemo(() => {
    if (mode === "player") {
      return {
        title: "Welcome, Adventurer",
        text: "Masukkan nama yang telah disumpah dan kode akses dari Guild Registry. Hanya ID Card aktif yang dapat melewati gerbang ini.",
        badge: "Player Gate",
      };
    }

    return {
      title: "Welcome, Guild Master",
      text: "Masukkan kode admin untuk membuka ruang kontrol Lunaria: approval, ID Card, ekonomi, dan sistem guild.",
      badge: "Admin Gate",
    };
  }, [mode]);

  const saveSession = (session: PlayerSession | AdminSession) => {
    const payload = {
      ...session,
      loginAt: new Date().toISOString(),
    };

    localStorage.removeItem("lunaria_session");
    sessionStorage.removeItem("lunaria_session");

    if (keepLogin) {
      localStorage.setItem("lunaria_session", JSON.stringify(payload));
    } else {
      sessionStorage.setItem("lunaria_session", JSON.stringify(payload));
    }
  };

  const resetMessages = () => {
    setNotice("");
    setErrorMessage("");
  };

  const handlePlayerLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
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
    }, 800);
  };

  const handleAdminLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    const cleanAdminCode = adminCode.trim();

    if (cleanAdminCode !== ADMIN_ACCESS_CODE) {
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
    }, 800);
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#03040b] text-slate-100">
      {BACKGROUND_IMAGE_URL ? (
        <div
          className="pointer-events-none fixed inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}
        />
      ) : null}

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(245,158,11,0.20),transparent_28%),radial-gradient(circle_at_88%_22%,rgba(124,58,237,0.22),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.12),transparent_35%),linear-gradient(135deg,#050611,#070812_45%,#02030a)]" />

      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:58px_58px] opacity-70" />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <span className="gate-particle left-[8%] top-[18%] animation-delay-0" />
        <span className="gate-particle left-[18%] top-[74%] animation-delay-700" />
        <span className="gate-particle left-[42%] top-[12%] animation-delay-1000" />
        <span className="gate-particle left-[64%] top-[82%] animation-delay-300" />
        <span className="gate-particle left-[82%] top-[28%] animation-delay-1500" />
        <span className="gate-particle left-[92%] top-[66%] animation-delay-500" />
      </div>

      <main className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid w-full max-w-7xl grid-cols-1 overflow-hidden rounded-[34px] border border-amber-400/20 bg-black/50 shadow-[0_0_90px_rgba(245,158,11,0.12)] backdrop-blur-xl lg:grid-cols-12">
          <aside className="relative hidden min-h-[720px] overflow-hidden border-r border-amber-400/15 bg-gradient-to-br from-black via-slate-950 to-violet-950/70 p-8 xl:col-span-5 xl:block">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.26),transparent_34%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.45em] text-amber-300">
                  Lunaria
                </p>

                <h1 className="mt-5 text-5xl font-black leading-[1.05] text-white">
                  Roleplay
                  <br />
                  Guild Access
                  <br />
                  Gate
                </h1>

                <p className="mt-6 max-w-md text-sm leading-7 text-slate-400">
                  Gerbang resmi untuk adventurer dan admin Lunaria. Hanya ID
                  yang sudah disetujui Guild Registry yang dapat masuk ke sistem.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                    Gatekeeper Message
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    “Masukkan nama yang telah disumpah di bawah cahaya guild,
                    lalu biarkan gerbang mengenali jejakmu.”
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MiniLoreCard label="Registry" value="Active" />
                  <MiniLoreCard label="Access" value="Sealed" />
                </div>
              </div>
            </div>
          </aside>

          <section className="relative xl:col-span-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.10),transparent_34%)]" />

            <div className="relative z-10 p-5 sm:p-8 lg:p-10">
              <div className="mb-7 flex items-center justify-between gap-4">
                <Link
                  href="/"
                  className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-300 transition hover:border-amber-400/30 hover:text-amber-300"
                >
                  Back
                </Link>

                <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-amber-300">
                  Secure Guild Gate
                </div>
              </div>

              <div className="mb-7 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
                  Welcome to Lunaria
                </p>

                <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                  {welcomeText.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {welcomeText.text}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
                    Access Verification
                  </p>

                  <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-200">
                    {welcomeText.badge}
                  </span>
                </div>

                <h3 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                  Sign In
                </h3>

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
                    resetMessages();
                    setShowCode(false);
                  }}
                  className={`rounded-2xl px-4 py-4 text-sm font-black uppercase tracking-[0.16em] transition ${
                    mode === "player"
                      ? "border border-amber-400/30 bg-gradient-to-r from-amber-500/20 to-violet-500/20 text-amber-200 shadow-[0_0_24px_rgba(245,158,11,0.10)]"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Player
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("admin");
                    resetMessages();
                    setShowCode(false);
                  }}
                  className={`rounded-2xl px-4 py-4 text-sm font-black uppercase tracking-[0.16em] transition ${
                    mode === "admin"
                      ? "border border-violet-400/30 bg-gradient-to-r from-violet-500/20 to-amber-500/20 text-violet-200 shadow-[0_0_24px_rgba(124,58,237,0.10)]"
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
                      placeholder="Example: dyzen384"
                      className="lunaria-gate-input"
                      autoComplete="off"
                      name="lunaria-player-username"
                    />
                  </Field>

                  <Field label="Access Code">
                    <div className="relative">
                      <input
                        value={accessCode}
                        onChange={(event) => setAccessCode(event.target.value)}
                        type={showCode ? "text" : "password"}
                        placeholder="Example: DYZE-1899"
                        className="lunaria-gate-input pr-28"
                        autoComplete="new-password"
                        name="lunaria-player-access-code"
                      />

                      <button
                        type="button"
                        onClick={() => setShowCode((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400"
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
                    className="w-full rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-600/35 via-amber-500/20 to-violet-600/25 px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-amber-100 shadow-[0_0_28px_rgba(245,158,11,0.12)] transition hover:border-amber-300/50 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
                        autoComplete="new-password"
                        name="lunaria-admin-gate-code"
                      />

                      <button
                        type="button"
                        onClick={() => setShowCode((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400"
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
                    className="w-full rounded-2xl border border-violet-400/30 bg-gradient-to-r from-violet-600/35 via-violet-500/20 to-amber-600/25 px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-violet-100 shadow-[0_0_28px_rgba(124,58,237,0.12)] transition hover:border-violet-300/50 hover:bg-violet-500/20"
                  >
                    Enter Admin Panel
                  </button>
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
          background: rgba(0, 0, 0, 0.36);
          padding: 0.95rem 1rem;
          color: rgb(241, 245, 249);
          outline: none;
          transition: 180ms ease;
        }

        .lunaria-gate-input::placeholder {
          color: rgb(100, 116, 139);
        }

        .lunaria-gate-input:focus {
          border-color: rgba(245, 158, 11, 0.52);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12);
        }

        .gate-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: rgba(245, 158, 11, 0.8);
          box-shadow: 0 0 22px rgba(245, 158, 11, 0.7);
          animation: floatGate 7s ease-in-out infinite;
        }

        .animation-delay-0 {
          animation-delay: 0ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-500 {
          animation-delay: 500ms;
        }

        .animation-delay-700 {
          animation-delay: 700ms;
        }

        .animation-delay-1000 {
          animation-delay: 1000ms;
        }

        .animation-delay-1500 {
          animation-delay: 1500ms;
        }

        @keyframes floatGate {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0.2;
          }
          35% {
            opacity: 1;
          }
          50% {
            transform: translateY(-42px) scale(1.15);
            opacity: 0.85;
          }
          100% {
            transform: translateY(-84px) scale(0.8);
            opacity: 0;
          }
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

function MiniLoreCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
    }
