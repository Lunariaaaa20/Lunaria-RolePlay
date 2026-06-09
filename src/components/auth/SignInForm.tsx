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

type Particle = {
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
};

const ADMIN_CODE = "Dyzen-Lucia-9955";

const particles: Particle[] = [
  { left: "8%", top: "16%", size: 5, delay: "0s", duration: "8s" },
  { left: "14%", top: "72%", size: 4, delay: "1.2s", duration: "9s" },
  { left: "21%", top: "36%", size: 6, delay: "2s", duration: "7.8s" },
  { left: "30%", top: "12%", size: 4, delay: "0.7s", duration: "8.6s" },
  { left: "42%", top: "68%", size: 5, delay: "1.7s", duration: "9.4s" },
  { left: "52%", top: "24%", size: 7, delay: "0.4s", duration: "8.4s" },
  { left: "63%", top: "74%", size: 4, delay: "2.4s", duration: "9.2s" },
  { left: "72%", top: "30%", size: 6, delay: "1.1s", duration: "7.6s" },
  { left: "82%", top: "18%", size: 5, delay: "2.1s", duration: "8.8s" },
  { left: "90%", top: "62%", size: 4, delay: "1.5s", duration: "9.8s" },
];

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
      .maybeSingle();

    setIsLoading(false);

    if (error) {
      setErrorMessage(`Login failed: ${error.message}`);
      return;
    }

    if (!data) {
      setErrorMessage("Username atau access code salah.");
      return;
    }

    if (data.status !== "active") {
      setErrorMessage("ID Card ini inactive. Hubungi admin Lunaria.");
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

    setNotice(`Welcome back, ${data.character_name}. Membuka ID Card...`);

    setTimeout(() => {
      window.location.href = "/profile";
    }, 850);
  };

  const handleAdminLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    const cleanAdminCode = adminCode.trim();

    if (!cleanAdminCode) {
      setErrorMessage("Admin code wajib diisi.");
      return;
    }

    if (cleanAdminCode !== ADMIN_CODE) {
      setErrorMessage("Admin code salah.");
      return;
    }

    saveSession({
      role: "admin",
      username: "Guild Admin",
    });

    setNotice("Admin access granted. Membuka Admin Panel...");

    setTimeout(() => {
      window.location.href = "/basic-tables";
    }, 850);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#03040b] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.22),transparent_34%),radial-gradient(circle_at_center,rgba(14,165,233,0.08),transparent_44%)]" />

      <div className="pointer-events-none fixed inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="lunaria-mist lunaria-mist-left" />
      <div className="lunaria-mist lunaria-mist-right" />
      <div className="lunaria-orb lunaria-orb-gold" />
      <div className="lunaria-orb lunaria-orb-violet" />

      {particles.map((particle, index) => (
        <span
          key={index}
          className="lunaria-particle"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-7 sm:px-6 lg:px-8">
        <section className="grid w-full max-w-7xl grid-cols-1 overflow-hidden rounded-[34px] border border-amber-400/20 bg-black/45 shadow-[0_0_90px_rgba(245,158,11,0.12)] backdrop-blur-xl lg:grid-cols-12">
          <aside className="relative hidden min-h-[720px] overflow-hidden border-r border-amber-400/15 bg-gradient-to-br from-black via-slate-950 to-violet-950/60 p-9 lg:col-span-5 lg:block">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_32%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.42em] text-amber-300">
                  Lunaria
                </p>

                <h1 className="mt-5 max-w-md text-5xl font-black leading-[1.08] text-white xl:text-6xl">
                  Roleplay Guild Access Gate
                </h1>

                <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
                  Gerbang resmi untuk adventurer dan admin Lunaria. Hanya ID yang
                  sudah disetujui Guild Registry yang dapat masuk ke sistem.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300">
                    Gatekeeper Message
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    “Masukkan nama yang telah disumpah oleh guild. Jika lentera
                    arsip menyala, gerbang Lunaria akan terbuka.”
                  </p>
                </div>

                <InfoPanel
                  title="Player Access"
                  text="Player memakai username dan access code dari Admin Panel setelah registrasi di-approve."
                  icon="⚜"
                />

                <InfoPanel
                  title="Admin Control"
                  text="Admin memakai kode khusus untuk approval, edit ID Card, status, foto, currency, dan quest record."
                  icon="♛"
                />
              </div>
            </div>
          </aside>

          <section className="relative lg:col-span-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.14),transparent_34%)]" />

            <div className="relative z-10 p-5 sm:p-8 lg:p-10">
              <div className="mb-8 flex items-center justify-between gap-4">
                <Link
                  href="/"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-300 transition hover:border-amber-400/30 hover:text-amber-300"
                >
                  Back
                </Link>

                <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-amber-300">
                  Secure Guild Gate
                </div>
              </div>

              <div className="mb-7 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 lg:hidden">
                <p className="text-xs font-black uppercase tracking-[0.30em] text-amber-300">
                  Welcome to Lunaria
                </p>
                <h1 className="mt-3 text-3xl font-black text-white">
                  Guild Access Gate
                </h1>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Portal khusus adventurer dan admin. Masuk memakai credential
                  yang diberikan setelah registrasi di-approve.
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
                  Access Verification
                </p>

                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                  Sign In
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-400">
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
                  className={`rounded-2xl px-4 py-4 text-sm font-black uppercase tracking-[0.18em] transition ${
                    mode === "player"
                      ? "border border-amber-400/35 bg-gradient-to-r from-amber-600/35 via-amber-500/20 to-violet-600/15 text-amber-200 shadow-[0_0_24px_rgba(245,158,11,0.12)]"
                      : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
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
                  className={`rounded-2xl px-4 py-4 text-sm font-black uppercase tracking-[0.18em] transition ${
                    mode === "admin"
                      ? "border border-violet-400/35 bg-gradient-to-r from-violet-600/35 via-violet-500/20 to-amber-600/15 text-violet-200 shadow-[0_0_24px_rgba(124,58,237,0.12)]"
                      : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
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
                      autoComplete="username"
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
                        autoComplete="current-password"
                      />

                      <button
                        type="button"
                        onClick={() => setShowCode((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400 transition hover:border-amber-400/25 hover:text-amber-300"
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
                    className="w-full rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-700/40 via-amber-500/25 to-violet-700/30 px-5 py-5 text-sm font-black uppercase tracking-[0.24em] text-amber-100 shadow-[0_0_30px_rgba(245,158,11,0.10)] transition hover:border-amber-300/50 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400 transition hover:border-violet-400/25 hover:text-violet-300"
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
                    className="w-full rounded-2xl border border-violet-400/30 bg-gradient-to-r from-violet-700/40 via-violet-500/25 to-amber-700/25 px-5 py-5 text-sm font-black uppercase tracking-[0.24em] text-violet-100 shadow-[0_0_30px_rgba(124,58,237,0.10)] transition hover:border-violet-300/50 hover:brightness-110"
                  >
                    Enter Admin Panel
                  </button>

                  <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">
                      Admin Route
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Untuk MVP, admin code masih disimpan di frontend. Nanti
                      tahap final bisa dipindahkan ke server/API agar lebih aman.
                    </p>
                  </div>
                </form>
              )}

              <div className="mt-8 rounded-3xl border border-sky-400/20 bg-sky-400/10 p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                  Registration
                </p>

                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Belum punya access code? Daftar dulu lewat Registration,
                  tunggu admin approve, lalu admin akan mengirim username dan
                  access code.
                </p>

                <Link
                  href="/form-elements"
                  className="mt-4 inline-flex rounded-2xl border border-sky-400/25 bg-sky-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-sky-300 transition hover:bg-sky-500/20"
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
          border-radius: 1.15rem;
          border: 1px solid rgba(245, 158, 11, 0.18);
          background: rgba(2, 6, 23, 0.74);
          padding: 1rem 1rem;
          color: rgb(241, 245, 249);
          outline: none;
          transition: 180ms ease;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.015);
        }

        .lunaria-gate-input::placeholder {
          color: rgb(100, 116, 139);
        }

        .lunaria-gate-input:focus {
          border-color: rgba(245, 158, 11, 0.48);
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
        }

        .lunaria-particle {
          position: fixed;
          z-index: 1;
          border-radius: 9999px;
          background: radial-gradient(
            circle,
            rgba(250, 204, 21, 0.95) 0%,
            rgba(250, 204, 21, 0.35) 42%,
            rgba(250, 204, 21, 0) 78%
          );
          pointer-events: none;
          animation-name: lunaria-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        .lunaria-mist {
          position: fixed;
          border-radius: 9999px;
          filter: blur(70px);
          opacity: 0.22;
          pointer-events: none;
          animation: lunaria-drift 18s ease-in-out infinite;
        }

        .lunaria-mist-left {
          left: -120px;
          top: 80px;
          width: 360px;
          height: 360px;
          background: rgba(245, 158, 11, 0.22);
        }

        .lunaria-mist-right {
          right: -140px;
          bottom: 60px;
          width: 430px;
          height: 430px;
          background: rgba(124, 58, 237, 0.22);
          animation-duration: 22s;
        }

        .lunaria-orb {
          position: fixed;
          border-radius: 9999px;
          filter: blur(95px);
          pointer-events: none;
          opacity: 0.16;
        }

        .lunaria-orb-gold {
          left: 18%;
          bottom: -80px;
          width: 260px;
          height: 260px;
          background: rgba(245, 158, 11, 0.24);
        }

        .lunaria-orb-violet {
          right: 18%;
          top: -80px;
          width: 280px;
          height: 280px;
          background: rgba(99, 102, 241, 0.24);
        }

        @keyframes lunaria-float {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.28;
          }
          50% {
            transform: translateY(-14px) scale(1.18);
            opacity: 0.9;
          }
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.28;
          }
        }

        @keyframes lunaria-drift {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(28px, -18px, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
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
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
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
