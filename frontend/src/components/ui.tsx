import { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  children,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
}) {
  const base = "px-4 py-2 rounded font-medium text-sm transition-colors disabled:opacity-50";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    secondary: "bg-surface text-ink border border-border hover:bg-border",
    danger: "bg-danger text-white hover:opacity-90",
  };
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white border border-border rounded p-4 shadow-sm">
      {children}
    </div>
  );
}

// Shown when an API call fails — never let a raw error swallow the screen silently
export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-danger/10 border border-danger/30 text-danger rounded p-3 flex items-center justify-between text-sm">
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="underline font-medium">
          Retry
        </button>
      )}
    </div>
  );
}

// Shown while data loads
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-6 w-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Shown when a list has no rows — an empty screen should invite action, not just say "nothing here"
export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="text-center py-10 text-ink/60">
      <p className="mb-3">{title}</p>
      {action}
    </div>
  );
}
