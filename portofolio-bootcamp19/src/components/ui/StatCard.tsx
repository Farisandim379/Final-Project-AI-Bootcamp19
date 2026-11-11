import type { Stat } from "../content/site.ts";

export function StatCard({ stat }: { stat: Stat }) {
  const [amount, ...rest] = stat.value.split(" ");
  const suffix = rest.join(" ");

  return (
    <li className="stat-card">
      <p className="stat-card__value">
        {amount}
        {suffix && <span className="stat-card__suffix"> {suffix}</span>}
      </p>
      <p className="stat-card__label">{stat.label}</p>
    </li>
  );
}
