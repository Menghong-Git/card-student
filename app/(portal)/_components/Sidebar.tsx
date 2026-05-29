"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type LeafItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type GroupItem = {
  label: string;
  icon: React.ReactNode;
  basePath: string;
  children: { label: string; href: string }[];
};

type NavItem = LeafItem | GroupItem;

function isGroup(item: NavItem): item is GroupItem {
  return (item as GroupItem).children !== undefined;
}

const NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M3 12 12 4l9 8M5 10v10h14V10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Card",
    basePath: "/card",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M3 10h18M7 15h4" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
    children: [
      { label: "Create Card", href: "/card/create" },
      { label: "List Card", href: "/card/list" },
    ],
  },
  {
    label: "User",
    basePath: "/user",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M3 19c.7-3.2 3.2-5 6-5s5.3 1.8 6 5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle
          cx="17"
          cy="9"
          r="2.4"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M15.5 13.7c1.7.4 3.2 1.5 3.9 3.3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    children: [
      { label: "Student", href: "/user/student" },
      { label: "Teacher", href: "/user/teacher" },
    ],
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M4.5 20c1.1-3.6 4-5.5 7.5-5.5S18.4 16.4 19.5 20"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname() || "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  const initiallyOpen = useMemo(() => {
    const open: Record<string, boolean> = {};
    for (const item of NAV) {
      if (isGroup(item)) open[item.label] = pathname.startsWith(item.basePath);
    }
    return open;
  }, [pathname]);

  const [openGroups, setOpenGroups] =
    useState<Record<string, boolean>>(initiallyOpen);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const item of NAV) {
        if (isGroup(item) && pathname.startsWith(item.basePath)) {
          next[item.label] = true;
        }
      }
      return next;
    });
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleGroup = (label: string) =>
    setOpenGroups((s) => ({ ...s, [label]: !s[label] }));

  return (
    <>
      {/* Mobile open button */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 inline-flex items-center justify-center h-10 w-10 rounded-md bg-white shadow-sm border border-[var(--border)] text-[var(--primary)]"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          aria-hidden
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-out",
          "bg-[var(--primary)] text-white flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="px-6 py-5 flex items-center gap-3 border-b border-white/10">
          <div className="h-10 w-10 rounded-md bg-white/10 flex items-center justify-center ring-1 ring-white/20">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path
                d="M12 3 2 8l10 5 10-5-10-5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M6 10v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-wide">
              BRAIN BRIDGE
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]/90">
              School Portal
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto h-8 w-8 rounded-md hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 mx-auto">
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scroll-soft px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Main
          </p>
          <ul className="space-y-1">
            {NAV.map((item) => {
              if (!isGroup(item)) {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={[
                        "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-white text-[var(--primary)] shadow-sm"
                          : "text-white/85 hover:bg-white/10 hover:text-white",
                      ].join(" ")}
                    >
                      <span
                        className={active ? "text-[var(--primary)]" : "text-white/70"}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              }

              const groupActive = pathname.startsWith(item.basePath);
              const open = !!openGroups[item.label];
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                    aria-expanded={open}
                    className={[
                      "w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      groupActive
                        ? "text-white"
                        : "text-white/85 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    <span className="text-white/70">{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className={[
                        "h-4 w-4 transition-transform text-white/60",
                        open ? "rotate-90" : "",
                      ].join(" ")}
                    >
                      <path
                        d="M9 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div
                    className={[
                      "grid transition-[grid-template-rows] duration-200",
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    ].join(" ")}
                  >
                    <ul className="overflow-hidden pl-9 pr-2 mt-1 space-y-1">
                      {item.children.map((c) => {
                        const active =
                          pathname === c.href ||
                          pathname.startsWith(c.href + "/");
                        return (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              className={[
                                "block rounded-md px-3 py-2 text-sm transition-colors",
                                active
                                  ? "bg-white text-[var(--primary)] font-medium shadow-sm"
                                  : "text-white/75 hover:bg-white/10 hover:text-white",
                              ].join(" ")}
                            >
                              {c.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer card */}
        <div className="px-4 pb-5">
          <div className="rounded-lg bg-white/5 ring-1 ring-white/10 p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[var(--accent)] text-[#1b1300] flex items-center justify-center text-sm font-semibold">
              SA
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">System Admin</div>
              <div className="text-[11px] text-white/60 truncate">
                admin@brainbridge.edu
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
