import { memo } from 'react'

function ComplianceInsightsBase({ atRiskDepartments, targetRate }) {
  return (
    <section className="panel notes">
      <h2>Workforce Insights</h2>
      {atRiskDepartments.length > 0 ? (
        <ul>
          {atRiskDepartments.map((dept) => (
            <li key={dept.name}>
              <strong>{dept.name}</strong> is below target by {(targetRate - dept.rate).toFixed(1)}%. Recommended immediate
              local hires: <strong>{dept.recommendedLocalHires}</strong>.
            </li>
          ))}
        </ul>
      ) : (
        <p>All filtered teams are currently meeting the selected localization target.</p>
      )}
    </section>
  )
}

export const ComplianceInsights = memo(ComplianceInsightsBase)
