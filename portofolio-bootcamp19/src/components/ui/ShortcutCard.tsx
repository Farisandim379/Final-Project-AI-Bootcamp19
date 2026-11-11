import type { Shortcut } from "../content/site.ts";
import { IconArrowRight, IconFolder, IconLayers, IconUser } from "../icons/index.ts";

const ICONS = {
  user: IconUser,
  layers: IconLayers,
  folder: IconFolder,
} as const;

export function ShortcutCard({ shortcut }: { shortcut: Shortcut }) {
  const Icon = ICONS[shortcut.icon];

  return (
    <li className="shortcut-card">
      <a className="shortcut-card__link" href={shortcut.href}>
        <span className="shortcut-card__icon" aria-hidden="true">
          <Icon width={24} height={24} />
        </span>
        <span className="shortcut-card__title">{shortcut.title}</span>
        <span className="shortcut-card__desc">{shortcut.description}</span>
        <IconArrowRight className="shortcut-card__arrow" width={18} height={18} />
      </a>
    </li>
  );
}
