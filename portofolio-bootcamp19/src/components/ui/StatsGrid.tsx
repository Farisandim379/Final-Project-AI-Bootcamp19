import { STATS } from "../content/site.ts";
import { StatCard } from "./StatCard.tsx";

export function StatsGrid() {
  return (
    <ul className="stats-grid" aria-label="Pencapaian singkat">
      {STATS.map((stat) => (
        <StatCard key={stat.value} stat={stat} />
      ))}
    </ul>
  );
}
