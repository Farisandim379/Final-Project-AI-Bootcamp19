import type { ReactNode } from "react";
import { IconAlert, IconCheck } from "../icons/index.ts";

type NoticeTone = "info" | "error" | "success";

const ICONS = {
  info: undefined,
  error: IconAlert,
  success: IconCheck,
} as const;

interface NoticeProps {
  tone?: NoticeTone;
  role?: "status" | "alert";
  children: ReactNode;
}

export function Notice({ tone = "info", role, children }: NoticeProps) {
  const Icon = ICONS[tone];
  const classes = ["notice", tone !== "info" ? `notice--${tone}` : undefined]
    .filter(Boolean)
    .join(" ");

  return (
    <p className={classes} role={role}>
      {Icon && <Icon width={16} height={16} />}
      <span>{children}</span>
    </p>
  );
}
