import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Field,
  Input,
  PageHeader,
  Select,
} from "../_components/ui";

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Admin Profile"
        description="Account details, security and preferences for the portal administrator."
        actions={<Button>Save Changes</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardBody className="text-center">
            <div className="h-24 w-24 rounded-full bg-[var(--primary)] text-white text-2xl font-semibold flex items-center justify-center mx-auto ring-4 ring-white shadow">
              SA
            </div>
            <h3 className="mt-4 text-lg font-semibold">System Admin</h3>
            <p className="text-sm text-[var(--muted)]">
              admin@brainbridge.edu
            </p>
            <div className="mt-3 inline-flex items-center gap-2">
              <Badge tone="success">Active</Badge>
              <Badge tone="info">Super Admin</Badge>
            </div>

            <div className="mt-6 grid grid-cols-3 text-center divide-x divide-[var(--border)] border-t border-[var(--border)] pt-4">
              <div>
                <div className="text-sm font-semibold">2,341</div>
                <div className="text-[11px] text-[var(--muted)]">Cards issued</div>
              </div>
              <div>
                <div className="text-sm font-semibold">128</div>
                <div className="text-[11px] text-[var(--muted)]">This month</div>
              </div>
              <div>
                <div className="text-sm font-semibold">3y</div>
                <div className="text-[11px] text-[var(--muted)]">Tenure</div>
              </div>
            </div>

            <Button variant="secondary" className="mt-6 w-full">
              Change Photo
            </Button>
          </CardBody>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <Input defaultValue="System Admin" />
              </Field>
              <Field label="Display Name">
                <Input defaultValue="Admin" />
              </Field>
              <Field label="Email" required>
                <Input type="email" defaultValue="admin@brainbridge.edu" />
              </Field>
              <Field label="Phone">
                <Input defaultValue="+1 555 020 4488" />
              </Field>
              <Field label="Role">
                <Select defaultValue="Super Admin">
                  <option>Super Admin</option>
                  <option>Admissions Officer</option>
                  <option>HR Manager</option>
                </Select>
              </Field>
              <Field label="Language">
                <Select defaultValue="English (US)">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Français</option>
                  <option>Español</option>
                </Select>
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Current Password">
                <Input type="password" placeholder="••••••••" />
              </Field>
              <div />
              <Field label="New Password">
                <Input type="password" placeholder="At least 12 characters" />
              </Field>
              <Field label="Confirm New Password">
                <Input type="password" placeholder="Repeat new password" />
              </Field>
              <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-[var(--border)] p-4">
                <div>
                  <p className="text-sm font-medium">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Require a one-time code in addition to your password.
                  </p>
                </div>
                <Badge tone="success">Enabled</Badge>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {[
                {
                  k: "New cards issued",
                  d: "Get notified each time a card is printed.",
                  on: true,
                },
                {
                  k: "Card revoked / lost reports",
                  d: "Critical events that may require action.",
                  on: true,
                },
                {
                  k: "Weekly summary",
                  d: "A digest every Monday at 08:00.",
                  on: false,
                },
              ].map((n) => (
                <div
                  key={n.k}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4"
                >
                  <div>
                    <p className="text-sm font-medium">{n.k}</p>
                    <p className="text-xs text-[var(--muted)]">{n.d}</p>
                  </div>
                  <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
                    <input
                      type="checkbox"
                      defaultChecked={n.on}
                      className="peer sr-only"
                    />
                    <span className="absolute inset-0 rounded-full bg-slate-200 peer-checked:bg-[var(--primary)] transition-colors" />
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform peer-checked:translate-x-5" />
                  </label>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
