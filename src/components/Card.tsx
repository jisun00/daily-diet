import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 ${className}`}
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {title && <h3 className="mb-3 text-base font-semibold">{title}</h3>}
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  unit,
  accent,
  compact,
}: {
  label: string;
  value: string | number;
  unit?: string;
  accent?: string;
  /** Smaller text so 4-5 stats can sit on one row on a narrow phone screen. */
  compact?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span
        className={`truncate ${compact ? "text-[10px]" : "text-xs"}`}
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <span
        className={`truncate font-bold ${compact ? "text-sm" : "text-xl"}`}
        style={{ color: accent ?? "var(--text)" }}
      >
        {value}
        {unit && (
          <span
            className={`ml-0.5 font-normal ${compact ? "text-[10px]" : "text-sm"}`}
            style={{ color: "var(--text-muted)" }}
          >
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]";
export const inputStyle = { background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" };

/**
 * Number input that keeps its own text buffer so the field can be fully
 * cleared (no lingering "0" that new digits get prepended to) and decimals
 * can be typed freely. step is always "any" so partial values like 0.63
 * never trip native step-mismatch validation.
 */
export function NumberField({
  value,
  onChange,
  className = inputClass,
  style = inputStyle,
  ...rest
}: {
  value: number;
  onChange: (n: number) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "step">) {
  const [text, setText] = useState(String(value));
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      setText(String(value));
      lastEmitted.current = value;
    }
  }, [value]);

  return (
    <input
      type="number"
      inputMode="decimal"
      step="any"
      className={className}
      style={style}
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        const n = raw === "" || raw === "-" ? 0 : Number(raw);
        if (!Number.isNaN(n)) {
          lastEmitted.current = n;
          onChange(n);
        }
      }}
      {...rest}
    />
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  const styles: Record<string, string> = {
    primary: "text-white",
    secondary: "",
    danger: "text-white",
  };
  const bg =
    variant === "primary"
      ? "var(--accent)"
      : variant === "danger"
        ? "var(--warn)"
        : "var(--bg)";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-40 ${styles[variant]} ${className}`}
      style={{
        background: bg,
        border: variant === "secondary" ? "1px solid var(--border)" : "none",
        color: variant === "secondary" ? "var(--text)" : undefined,
      }}
    >
      {children}
    </button>
  );
}
