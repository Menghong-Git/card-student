import Image from "next/image";
import Link from "next/link";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M3.5 11.5 12 4l8.5 7.5M5.5 10.2V20h13v-9.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3.5 10h17M7.5 15h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex min-h-72 flex-col justify-between bg-[var(--primary)] p-8 text-white sm:p-10">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-white/20">
                  <Image
                    src="/brain-bridge-logo.png"
                    alt="Brain Bridge School"
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">Brain Bridge</p>
                  <p className="text-xs text-white/70">School Portal</p>
                </div>
              </div>

              <div className="mt-16">
                <p className="text-8xl font-semibold leading-none text-white/15 sm:text-9xl">
                  404
                </p>
                <div className="mt-6 h-1 w-16 rounded-full bg-[var(--accent)]" />
              </div>
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
              <p className="text-sm font-medium text-[var(--accent)]">
                Page not found
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
                This portal page could not be found.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                The page may have moved, or the address may be incorrect. You
                can return to the dashboard or continue managing issued ID
                cards from the card list.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-white transition-colors hover:bg-[#0a1f44] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                >
                  <HomeIcon />
                  Return to dashboard
                </Link>
                <Link
                  href="/card/list"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                >
                  <CardIcon />
                  View card list
                </Link>
              </div>

              <div className="mt-10 border-t border-[var(--border)] pt-5 text-xs text-[var(--muted)]">
                Error 404: unmatched route
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
