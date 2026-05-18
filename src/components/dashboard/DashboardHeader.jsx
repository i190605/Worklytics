import { memo } from 'react'
import logo from '../../assets/worklytics-logo.png'

const roleTitles = {
  admin: 'Worklytics Admin Workspace',
  hr: 'Worklytics HR Workspace',
  manager: 'Worklytics Team Workspace',
}

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'employees', label: 'Employees' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'reports', label: 'Reports' },
]

function DashboardHeaderBase({
  user,
  isMock,
  loading,
  error,
  lastUpdated,
  onRefresh,
  onLogout,
  activeScreen,
  onNavigate,
}) {
  const dashboardTitle = roleTitles[user?.role] || 'Dashboard'

  return (
    <header className="dashboard-header">
      <div className="top-navbar">
        <div className="brand-wrap">
          <img src={logo} alt="Worklytics logo" className="brand-logo" />
          <div>
            <strong>Worklytics HRMS</strong>
            <p>Unified HR & Payroll</p>
          </div>
        </div>

        <nav className="navbar-links" aria-label="Primary">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-link ${activeScreen === item.key ? 'active' : ''}`}
              aria-pressed={activeScreen === item.key}
              onClick={() => onNavigate(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button type="button" onClick={onLogout} className="logout-btn nav-logout-btn">
          Logout
        </button>
      </div>

      <div className="header-main">
        <div>
          <h1>{dashboardTitle}</h1>
          <p>
            Welcome, <strong>{user?.name}</strong> ({user?.email})
            {user?.department ? ` • ${user.department} Team` : ''}
          </p>
        </div>

        <div className="header-actions">
          <span className={`live-badge ${isMock ? 'mock' : 'live'}`}>
            {isMock ? 'Fallback Data' : 'Live Data'}
          </span>

          <button type="button" onClick={onRefresh} className="refresh-btn" disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="status-row">
        {error ? <span className="status error">{error}</span> : null}
        <span className="status">
          Last update:{' '}
          {lastUpdated ? lastUpdated.toLocaleTimeString() : loading ? 'Loading…' : 'N/A'}
        </span>
      </div>
    </header>
  )
}

export const DashboardHeader = memo(DashboardHeaderBase)
