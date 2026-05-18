import { memo, useMemo, useState } from 'react'

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

function ModuleLayout({ title, description, loading, error, onRefresh, children }) {
  return (
    <section className="panel module-page">
      <div className="module-page-head">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <button type="button" onClick={onRefresh} className="refresh-btn" disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error ? <p className="auth-error">{error}</p> : null}
      {children}
    </section>
  )
}

function EmployeesScreenBase({ data, loading, error, onRefresh }) {
  return (
    <ModuleLayout
      title="Employees"
      description="Employee master records, role status and workforce profile."
      loading={loading}
      error={error}
      onRefresh={onRefresh}
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Position</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Salary</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.department}</td>
                <td>{row.position}</td>
                <td>{row.status}</td>
                <td>{formatDate(row.joinDate)}</td>
                <td>{formatCurrency(row.salary)}</td>
              </tr>
            ))}
            {data.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  No employee records found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </ModuleLayout>
  )
}

function PayrollScreenBase({ data, loading, error, onRefresh }) {
  return (
    <ModuleLayout
      title="Payroll"
      description="Monthly payroll processing status and financial breakdown by department."
      loading={loading}
      error={error}
      onRefresh={onRefresh}
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Department</th>
              <th>Gross</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={`${row.department}-${row.month}-${idx}`}>
                <td>{row.month}</td>
                <td>{row.department}</td>
                <td>{formatCurrency(row.gross)}</td>
                <td>{formatCurrency(row.allowances)}</td>
                <td>{formatCurrency(row.deductions)}</td>
                <td>{formatCurrency(row.net)}</td>
                <td>{row.status}</td>
              </tr>
            ))}
            {data.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  No payroll records found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </ModuleLayout>
  )
}

function AttendanceScreenBase({ data, loading, error, onRefresh }) {
  return (
    <ModuleLayout
      title="Attendance"
      description="Department-wise present, absent and late trends."
      loading={loading}
      error={error}
      onRefresh={onRefresh}
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late</th>
              <th>Attendance Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.department}>
                <td>{row.department}</td>
                <td>{row.present}</td>
                <td>{row.absent}</td>
                <td>{row.late}</td>
                <td>{row.attendanceRate}%</td>
              </tr>
            ))}
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-row">
                  No attendance records found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </ModuleLayout>
  )
}

function ComplianceScreenBase({ data, loading, error, onRefresh }) {
  return (
    <ModuleLayout
      title="Compliance"
      description="Saudization compliance status and risk indicators by department."
      loading={loading}
      error={error}
      onRefresh={onRefresh}
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Localization Rate</th>
              <th>Target</th>
              <th>Status</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.department}>
                <td>{row.department}</td>
                <td>{row.localizationRate}%</td>
                <td>{row.targetRate}%</td>
                <td>
                  <span className={`badge ${row.status === 'Compliant' ? 'success' : 'danger'}`}>
                    {row.status}
                  </span>
                </td>
                <td>{row.riskLevel}</td>
              </tr>
            ))}
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-row">
                  No compliance records found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </ModuleLayout>
  )
}

function ReportsScreenBase({ data, loading, error, onRefresh }) {
  return (
    <ModuleLayout
      title="Reports"
      description="Generated HR, payroll and compliance reports with availability status."
      loading={loading}
      error={error}
      onRefresh={onRefresh}
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Generated At</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.category}</td>
                <td>{formatDate(row.generatedAt)}</td>
                <td>{row.status}</td>
              </tr>
            ))}
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-row">
                  No reports found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </ModuleLayout>
  )
}

function ApprovalsScreenBase({ data, loading, error, onRefresh }) {
  const [localRows, setLocalRows] = useState([])

  const rows = useMemo(() => {
    if (localRows.length > 0) return localRows
    return data
  }, [data, localRows])

  const updateStatus = (id, status) => {
    const source = localRows.length > 0 ? localRows : data
    setLocalRows(source.map((item) => (item.id === id ? { ...item, status } : item)))
  }

  return (
    <ModuleLayout
      title="Approvals Workflow"
      description="Approve or reject leave and payroll exception requests (Odoo-style operational flow)."
      loading={loading}
      error={error}
      onRefresh={onRefresh}
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Employee</th>
              <th>Department</th>
              <th>Requested On</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Details</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isPending = row.status === 'Pending'
              return (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.type}</td>
                  <td>{row.employee}</td>
                  <td>{row.department}</td>
                  <td>{formatDate(row.requestedOn)}</td>
                  <td>{row.priority}</td>
                  <td>
                    <span
                      className={`badge ${
                        row.status === 'Approved' ? 'success' : row.status === 'Rejected' ? 'danger' : 'warning'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td>{row.details}</td>
                  <td>
                    <div className="approval-actions">
                      <button
                        type="button"
                        className="mini-btn approve"
                        disabled={!isPending}
                        onClick={() => updateStatus(row.id, 'Approved')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="mini-btn reject"
                        disabled={!isPending}
                        onClick={() => updateStatus(row.id, 'Rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-row">
                  No approval requests found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </ModuleLayout>
  )
}

export const EmployeesScreen = memo(EmployeesScreenBase)
export const PayrollScreen = memo(PayrollScreenBase)
export const AttendanceScreen = memo(AttendanceScreenBase)
export const ComplianceScreen = memo(ComplianceScreenBase)
export const ReportsScreen = memo(ReportsScreenBase)
export const ApprovalsScreen = memo(ApprovalsScreenBase)
