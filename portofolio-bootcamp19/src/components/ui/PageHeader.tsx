import type { ReactNode } from "react";

interface PageHeaderProps {
  id?: string;
  /** Kata/frasa yang diwarnai indigo. */
  accent: string;
  lead?: ReactNode;
  /**
   * Level heading. Default `h2` karena hero sudah memegang `h1`
   * pada aplikasi satu halaman.
   */
  as?: "h1" | "h2";
  children: ReactNode;
}

export function PageHeader({ id, accent, lead, as: Tag = "h2", children }: PageHeaderProps) {
  return (
    <div className="page-header">
      <Tag className="page-header__title" id={id}>
        {children} <span className="page-header__accent">{accent}</span>
      </Tag>
      {lead && <p className="page-header__lead">{lead}</p>}
    </div>
  );
}
