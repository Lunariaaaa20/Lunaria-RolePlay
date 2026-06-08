"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Guild Dashboard",
    path: "/",
  },
  {
    icon: <UserCircleIcon />,
    name: "Adventurer ID Card",
    path: "/profile",
  },
  {
    icon: <PieChartIcon />,
    name: "Leaderboard",
    path: "/line-chart",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Cosmetic Shop",
    path: "/buttons",
  },
  {
    icon: <CalenderIcon />,
    name: "Fortune Hall",
    path: "/calendar",
  },
  {
    icon: <ListIcon />,
    name: "Registration",
    path: "/form-elements",
  },
  {
    icon: <TableIcon />,
    name: "Admin Panel",
    path: "/basic-tables",
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PageIcon />,
    name: "Guild Archives",
    subItems: [
      { name: "Guild Notice Board", path: "/blank", pro: false },
      { name: "Archive Error", path: "/error-404", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Access Gate",
    subItems: [
      { name: "Login Code", path: "/signin", pro: false },
      { name: "New Adventurer", path: "/signup", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );

  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let submenuMatched = false;

    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;

      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;

      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }

      return { type: menuType, index };
    });
  };

  const renderMenuItems = (
    items: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-3">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "border border-amber-400/40 bg-amber-500/10 text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.12)]"
                  : "text-slate-300 hover:border hover:border-amber-500/20 hover:bg-white/[0.04] hover:text-amber-200"
              } ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              } cursor-pointer`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "bg-amber-400/15 text-amber-300"
                    : "bg-white/[0.03] text-slate-400 group-hover:bg-amber-400/10 group-hover:text-amber-300"
                }`}
              >
                {nav.icon}
              </span>

              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="tracking-wide">{nav.name}</span>
              )}

              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto h-5 w-5 transition-transform duration-300 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-amber-300"
                      : "text-slate-500"
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive(nav.path)
                    ? "border border-amber-400/40 bg-amber-500/10 text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.12)]"
                    : "text-slate-300 hover:border hover:border-amber-500/20 hover:bg-white/[0.04] hover:text-amber-200"
                } ${!isExpanded && !isHovered ? "lg:justify-center" : ""}`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${
                    isActive(nav.path)
                      ? "bg-amber-400/15 text-amber-300"
                      : "bg-white/[0.03] text-slate-400 group-hover:bg-amber-400/10 group-hover:text-amber-300"
                  }`}
                >
                  {nav.icon}
                </span>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="tracking-wide">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="ml-12 mt-2 space-y-1 border-l border-amber-500/10 pl-4">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`flex items-center rounded-xl px-3 py-2 text-xs font-medium tracking-wide transition-all duration-300 ${
                        isActive(subItem.path)
                          ? "bg-amber-500/10 text-amber-300"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-amber-200"
                      }`}
                    >
                      {subItem.name}

                      <span className="ml-auto flex items-center gap-1">
                        {subItem.new && (
                          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase text-emerald-300">
                            new
                          </span>
                        )}

                        {subItem.pro && (
                          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase text-amber-300">
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-amber-500/20 bg-[#070812] px-5 text-slate-100 shadow-[0_0_35px_rgba(245,158,11,0.08)] transition-all duration-300 ease-in-out lg:mt-0 ${
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
          ? "w-[290px]"
          : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex py-8 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex items-center gap-3">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-[0.22em] text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]">
                LUNARIA
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.32em] text-slate-400">
                RolePlay Guild
              </span>
            </div>
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/50 bg-amber-500/10 text-lg font-black text-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.18)]">
              L
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            <div>
              <h2
                className={`mb-4 flex text-xs uppercase leading-[20px] tracking-[0.24em] text-amber-500/70 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Guild System"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>

              {renderMenuItems(navItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-4 flex text-xs uppercase leading-[20px] tracking-[0.24em] text-amber-500/70 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Archives"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>

              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>

        {isExpanded || isHovered || isMobileOpen ? (
          <div className="mb-8 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-white/[0.03] to-violet-500/10 p-4 shadow-[0_0_28px_rgba(245,158,11,0.08)]">
            <div className="mb-2 text-xs uppercase tracking-[0.24em] text-amber-300">
              Guild Notice
            </div>
            <p className="text-xs leading-5 text-slate-400">
              Welcome to the Lunaria Guild System. Adventurer records,
              cosmetics, leaderboard, and guild games will be managed here.
            </p>
          </div>
        ) : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
