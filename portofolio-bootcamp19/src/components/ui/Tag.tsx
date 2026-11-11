import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return <li className="tag">{children}</li>;
}
