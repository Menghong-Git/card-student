import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Input,
  PageHeader,
  Select,
} from "../../_components/ui";

const TEACHERS = [
  {
    id: "FAC-0421",
    name: "Ms. Priya Raman",
    email: "p.raman@brainbridge.edu",
    title: "Subject Lead",
    department: "Sciences",
    classes: 4,
    status: "Active",
  },
  {
    id: "FAC-0388",
    name: "Mr. Kenji Watanabe",
    email: "k.watanabe@brainbridge.edu",
    title: "Senior Teacher",
    department: "Mathematics",
    classes: 5,
    status: "Active",
  },
  {
    id: "FAC-0512",
    name: "Ms. Elena Costa",
    email: "e.costa@brainbridge.edu",
    title: "Homeroom Teacher",
    department: "Primary School",
    classes: 6,
    status: "Active",
  },
  {
    id: "FAC-0233",
    name: "Mr. Marcus Hale",
    email: "m.hale@brainbridge.edu",
    title: "Head of Department",
    department: "Languages & Humanities",
    classes: 3,
    status: "On Leave",
  },
  {
    id: "FAC-0617",
    name: "Ms. Aisha Rahman",
    email: "a.rahman@brainbridge.edu",
    title: "Teacher",
    department: "Arts & Music",
    classes: 5,
    status: "Active",
  },
];

function initials(name: string) {
  return name
    .replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Prof\.)\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function TeachersPage() {
  return (
    <>
      <PageHeader
        title="Teachers"
        description="Teachers and instructional staff across all departments."
        actions={
          <>
            <Button variant="secondary">Import</Button>
            <Button>+ Add Teacher</Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex-wrap">
          <CardTitle>All Teachers</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Input placeholder="Search teachers…" className="w-64 pl-9" />
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
            <Select defaultValue="" className="w-48">
              <option value="">All Departments</option>
              <option>Primary School</option>
              <option>Mathematics</option>
              <option>Sciences</option>
              <option>Languages &amp; Humanities</option>
              <option>Arts &amp; Music</option>
              <option>Physical Education</option>
            </Select>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-[var(--muted)] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="text-left font-semibold px-6 py-3">Teacher</th>
                <th className="text-left font-semibold px-6 py-3">ID</th>
                <th className="text-left font-semibold px-6 py-3">Title</th>
                <th className="text-left font-semibold px-6 py-3">Department</th>
                <th className="text-left font-semibold px-6 py-3">Classes</th>
                <th className="text-left font-semibold px-6 py-3">Status</th>
                <th className="text-right font-semibold px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {TEACHERS.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#1b3f7d] text-white flex items-center justify-center text-xs font-semibold">
                        {initials(t.name)}
                      </div>
                      <div>
                        <div className="font-medium leading-tight">
                          {t.name}
                        </div>
                        <div className="text-[11px] text-[var(--muted)]">
                          {t.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-[var(--muted)]">
                    {t.id}
                  </td>
                  <td className="px-6 py-3">{t.title}</td>
                  <td className="px-6 py-3 text-[var(--muted)]">{t.department}</td>
                  <td className="px-6 py-3 text-[var(--muted)]">{t.classes}</td>
                  <td className="px-6 py-3">
                    <Badge tone={t.status === "Active" ? "success" : "info"}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button className="px-2 py-1 text-xs rounded-md hover:bg-slate-100 text-[var(--primary)] font-medium">
                        View
                      </button>
                      <button className="px-2 py-1 text-xs rounded-md hover:bg-slate-100">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CardBody className="flex items-center justify-between text-xs text-[var(--muted)]">
          <span>Showing 1 – {TEACHERS.length} of {TEACHERS.length}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" disabled>
              Previous
            </Button>
            <Button variant="secondary" size="sm">
              1
            </Button>
            <Button variant="ghost" size="sm">
              Next
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
