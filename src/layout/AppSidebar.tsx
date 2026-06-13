"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useSidebar } from "@/context/SidebarContext";

type NavItem = {
  name: string;
  href?: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  playerOnly?: boolean;
  children?: {
    name: string;
    href: string;
  }[];
};

type LunariaSession = {
  role: "player" | "admin";
  username: string;
  characterName?: string;
  rank?: string;
  pathway?: string;
};

const guildMenu: NavItem[] = [
  {
    name: "Guild Hall",
    href: "/",
    icon: <GridIcon />,
  },
  {
    name: "ID Card",
    href: "/profile",
    icon: <UserSealIcon />,
  },
  {
  name: "Moon Familiar",
  href: "/familiar",
  icon: <MoonSparkIcon />,
},
  {
  name: "Familiar Grant",
  href: "/familiar-grant",
  icon: <MoonSparkIcon />,
  adminOnly: true,
},
  {
    name: "Throne Board",
    href: "/line-chart",
    icon: <MoonChartIcon />,
  },
  {
    name: "Cosmetic Vault",
    href: "/buttons",
    icon: <CrystalBoxIcon />,
  },
  {
    name: "Fortune Hall",
    href: "/calendar",
    icon: <MoonCalendarIcon />,
  },
  {
    name: "Registry",
    href: "/form-elements",
    icon: <ScrollIcon />,
  },
  {
    name: "Admin Control",
    href: "/basic-tables",
    icon: <CommandIcon />,
    adminOnly: true,
  },
];

 const archiveMenu: NavItem[] = [
  {
    name: "Archives",
    icon: <ArchiveIcon />,
    children: [
      {
        name: "Royal Treasury",
        href: "/economy-archive",
      },
      {
        name: "Relief Ledger",
        href: "/economy-archive",
      },
      {
        name: "Relic Exchange",
        href: "/economy-archive",
      },
    ],
  },
  {
    name: "Access Gate",
    icon: <GateIcon />,
    children: [
      {
        name: "Login Code",
        href: "/signin",
      },
      {
        name: "New Adventurer",
        href: "/form-elements",
      },
    ],
  },
];

function getSession(): LunariaSession | null {
  if (typeof window === "undefined") return null;

  const raw =
    sessionStorage.getItem("lunaria_session") ||
    localStorage.getItem("lunaria_session");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as LunariaSession;
  } catch {
    return null;
  }
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const [openGroup, setOpenGroup] = useState<string | null>("");

  const session = useMemo(() => getSession(), []);
  const expanded = isExpanded || isHovered || isMobileOpen;

  const visibleGuildMenu = guildMenu.filter((item) => {
    if (item.adminOnly && session?.role !== "admin") return false;
    if (item.playerOnly && session?.role !== "player") return false;
    return true;
  });

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isGroupActive = (item: NavItem) => {
    return item.children?.some((child) => isActive(child.href)) || false;
  };

  const handleGroup = (name: string) => {
    setOpenGroup((prev) => (prev === name ? null : name));
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-[9999] flex h-screen flex-col border-r border-amber-400/10 bg-[#05050d]/96 text-slate-300 shadow-[18px_0_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 ease-in-out ${
        expanded ? "w-[248px]" : "w-[82px]"
      } ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
      onMouseEnter={() => setIsHovered?.(true)}
      onMouseLeave={() => setIsHovered?.(false)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.14),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div
        className={`relative z-10 flex h-[88px] items-center border-b border-white/[0.06] px-4 ${
          expanded ? "justify-start" : "justify-center"
        }`}
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-amber-400/25 bg-gradient-to-br from-amber-500/15 via-black/30 to-violet-500/15 shadow-[0_0_28px_rgba(245,158,11,0.12)]">
            <MoonCrownIcon />
            <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.9)]" />
          </div>

          {expanded ? (
            <div>
              <p className="text-[15px] font-black uppercase tracking-[0.28em] text-amber-300">
                Lunaria
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                Moonlit Guild
              </p>
            </div>
          ) : null}
        </Link>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-3 py-5 no-scrollbar">
        <SidebarSectionTitle expanded={expanded}>Guild System</SidebarSectionTitle>

        <nav className="space-y-2">
          {visibleGuildMenu.map((item) => (
            <SidebarLink
              key={item.name}
              item={item}
              active={isActive(item.href)}
              expanded={expanded}
            />
          ))}
        </nav>

        <div className="mt-7">
          <SidebarSectionTitle expanded={expanded}>Archives</SidebarSectionTitle>

          <nav className="space-y-2">
            {archiveMenu.map((item) => {
              const active = isGroupActive(item);
              const open = openGroup === item.name;

              return (
                <div key={item.name}>
                  <button
                    onClick={() => handleGroup(item.name)}
                    className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-[20px] border px-3 py-3 text-left transition ${
                      active || open
                        ? "border-amber-400/30 bg-amber-500/10 text-amber-200 shadow-[0_0_26px_rgba(245,158,11,0.08)]"
                        : "border-transparent bg-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-200"
                    } ${expanded ? "justify-start" : "justify-center"}`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border transition ${
                        active || open
                          ? "border-amber-400/25 bg-amber-500/15 text-amber-300"
                          : "border-white/[0.06] bg-white/[0.035] text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      {item.icon}
                    </span>

                    {expanded ? (
                      <>
                        <span className="flex-1 text-[13px] font-bold">
                          {item.name}
                        </span>

                        <span
                          className={`transition ${
                            open ? "rotate-180 text-amber-300" : "text-slate-500"
                          }`}
                        >
                          <ChevronDownIcon />
                        </span>
                      </>
                    ) : null}
                  </button>

                  {expanded && open ? (
                    <div className="ml-[31px] mt-2 space-y-1 border-l border-white/10 pl-4">
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block rounded-xl px-3 py-2 text-[12px] font-semibold transition ${
                            isActive(child.href)
                              ? "bg-amber-500/10 text-amber-300"
                              : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                          }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/[0.06] p-3">
        {expanded ? (
          <div className="rounded-[24px] border border-amber-400/15 bg-gradient-to-br from-amber-500/10 via-black/25 to-violet-500/10 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[16px] border border-amber-400/25 bg-amber-500/10 text-amber-300">
                <MoonSparkIcon />
              </div>

              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-300">
                  Guild Notice
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Lunaria System
                </p>
              </div>
            </div>

            <p className="text-xs leading-5 text-slate-400">
              Di bawah cahaya bulan Lunaria, ID Card, leaderboard, cosmetic,
              dan ekonomi guild bergerak dalam satu registry.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[18px] border border-amber-400/20 bg-amber-500/10 text-amber-300">
            <MoonSparkIcon />
          </div>
        )}
      </div>
    </aside>
  );
}

function SidebarSectionTitle({
  children,
  expanded,
}: {
  children: React.ReactNode;
  expanded: boolean;
}) {
  if (!expanded) {
    return <div className="mb-3 h-px w-full bg-white/[0.06]" />;
  }

  return (
    <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.32em] text-amber-400/70">
      {children}
    </p>
  );
}

function SidebarLink({
  item,
  active,
  expanded,
}: {
  item: NavItem;
  active: boolean;
  expanded: boolean;
}) {
  return (
    <Link
      href={item.href || "#"}
      className={`group relative flex items-center gap-3 overflow-hidden rounded-[20px] border px-3 py-3 transition ${
        active
          ? "border-amber-400/35 bg-gradient-to-r from-amber-500/16 via-amber-500/8 to-violet-500/10 text-amber-200 shadow-[0_0_28px_rgba(245,158,11,0.09)]"
          : "border-transparent bg-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-200"
      } ${expanded ? "justify-start" : "justify-center"}`}
    >
      {active ? (
        <span className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.8)]" />
      ) : null}

      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border transition ${
          active
            ? "border-amber-400/30 bg-amber-500/15 text-amber-300"
            : "border-white/[0.06] bg-white/[0.035] text-slate-400 group-hover:text-slate-200"
        }`}
      >
        {item.icon}
      </span>

      {expanded ? (
        <span className="text-[13px] font-bold tracking-[-0.01em]">
          {item.name}
        </span>
      ) : null}
    </Link>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M5 5h5v5H5V5ZM14 5h5v5h-5V5ZM5 14h5v5H5v-5ZM14 14h5v5h-5v-5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserSealIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 13.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M4.8 20c.95-3.25 3.4-5 7.2-5s6.25 1.75 7.2 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M12 2.8 13.15 5 15.6 5.3l-1.75 1.7.42 2.42L12 8.28 9.73 9.42 10.15 7 8.4 5.3 10.85 5 12 2.8Z"
        fill="currentColor"
        opacity=".35"
      />
    </svg>
  );
}

function MoonChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M5 19V9M12 19V5M19 19v-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M20.2 6.8A4.6 4.6 0 0 1 13.8.4 4.8 4.8 0 1 0 20.2 6.8Z"
        fill="currentColor"
        opacity=".35"
      />
    </svg>
  );
}

function CrystalBoxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="m12 3 7 4v10l-7 4-7-4V7l7-4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m5.3 7.2 6.7 4 6.7-4M12 11.2V21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoonCalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M7 3v3M17 3v3M4.5 9h15M6 5h12a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M15.8 16.2a3.8 3.8 0 0 1-5.2-5.2 4 4 0 1 0 5.2 5.2Z"
        fill="currentColor"
        opacity=".4"
      />
    </svg>
  );
}

function ScrollIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M7 4h10a2 2 0 0 1 2 2v14H8a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 9h8M8 13h6M8 17h5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CommandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 3.5 19 7.5v9L12 20.5 5 16.5v-9l7-4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 8v8M8 12h8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M5 6.5h14M7 6.5v13h10v-13M9 10h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 3.5h8l1 3H7l1-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GateIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M6 20V8a6 6 0 0 1 12 0v12M9 20V8a3 3 0 0 1 6 0v12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4 20h16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="m7 9 5 5 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoonCrownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-amber-300" fill="none">
      <path
        d="M4.5 17.5h15M6.2 16.8 5 8.2l4.4 3.1L12 6l2.6 5.3L19 8.2l-1.2 8.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.8 4.8A4.2 4.2 0 0 1 13 0.8a4.4 4.4 0 1 0 5.8 4Z"
        fill="currentColor"
        opacity=".35"
      />
    </svg>
  );
}

function MoonSparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.8 7.8 0 1 0 9.5 9.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M6 4v4M4 6h4M17 3v3M15.5 4.5h3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
