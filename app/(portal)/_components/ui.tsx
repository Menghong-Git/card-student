import * as React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        "bg-white border border-[var(--border)] rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        "px-6 py-4 border-b border-[var(--border)] flex items-center justify-between gap-3",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cx("text-sm font-semibold text-[var(--foreground)]", className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: DivProps) {
  return <div className={cx("p-6", className)} {...props} />;
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
  } as const;
  const variants = {
    primary:
      "bg-[var(--primary)] text-white hover:bg-[#0a1f44] active:bg-[#081935]",
    secondary:
      "bg-white text-[var(--primary)] border border-[var(--border)] hover:bg-slate-50",
    ghost: "text-[var(--foreground)] hover:bg-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  } as const;
  return (
    <button
      className={cx(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-[11px] text-[var(--muted)]">{hint}</span>}
    </label>
  );
}

const inputBase =
  "w-full h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)]";

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  const { className, ...rest } = props;
  return <input className={cx(inputBase, className)} {...rest} />;
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  const { className, ...rest } = props;
  return (
    <div className="relative">
      <select
        className={cx(inputBase, "appearance-none bg-white pr-9", className)}
        {...rest}
      />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
      >
        <path
          d="m6 9 6 6 6-6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const { className, ...rest } = props;
  return (
    <textarea
      className={cx(inputBase, "h-auto min-h-[96px] py-2", className)}
      {...rest}
    />
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    warning: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
    danger: "bg-red-50 text-red-700 ring-1 ring-red-200",
    info: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
