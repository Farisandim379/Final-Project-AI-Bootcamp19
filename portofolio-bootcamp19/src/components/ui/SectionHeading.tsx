import type { ReactNode } from "react";

interface SectionHeadingProps {
  id?: string;
  /** Kata/frasa yang diwarnai indigo, dirender setelah `children`. */
  accent?: string;
  lead?: ReactNode;
  /** Heading level default 2. */
  as?: "h2" | "h3";
}

export function SectionHeading({
  id,
  accent,
  lead,
  as: Tag = "h2",
  children,
}: SectionHeadingProps & { children: ReactNode }) {
  return (
    <div className="section-heading">
      <Tag className="section-title" id={id}>
        {children}
        {accent && (
          <>
            {" "}
            <span className="section-title__accent">{accent}</span>
          </>
        )}
      </Tag>
      {lead && <p className="section-lead">{lead}</p>}
    </div>
  );
}
