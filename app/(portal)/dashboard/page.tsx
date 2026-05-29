import { Badge, Card, CardBody, CardHeader, CardTitle, PageHeader } from "../_components/ui";

const STATS = [
  {
    label: "Total Students",
    value: "1,284",
    delta: "+2.4%",
    tone: "success" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M3 19c.7-3.2 3.2-5 6-5s5.3 1.8 6 5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    label: "Total Teachers",
    value: "96",
    delta: "+0.8%",
    tone: "success" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M4 19h16M6 19V9l6-4 6 4v10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
    {
    label: "Active Cards",
    value: "1,151",
    delta: "+5.1%",
    tone: "info" as const,
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
  },
  {
    label: "Pending Issuance",
    value: "27",
    delta: "-12.3%",
    tone: "warning" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 8v4l3 2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const ACTIVITY = [
  {
    actor: "Admissions Office",
    action: "issued 24 student cards",
    program: "Grade 9 intake",
    when: "2 minutes ago",
    tone: "success" as const,
  },
  {
    actor: "Admin",
    action: "revoked card BB24-0881",
    program: "Lost card report",
    when: "1 hour ago",
    tone: "danger" as const,
  },
  {
    actor: "HR Department",
    action: "added 3 new teachers",
    program: "Mathematics department",
    when: "Today, 09:42",
    tone: "info" as const,
  },
  {
    actor: "Admissions Office",
    action: "renewed 87 cards",
    program: "Academic year 2026",
    when: "Yesterday",
    tone: "neutral" as const,
  },
];

const SECTIONS = [
  { name: "Primary School (G1–G5)", students: 412, color: "bg-[var(--primary)]" },
  { name: "Middle School (G6–G8)", students: 318, color: "bg-sky-700" },
  { name: "High School (G9–G12)", students: 408, color: "bg-emerald-700" },
  { name: "International Programme", students: 96, color: "bg-amber-700" },
  { name: "Early Years", students: 50, color: "bg-rose-700" },
];

export default function DashboardPage() {
  const totalStudents = SECTIONS.reduce((s, f) => s + f.students, 0);

  return (
    <>
      <PageHeader
        title="Welcome back, Admin"
        description="Here is a snapshot of activity across Brain Bridge School."
      />

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  {s.value}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-50 text-[var(--primary)] flex items-center justify-center ring-1 ring-[var(--border)]">
                {s.icon}
              </div>
            </div>
            <div className="mt-4">
              <Badge tone={s.tone}>{s.delta} vs last month</Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Two-column section */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Students by Section</CardTitle>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Distribution across school sections
              </p>
            </div>
            <span className="text-xs text-[var(--muted)]">
              Total {totalStudents.toLocaleString()}
            </span>
          </CardHeader>
          <CardBody className="space-y-4">
            {SECTIONS.map((f) => {
              const pct = Math.round((f.students / totalStudents) * 100);
              return (
                <div key={f.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium">{f.name}</span>
                    <span className="text-[var(--muted)]">
                      {f.students.toLocaleString()} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`${f.color} h-full rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <a
              href="#"
              className="text-xs font-medium text-[var(--primary)] hover:underline"
            >
              View all
            </a>
          </CardHeader>
          <CardBody className="space-y-4">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className={[
                    "mt-1.5 h-2 w-2 rounded-full",
                    a.tone === "success"
                      ? "bg-emerald-500"
                      : a.tone === "danger"
                        ? "bg-red-500"
                        : a.tone === "info"
                          ? "bg-sky-500"
                          : "bg-slate-400",
                  ].join(" ")}
                />
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{a.actor}</span>{" "}
                    <span className="text-[var(--muted)]">{a.action}</span>
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {a.program} · {a.when}
                  </p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
