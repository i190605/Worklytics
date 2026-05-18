import { memo } from 'react'

function KpiGridBase({ metrics }) {
  return (
    <section className="metrics-grid">
      {metrics.map((item) => (
        <article key={item.label} className="metric-card">
          <h2>{item.label}</h2>
          <strong>{item.value}</strong>
        </article>
      ))}
    </section>
  )
}

export const KpiGrid = memo(KpiGridBase)
