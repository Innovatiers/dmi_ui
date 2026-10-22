import type { ReactNode } from 'react';

export interface KpiCardProps {
  readonly label: string;
  readonly value: ReactNode;
  readonly detail?: ReactNode;
}

/** One key figure: a term/description pair, to be placed inside a `KpiGrid`. */
export function KpiCard({ label, value, detail }: KpiCardProps) {
  return (
    <div className="cw-kpi">
      <dt className="cw-kpi__label">{label}</dt>
      <dd className="cw-kpi__value">{value}</dd>
      {detail !== undefined && <dd className="cw-kpi__detail">{detail}</dd>}
    </div>
  );
}

export interface KpiGridProps {
  readonly children: ReactNode;
}

/** A grid of key figures (a description list, so each label stays bound to its value); place it under a heading. */
export function KpiGrid({ children }: KpiGridProps) {
  return <dl className="cw-kpi-grid">{children}</dl>;
}
