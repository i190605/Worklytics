import { memo, useMemo } from 'react'

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function HRPayrollModulesBase({ departments, totals, targetRate }) {
  const payrollSummary = useMemo(() => {
    const grossPayroll = totals?.payroll ?? 0
    const allowances = Math.round(grossPayroll * 0.12)
    const deductions = Math.round(grossPayroll * 0.05)
    const netPayroll = grossPayroll + allowances - deductions

    return {
      grossPayroll,
      allowances,
      deductions,
      netPayroll,
      nextPayrollDate: '30 Apr 2026',
    }
  }, [totals])

  const hrOperations = useMemo(() => {
    const openRoles = departments.reduce((sum, dept) => sum + Number(dept.vacancies || 0), 0)
    const atRiskCount = departments.filter((dept) => !dept.isCompliant).length
    const avgAttendance = Math.max(88, 98 - atRiskCount)
    const leaveRequests = Math.max(4, Math.round(openRoles * 1.4))

    return {
      openRoles,
      avgAttendance,
      leaveRequests,
      pendingApprovals: atRiskCount + Math.ceil(openRoles / 2),
    }
  }, [departments])

  const hiringQueue = useMemo(
    () => departments.filter((dept) => dept.vacancies > 0).sort((a, b) => b.vacancies - a.vacancies).slice(0, 5),
    [departments],
  )

  return (
    <section className="hr-system-grid">
      <article className="panel hr-module">
        <h2>Payroll Run Center</h2>
        <div className="module-stats">
          <p>
            <span>Next Payroll Date</span>
            <strong>{payrollSummary.nextPayrollDate}</strong>
          </p>
          <p>
            <span>Gross Payroll</span>
            <strong>{formatCurrency(payrollSummary.grossPayroll)}</strong>
          </p>
          <p>
            <span>Allowances</span>
            <strong>{formatCurrency(payrollSummary.allowances)}</strong>
          </p>
          <p>
            <span>Deductions</span>
            <strong>{formatCurrency(payrollSummary.deductions)}</strong>
          </p>
          <p>
            <span>Net Payroll (Projected)</span>
            <strong>{formatCurrency(payrollSummary.netPayroll)}</strong>
          </p>
        </div>
      </article>

      <article className="panel hr-module">
        <h2>HR Operations Snapshot</h2>
        <div className="module-stats compact">
          <p>
            <span>Average Attendance</span>
            <strong>{hrOperations.avgAttendance}%</strong>
          </p>
          <p>
            <span>Open Requisitions</span>
            <strong>{hrOperations.openRoles}</strong>
          </p>
          <p>
            <span>Leave Requests (Pending)</span>
            <strong>{hrOperations.leaveRequests}</strong>
          </p>
          <p>
            <span>Approvals Queue</span>
            <strong>{hrOperations.pendingApprovals}</strong>
          </p>
          <p>
            <span>Localization Target</span>
            <strong>{targetRate}%</strong>
          </p>
        </div>
      </article>

      <article className="panel hr-module full-width">
        <h2>Recruitment & Workforce Planning Queue</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Open Roles</th>
                <th>Current Localization</th>
                <th>Recommended Local Hires</th>
              </tr>
            </thead>
            <tbody>
              {hiringQueue.map((dept) => (
                <tr key={dept.name}>
                  <td>{dept.name}</td>
                  <td>{dept.vacancies}</td>
                  <td>{dept.rate.toFixed(1)}%</td>
                  <td>{dept.recommendedLocalHires}</td>
                </tr>
              ))}
              {hiringQueue.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-row">
                    No active hiring requests in the current view.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}

export const HRPayrollModules = memo(HRPayrollModulesBase)
