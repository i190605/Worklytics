import { memo } from 'react'

function DepartmentTableBase({ departments, role }) {
  return (
    <section className="panel">
      <h2>{role === 'manager' ? 'My Team Breakdown' : 'Team Breakdown'}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>Total</th>
              <th>Local</th>
              <th>Global</th>
              <th>Localization Rate</th>
              <th>Open Roles</th>
              <th>Recommended Local Hires</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.name}>
                <td>{dept.name}</td>
                <td>{dept.totalEmployees}</td>
                <td>{dept.localEmployees}</td>
                <td>{dept.externalEmployees}</td>
                <td>{dept.rate.toFixed(1)}%</td>
                <td>{dept.vacancies}</td>
                <td>{dept.recommendedLocalHires}</td>
                <td>
                  <span className={dept.isCompliant ? 'badge success' : 'badge danger'}>
                    {dept.isCompliant ? 'On Target' : 'At Risk'}
                  </span>
                </td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-row">
                  No teams match your current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export const DepartmentTable = memo(DepartmentTableBase)
