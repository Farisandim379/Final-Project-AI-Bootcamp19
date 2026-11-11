import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  /** Titik indikator di kiri label. */
  dot?: boolean;
}

export function Badge({ children, dot = true }: BadgeProps) {
  return (
    <p className="badge">
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </p>
  );
}
