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

type Status = "Active" | "Expired" | "Revoked" | "Pending";

const CARDS: {
  id: string;
  name: string;
  type: "Student" | "Teacher" | "Staff";
  section: string;
  issued: string;
  expires: string;
  status: Status;
}[] = [
  {
    id: "BB25-0001",
    name: "Amelia Hartwell",
    type: "Student",
    section: "High School · Grade 10",
    issued: "2025-09-12",
    expires: "2026-09-12",
    status: "Active",
  },
  {
    id: "BB25-0002",
    name: "Noah Bennett",
    type: "Student",
    section: "Middle School · Grade 7",
    issued: "2025-09-14",
    expires: "2026-09-14",
    status: "Active",
  },
  {
    id: "BB25-T021",
    name: "Ms. Priya Raman",
    type: "Teacher",
    section: "Sciences",
    issued: "2025-08-02",
    expires: "2026-08-02",
    status: "Active",
  },
  {
    id: "BB24-0881",
    name: "Liam Okafor",
    type: "Student",
    section: "Primary School · Grade 5",
    issued: "2024-09-15",
    expires: "2025-09-15",
    status: "Revoked",
  },
  {
    id: "BB25-0003",
    name: "Sofia Martínez",
    type: "Student",
    section: "High School · Grade 11",
    issued: "2025-09-01",
    expires: "2026-09-01",
    status: "Pending",
  },
  {
    id: "BB24-T088",
    name: "Mr. Kenji Watanabe",
    type: "Teacher",
    section: "Mathematics",
    issued: "2024-08-20",
    expires: "2025-08-20",
    status: "Expired",
  },
  {
    id: "BB25-0004",
    name: "Hannah Lindqvist",
    type: "Student",
    section: "Middle School · Grade 8",
    issued: "2025-09-18",
    expires: "2026-09-18",
    status: "Active",
  },
];

const toneFor: Record<Status, "success" | "warning" | "danger" | "info"> = {
  Active: "success",
  Pending: "info",
  Expired: "warning",
  Revoked: "danger",
};

export default function CardListPage() {
  return (
    <>
      <PageHeader
        title="Card List"
        description="All ID cards issued to students, teachers and staff."
        actions={
          <>
            <Button variant="secondary">Export CSV</Button>
            <Button>+ Issue Card</Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex-wrap">
          <CardTitle>All Cards</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Search by ID or name…"
                className="w-64 pl-9"
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
            <Select defaultValue="" className="w-40">
              <option value="">All Types</option>
              <option>Student</option>
              <option>Teacher</option>
              <option>Staff</option>
            </Select>
            <Select defaultValue="" className="w-40">
              <option value="">All Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Expired</option>
              <option>Revoked</option>
            </Select>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-[var(--muted)] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="text-left font-semibold px-6 py-3">Card ID</th>
                <th className="text-left font-semibold px-6 py-3">Holder</th>
                <th className="text-left font-semibold px-6 py-3">Type</th>
                <th className="text-left font-semibold px-6 py-3">Section</th>
                <th className="text-left font-semibold px-6 py-3">Issued</th>
                <th className="text-left font-semibold px-6 py-3">Expires</th>
                <th className="text-left font-semibold px-6 py-3">Status</th>
                <th className="text-right font-semibold px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {CARDS.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-3 font-mono text-xs">{c.id}</td>
                  <td className="px-6 py-3 font-medium">{c.name}</td>
                  <td className="px-6 py-3 text-[var(--muted)]">{c.type}</td>
                  <td className="px-6 py-3 text-[var(--muted)]">{c.section}</td>
                  <td className="px-6 py-3 text-[var(--muted)]">{c.issued}</td>
                  <td className="px-6 py-3 text-[var(--muted)]">{c.expires}</td>
                  <td className="px-6 py-3">
                    <Badge tone={toneFor[c.status]}>{c.status}</Badge>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        className="px-2 py-1 text-xs rounded-md hover:bg-slate-100 text-[var(--primary)] font-medium"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 text-xs rounded-md hover:bg-slate-100 text-[var(--foreground)]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 text-xs rounded-md hover:bg-red-50 text-red-600"
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CardBody className="flex items-center justify-between text-xs text-[var(--muted)]">
          <span>Showing 1 – {CARDS.length} of {CARDS.length} cards</span>
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
