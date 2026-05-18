import { memo, useMemo, useState } from 'react'

function SmartInsightsAssistantBase({ modules }) {
  const [showWidget, setShowWidget] = useState(false)
  const [showPlan, setShowPlan] = useState(false)

  const insights = useMemo(() => {
    const attendanceRisks = (modules.attendance ?? [])
      .filter((row) => Number(row.attendanceRate) < 94)
      .map((row) => `${row.department}: attendance at ${row.attendanceRate}%`)

    const complianceRisks = (modules.compliance ?? [])
      .filter((row) => row.status !== 'Compliant')
      .map((row) => `${row.department}: ${row.localizationRate}% vs ${row.targetRate}% target`)

    const payrollRisks = (modules.payroll ?? [])
      .filter((row) => row.status !== 'Processed')
      .map((row) => `${row.department}: payroll status is ${row.status}`)

    const issues = [...attendanceRisks, ...complianceRisks, ...payrollRisks]
    const healthScore = Math.max(58, 100 - issues.length * 8)

    return {
      issues,
      healthScore,
      focusDepartment:
        (modules.compliance ?? []).find((item) => item.status !== 'Compliant')?.department || 'Operations',
    }
  }, [modules])

  return (
    <div className="copilot-widget">
      <button
        type="button"
        className="copilot-launcher"
        onClick={() => setShowWidget((prev) => !prev)}
        aria-expanded={showWidget}
        aria-label="Toggle Smart HR Copilot"
      >
        <span>🧠 Smart HR Copilot</span>
        <strong>{showWidget ? 'Close' : 'Open'}</strong>
      </button>

      {showWidget ? (
        <section className="copilot-popup" role="dialog" aria-label="Smart HR Copilot">
          <div className="copilot-popup-header">
            <div>
              <h3>Smart HR Copilot</h3>
              <p>AI-like risk radar for payroll, attendance, and compliance.</p>
            </div>
            <button type="button" className="copilot-close-btn" onClick={() => setShowWidget(false)}>
              ✕
            </button>
          </div>

          <div className="copilot-score-pill">
            <span>Workforce Health</span>
            <strong>{insights.healthScore}/100</strong>
          </div>

          <article className="copilot-card">
            <h4>Live Risk Signals</h4>
            {insights.issues.length > 0 ? (
              <ul className="risk-list">
                {insights.issues.slice(0, 4).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>No critical risks detected right now.</p>
            )}
          </article>

          <article className="copilot-card">
            <h4>One-Click Action Plan</h4>
            <p>
              Suggested focus area: <strong>{insights.focusDepartment}</strong>
            </p>
            <button type="button" className="export-btn action-btn" onClick={() => setShowPlan((prev) => !prev)}>
              {showPlan ? 'Hide 7-Day Plan' : 'Generate 7-Day Plan'}
            </button>
            {showPlan ? (
              <ol className="action-plan-list">
                <li>Run attendance audit for {insights.focusDepartment}.</li>
                <li>Assign recruiter for open critical roles.</li>
                <li>Approve pending payroll exceptions.</li>
                <li>Track localization recovery daily.</li>
              </ol>
            ) : null}
          </article>
        </section>
      ) : null}
    </div>
  )
}

export const SmartInsightsAssistant = memo(SmartInsightsAssistantBase)
