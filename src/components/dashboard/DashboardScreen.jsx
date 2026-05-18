import { useMemo, useState } from 'react'
import { DashboardHeader } from './DashboardHeader'
import { DashboardControls } from './DashboardControls'
import { KpiGrid } from './KpiGrid'
import { WorkforceCharts } from './WorkforceCharts'
import { DepartmentTable } from './DepartmentTable'
import { ComplianceInsights } from './ComplianceInsights'
import { HRPayrollModules } from './HRPayrollModules'
import {
  EmployeesScreen,
  PayrollScreen,
  AttendanceScreen,
  ComplianceScreen,
  ApprovalsScreen,
  ReportsScreen,
} from './ModuleScreens'
import { SmartInsightsAssistant } from './SmartInsightsAssistant'
import { ExecutiveBot } from './ExecutiveBot'
import { useDashboardViewModel } from '../../hooks/useDashboardViewModel'
import { useHrModulesData } from '../../hooks/useHrModulesData'

export function DashboardScreen({ user, token, onLogout }) {
  const [activeScreen, setActiveScreen] = useState('dashboard')

  const {
    viewState,
    controls,
    metrics,
    totals,
    filteredDepartments,
    atRiskDepartments,
    refresh,
    exportCsv,
  } = useDashboardViewModel({ token, role: user.role })

  const {
    modules,
    loading: modulesLoading,
    error: modulesError,
    refresh: refreshModules,
  } = useHrModulesData(token)

  const moduleScreen = useMemo(() => {
    if (activeScreen === 'employees') {
      return (
        <EmployeesScreen
          data={modules.employees}
          loading={modulesLoading}
          error={modulesError}
          onRefresh={refreshModules}
        />
      )
    }
    if (activeScreen === 'payroll') {
      return (
        <PayrollScreen
          data={modules.payroll}
          loading={modulesLoading}
          error={modulesError}
          onRefresh={refreshModules}
        />
      )
    }
    if (activeScreen === 'attendance') {
      return (
        <AttendanceScreen
          data={modules.attendance}
          loading={modulesLoading}
          error={modulesError}
          onRefresh={refreshModules}
        />
      )
    }
    if (activeScreen === 'compliance') {
      return (
        <ComplianceScreen
          data={modules.compliance}
          loading={modulesLoading}
          error={modulesError}
          onRefresh={refreshModules}
        />
      )
    }
    if (activeScreen === 'reports') {
      return (
        <ReportsScreen
          data={modules.reports}
          loading={modulesLoading}
          error={modulesError}
          onRefresh={refreshModules}
        />
      )
    }

    if (activeScreen === 'approvals') {
      return (
        <ApprovalsScreen
          data={modules.approvals ?? []}
          loading={modulesLoading}
          error={modulesError}
          onRefresh={refreshModules}
        />
      )
    }

    return null
  }, [activeScreen, modules, modulesError, modulesLoading, refreshModules])

  const handleHeaderRefresh = () => {
    if (activeScreen === 'dashboard') {
      refresh()
      return
    }
    refreshModules()
  }

  return (
    <main className="dashboard-page">
      <DashboardHeader
        user={user}
        isMock={viewState.isMock}
        loading={viewState.loading}
        error={viewState.error}
        lastUpdated={viewState.lastUpdated}
        onRefresh={handleHeaderRefresh}
        onLogout={onLogout}
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
      />

      {activeScreen === 'dashboard' ? (
        <>
          <DashboardControls
            search={controls.search}
            onSearchChange={controls.setSearch}
            statusFilter={controls.statusFilter}
            onStatusFilterChange={controls.setStatusFilter}
            sortBy={controls.sortBy}
            onSortByChange={controls.setSortBy}
            showOnlyOpenVacancies={controls.showOnlyOpenVacancies}
            onShowOnlyOpenVacanciesChange={controls.setShowOnlyOpenVacancies}
            targetRate={controls.targetRate}
            onTargetRateChange={controls.setTargetRate}
            onExport={exportCsv}
          />

          <KpiGrid metrics={metrics} />

          <WorkforceCharts departments={filteredDepartments} />

          <HRPayrollModules
            departments={filteredDepartments}
            totals={totals}
            targetRate={controls.targetRate}
          />

          <DepartmentTable departments={filteredDepartments} role={user.role} />

          <ComplianceInsights
            atRiskDepartments={atRiskDepartments}
            targetRate={controls.targetRate}
          />

          <SmartInsightsAssistant modules={modules} />
          <ExecutiveBot />
        </>
      ) : (
        moduleScreen
      )}
    </main>
  )
}
