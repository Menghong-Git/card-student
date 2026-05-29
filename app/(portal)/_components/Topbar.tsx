"use client";

import { usePathname } from "next/navigation";

const TITLES: Record<string, { title: string; sub: string }> = {
  "/dashboard": {
    title: "Dashboard",
    sub: "Overview of cards, users and recent activity",
  },
  "/card/create": {
    title: "Create Card",
    sub: "Issue a new ID card for a student or teacher",
  },
  "/card/list": {
    title: "Card List",
    sub: "Browse and manage issued ID cards",
  },
  "/user/student": {
    title: "Students",
    sub: "All enrolled students across school sections",
  },
  "/user/teacher": {
    title: "Teachers",
    sub: "Teachers and instructional staff directory",
  },
  "/profile": {
    title: "Admin Profile",
    sub: "Manage your account and preferences",
  },
};

function deriveTitle(path: string) {
  if (TITLES[path]) return TITLES[path];
  const match = Object.keys(TITLES).find(
    (k) => path === k || path.startsWith(k + "/"),
  );
  return match
    ? TITLES[match]
    : { title: "Portal", sub: "Brain Bridge School" };
}

export default function Topbar() {
  const pathname = usePathname() || "/";
  const { title, sub } = deriveTitle(pathname);

  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-[var(--border)]">
      <div className="px-6 lg:px-10 h-16 flex items-center gap-4">
        <div className="hidden lg:block min-w-0">
          <h1 className="text-base font-semibold text-[var(--foreground)] truncate">
            {title}
          </h1>
          <p className="text-xs text-[var(--muted)] truncate">{sub}</p>
        </div>
        <div className="lg:hidden pl-10">
          <h1 className="text-sm font-semibold text-[var(--foreground)]">
            {title}
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden md:block">
            <input
              type="search"
              placeholder="Search students, teachers, cards…"
              className="w-72 h-9 rounded-md border border-[var(--border)] bg-white pl-9 pr-3 text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)]"
            />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted)]"
            >
              <circle
                cx="11"
                cy="11"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="m20 20-3.2-3.2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <button
            type="button"
            aria-label="Notifications"
            className="relative h-9 w-9 rounded-md border border-[var(--border)] bg-white hover:bg-slate-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 mx-auto text-slate-600"
            >
              <path
                d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M10 18a2 2 0 0 0 4 0"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--accent)]" />
          </button>

          <div className="hidden sm:flex items-center gap-2 h-9 pl-2 pr-3 rounded-md border border-[var(--border)] bg-white">
            <div className="h-7 w-7 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-semibold">
              SA
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs font-medium">System Admin</div>
              <div className="text-[10px] text-[var(--muted)]">Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
