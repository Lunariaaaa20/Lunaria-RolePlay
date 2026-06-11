"use client";

import Link from "next/link";
import LunariaBrandLogo from "@/components/common/LunariaBrandLogo";
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

/**
 * File background harus ada di:
 * public/images/lunaria-login-bg.png
 *
 * Nanti URL otomatis jadi:
 * /images/lunaria-login-bg.png
 */
const BACKGROUND_IMAGE_URL = "/images/lunaria-login-bg.png";

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
    if (mode === "admin") {
      return {
        title: "Welcome, Guild Master",
        body: "Masukkan kode rahasia untuk membuka ruang kendali Lunaria.",
        badge: "Admin Gate",
      };
    }

    return {
      title: "Welcome, Adventurer",
      body: "Masukkan nama yang telah disumpah dan kode akses dari Guild Registry.",
      badge: "Player Gate",
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
    }, 700);
  };

  const handleAdminLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    setErrorMessage("");

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
    }, 700);
  };

  const resetMessage = () => {
    setNotice("");
    setErrorMessage("");
    setShowCode(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#02030a] text-slate-100">
      {/* Background Foto */}
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center bg-no-repeat opacity-70"
        style={{
          backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
        }}
      />

      {/* Dark Fantasy Overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.25),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.32),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.90),rgba(2,3,10,0.78),rgba(5,6,17,0.92))]" />

      {/* Grid Overlay */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:58px_58px]" />

      {/* Animated Mist */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="lunaria-mist absolute -left-1/4 top-10 h-80 w-[70vw] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="lunaria-mist-2 absolute -right-1/4 bottom-10 h-96 w-[80vw] rounded-full bg-violet-500/15 blur-3xl" />
      </div>

      {/* Floating Particles */}
      <div className="pointer-events-none fixed inset-0">
        <span className="particle particle-1" />
        <span className="particle particle-2" />
        <span className="particle particle-3" />
        <span className="particle particle-4" />
        <span className="particle particle-5" />
        <span className="particle particle-6" />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid w-full max-w-7xl grid-cols-1 overflow-hidden rounded-[34px] border border-amber-400/20 bg-black/45 shadow-[0_0_90px_rgba(245,158,11,0.14)] backdrop-blur-xl lg:min-h-[720px] lg:grid-cols-12">
          {/* Left Visual Panel */}
          <aside className="relative hidden overflow-hidden border-r border-amber-400/15 bg-gradient-to-br from-black/80 via-slate-950/70 to-violet-950/50 p-8 lg:col-span-5 lg:block">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-45"
              style={{
                backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/65 to-black/90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.22),transparent_34%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-8">
                  <LunariaBrandLogo />
                </div>

                <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-300">
                  Moonlit Guild Access
                </p>

                <h1 className="mt-5 max-w-md text-5xl font-black leading-[1.08] text-white xl:text-6xl">
                  Roleplay Guild Access Gate
                </h1>

                <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
                  Gerbang malam menuju arsip guild. Hanya adventurer terdaftar
                  dan admin Lunaria yang dapat melewati segel akses ini.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-5 shadow-[0_0_35px_rgba(245,158,11,0.08)]">
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-300">
                    Gatekeeper Message
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    “Masukkan nama yang telah disumpah pada registry, lalu
                    biarkan gerbang memilih apakah kamu layak masuk.”
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <SmallLoreCard title="Guild Seal" value="Active" />
                  <SmallLoreCard title="Moon Watch" value="Online" />
                </div>
              </div>
            </div>
          </aside>

          {/* Login Panel */}
          <section className="relative lg:col-span-7">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-black/70 to-violet-950/35" />

            <div className="relative z-10 flex min-h-full flex-col justify-center p-5 sm:p-8 lg:p-10">
              <div className="mb-6 flex justify-center lg:hidden">
                <LunariaBrandLogo />
              </div>

              <div className="mb-7 flex items-center justify-between gap-4">
                <Link
                  href="/"
                  className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-300 transition hover:border-amber-400/30 hover:text-amber-300"
                >
                  Back
                </Link>

                <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.08)]">
                  Secure Guild Gate
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
                  Welcome to Lunaria
                </p>

                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                  {welcomeText.title}
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  {welcomeText.body}
                </p>
              </div>

              <div className="mt-8">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
                    Access Verification
                  </p>

                  <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-200">
                    {welcomeText.badge}
                  </span>
                </div>

                <h3 className="mt-3 text-4xl font-black text-white">Sign In</h3>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Pilih mode login. Player memakai credential dari Admin Panel.
                  Admin memakai kode khusus.
                </p>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-white/[0.05] p-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("player");
                    resetMessage();
                  }}
                  className={`rounded-2xl px-4 py-4 text-sm font-black uppercase tracking-[0.18em] transition ${
                    mode === "player"
                      ? "border border-amber-400/35 bg-gradient-to-r from-amber-500/25 to-violet-500/20 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.10)]"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Player
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("admin");
                    resetMessage();
                  }}
                  className={`rounded-2xl px-4 py-4 text-sm font-black uppercase tracking-[0.18em] transition ${
                    mode === "admin"
                      ? "border border-violet-400/35 bg-gradient-to-r from-violet-500/25 to-amber-500/15 text-violet-200 shadow-[0_0_25px_rgba(124,58,237,0.10)]"
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
                <form onSubmit={handlePlayerLogin} className="mt-7 space-y-5">
                  <Field label="Username">
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Example: dyzen384"
                      className="lunaria-gate-input"
                      autoComplete="off"
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
                        autoComplete="off"
                      />

                      <button
                        type="button"
                        onClick={() => setShowCode((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-300"
                      >
                        {showCode ? "Hide" : "Show"}
                      </button>
                    </div>
                  </Field>

                  <RememberBox
                    checked={keepLogin}
                    onChange={setKeepLogin}
                    text="Keep me logged in on this device"
                  />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-700/55 via-amber-500/25 to-violet-700/45 px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-amber-100 shadow-[0_0_35px_rgba(245,158,11,0.14)] transition hover:border-amber-300/60 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "Checking..." : "Enter Guild System"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAdminLogin} className="mt-7 space-y-5">
                  <Field label="Admin Code">
                    <div className="relative">
                      <input
                        value={adminCode}
                        onChange={(event) => setAdminCode(event.target.value)}
                        type={showCode ? "text" : "password"}
                        placeholder="Enter admin code"
                        className="lunaria-gate-input pr-28"
                        autoComplete="off"
                      />

                      <button
                        type="button"
                        onClick={() => setShowCode((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-300"
                      >
                        {showCode ? "Hide" : "Show"}
                      </button>
                    </div>
                  </Field>

                  <RememberBox
                    checked={keepLogin}
                    onChange={setKeepLogin}
                    text="Keep admin session on this device"
                  />

                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-violet-400/35 bg-gradient-to-r from-violet-700/50 via-violet-500/25 to-amber-700/35 px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-violet-100 shadow-[0_0_35px_rgba(124,58,237,0.16)] transition hover:border-violet-300/60 hover:brightness-110"
                  >
                    Enter Admin Panel
                  </button>
                </form>
              )}

              <div className="mt-7 rounded-[28px] border border-sky-400/20 bg-sky-400/10 p-5 shadow-[0_0_25px_rgba(56,189,248,0.06)]">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-300">
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
          border-radius: 1rem;
          border: 1px solid rgba(245, 158, 11, 0.18);
          background: rgba(0, 0, 0, 0.42);
          padding: 1rem 1rem;
          color: rgb(241, 245, 249);
          outline: none;
          transition: 180ms ease;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .lunaria-gate-input::placeholder {
          color: rgb(100, 116, 139);
        }

        .lunaria-gate-input:focus {
          border-color: rgba(245, 158, 11, 0.55);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .lunaria-mist {
          animation: mistMove 12s ease-in-out infinite alternate;
        }

        .lunaria-mist-2 {
          animation: mistMoveTwo 15s ease-in-out infinite alternate;
        }

        @keyframes mistMove {
          from {
            transform: translate3d(-3%, 0, 0) scale(1);
          }
          to {
            transform: translate3d(9%, 8%, 0) scale(1.12);
          }
        }

        @keyframes mistMoveTwo {
          from {
            transform: translate3d(5%, 0, 0) scale(1);
          }
          to {
            transform: translate3d(-8%, -6%, 0) scale(1.16);
          }
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 9999px;
          background: rgba(245, 158, 11, 0.65);
          box-shadow: 0 0 18px rgba(245, 158, 11, 0.65);
          animation: floatParticle 8s ease-in-out infinite;
        }

        .particle-1 {
          left: 12%;
          top: 22%;
          animation-delay: 0s;
        }

        .particle-2 {
          left: 24%;
          top: 74%;
          animation-delay: 1.2s;
        }

        .particle-3 {
          left: 48%;
          top: 18%;
          animation-delay: 2.1s;
        }

        .particle-4 {
          left: 69%;
          top: 66%;
          animation-delay: 3s;
        }

        .particle-5 {
          left: 83%;
          top: 28%;
          animation-delay: 4.2s;
        }

        .particle-6 {
          left: 91%;
          top: 82%;
          animation-delay: 5.1s;
        }

        @keyframes floatParticle {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.6);
          }
          30% {
            opacity: 1;
          }
          70% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: translateY(-70px) scale(1.15);
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
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function RememberBox({
  checked,
  onChange,
  text,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  text: string;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-400">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-amber-400"
      />
      {text}
    </label>
  );
}

function SmallLoreCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
                }
