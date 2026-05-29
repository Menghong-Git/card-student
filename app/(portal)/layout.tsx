import Sidebar from "./_components/Sidebar";
import Topbar from "./_components/Topbar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Topbar />
        <main className="flex-1 px-6 lg:px-10 py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
        <footer className="px-6 lg:px-10 py-6 text-xs text-[var(--muted)] border-t border-[var(--border)] bg-white">
          © {new Date().getFullYear()} Brain Bridge School · Discipline ·
          Morality · Leadership
        </footer>
      </div>
    </div>
  );
}
