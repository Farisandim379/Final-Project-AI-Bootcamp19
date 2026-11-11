import type { ReactNode } from "react";

/** Format tanggal dari SQLite `datetime('now')` (UTC, "YYYY-MM-DD HH:MM:SS"). */
export function formatDateTime(value: string): string {
  // SQLite tidak menyertakan zona waktu; tambahkan "Z" agar dibaca sebagai UTC.
  const iso = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

interface NoticeProps {
  tone?: "info" | "error" | "success";
  role?: "status" | "alert";
  children: ReactNode;
}

export function AdminNotice({ tone = "info", role = "status", children }: NoticeProps) {
  const modifier = tone === "info" ? "" : ` admin-notice--${tone}`;

  return (
    <p className={`admin-notice${modifier}`} role={role}>
      {children}
    </p>
  );
}

export function AdminEmpty({ children }: { children: ReactNode }) {
  return <p className="admin-empty">{children}</p>;
}