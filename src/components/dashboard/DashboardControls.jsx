import { memo } from 'react'

function DashboardControlsBase({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  showOnlyOpenVacancies,
  onShowOnlyOpenVacanciesChange,
  targetRate,
  onTargetRateChange,
  onExport,
}) {
  return (
    <section className="panel controls-panel">
      <div className="controls-grid">
        <label>
          Search Team
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="e.g. Operations"
          />
        </label>

        <label>
          Workforce Status
          <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
            <option value="all">All</option>
            <option value="compliant">On Target</option>
            <option value="at-risk">At Risk</option>
          </select>
        </label>

        <label>
          Sort By
          <select value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
            <option value="rate-desc">Rate (High to Low)</option>
            <option value="rate-asc">Rate (Low to High)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="vacancies-desc">Most Vacancies</option>
          </select>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showOnlyOpenVacancies}
            onChange={(e) => onShowOnlyOpenVacanciesChange(e.target.checked)}
          />
          Show only teams with open roles
        </label>
      </div>

      <div className="target-row">
        <label htmlFor="target-range">
          Localization Target: <strong>{targetRate}%</strong>
        </label>
        <input
          id="target-range"
          type="range"
          min="30"
          max="90"
          step="1"
          value={targetRate}
          onChange={(e) => onTargetRateChange(Number(e.target.value))}
        />
        <button type="button" onClick={onExport} className="export-btn">
          Export Report
        </button>
      </div>
    </section>
  )
}

export const DashboardControls = memo(DashboardControlsBase)
