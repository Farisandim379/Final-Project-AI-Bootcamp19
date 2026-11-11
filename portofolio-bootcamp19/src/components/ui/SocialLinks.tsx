import type { SocialLink } from "../content/site.ts";
import { IconGithub, IconLinkedin, IconX } from "../icons/index.ts";

const ICONS = {
  linkedin: IconLinkedin,
  github: IconGithub,
  x: IconX,
} as const;

interface SocialLinksProps {
  links: readonly SocialLink[];
  /** `inline` = baris mendatar tanpa garis pemisah (dipakai di hero). */
  variant?: "stacked" | "inline";
}

export function SocialLinks({ links, variant = "stacked" }: SocialLinksProps) {
  return (
    <ul className={`social-links${variant === "inline" ? " social-links--inline" : ""}`}>
      {links.map((link) => {
        const Icon = ICONS[link.icon];
        return (
          <li key={link.label}>
            <a className="social-links__link" href={link.href} target="_blank" rel="noopener noreferrer">
              <Icon width={18} height={18} />
              <span>{link.label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
