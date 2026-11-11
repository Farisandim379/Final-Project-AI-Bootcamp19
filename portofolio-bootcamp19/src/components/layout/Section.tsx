import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  labelledBy?: string;
  /** `ink` untuk blok gelap, default terang. */
  tone?: "default" | "ink";
  className?: string;
  children: ReactNode;
}

export function Section({ id, labelledBy, tone = "default", className, children }: SectionProps) {
  const classes = ["section", tone === "ink" ? "section--ink" : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} id={id} aria-labelledby={labelledBy}>
      <div className="container">{children}</div>
    </section>
  );
}
