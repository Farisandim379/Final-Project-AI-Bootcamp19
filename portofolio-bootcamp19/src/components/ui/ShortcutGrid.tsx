import { SHORTCUTS } from "../content/site.ts";
import { ShortcutCard } from "./ShortcutCard.tsx";

/**
 * Grid kartu keahlian. Heading sengaja dirender oleh section `#tentang`
 * (lihat App.tsx) agar anchor `#tentang` dan `#skill` punya pita scroll
 * masing-masing dan tidak saling menimpa.
 */
export function ShortcutGrid() {
  return (
    <ul className="shortcut-grid" aria-label="Keahlian dan karya">
      {SHORTCUTS.map((shortcut) => (
        <ShortcutCard key={shortcut.title} shortcut={shortcut} />
      ))}
    </ul>
  );
}
