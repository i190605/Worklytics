import { useCallback, useMemo, useState } from 'react'
import { useDashboardData } from './useDashboardData'

export function useDashboardViewModel({ token, role }) {
  const [targetRate, setTargetRate] = useState(55)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('rate-desc')
  const [showOnlyOpenVacancies, setShowOnlyOpenVacancies] = useState(false)

  const { dashboard, loading, error, lastUpdated, isMock, refresh } = useDashboardData(token)

  const departments = useMemo(() => {
    const source = dashboard?.departments ?? []

    return source.map((dept) => {
      const totalEmployees = Number(dept.totalEmployees ?? 0)
      const localEmployees = Number(dept.localEmployees ?? 0)
      const monthlyPayroll = Number(dept.monthlyPayroll ?? 0)
      const externalEmployees = Math.max(0, totalEmployees - localEmployees)
      const rate = totalEmployees ? (localEmployees / totalEmployees) * 100 : 0
      const recommendedLocalHires = Math.max(
        0,
        Math.ceil((targetRate / 100) * totalEmployees - localEmployees),
      )

      return {
        ...dept,
        totalEmployees,
        localEmployees,
        monthlyPayroll,
        externalEmployees,
        rate,
        isCompliant: rate >= targetRate,
        recommendedLocalHires,
      }
    })
  }, [dashboard, targetRate])

  const filteredDepartments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return departments
      .filter((dept) => {
        if (normalizedSearch && !dept.name.toLowerCase().includes(normalizedSearch)) {
          return false
        }
        if (statusFilter === 'compliant' && !dept.isCompliant) return false
        if (statusFilter === 'at-risk' && dept.isCompliant) return false
        if (showOnlyOpenVacancies && dept.vacancies === 0) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name)
        if (sortBy === 'rate-asc') return a.rate - b.rate
        if (sortBy === 'vacancies-desc') return b.vacancies - a.vacancies
        return b.rate - a.rate
      })
  }, [departments, search, statusFilter, sortBy, showOnlyOpenVacancies])

  const totals = useMemo(() => {
    const totalEmployees = filteredDepartments.reduce((sum, item) => sum + item.totalEmployees, 0)
    const localEmployees = filteredDepartments.reduce((sum, item) => sum + item.localEmployees, 0)
    const externalEmployees = filteredDepartments.reduce((sum, item) => sum + item.externalEmployees, 0)
    const payroll = filteredDepartments.reduce((sum, item) => sum + item.monthlyPayroll, 0)
    const vacancies = filteredDepartments.reduce((sum, item) => sum + item.vacancies, 0)
    const localizationRate = totalEmployees ? (localEmployees / totalEmployees) * 100 : 0

    return {
      totalEmployees,
      localEmployees,
      externalEmployees,
      payroll,
      vacancies,
      localizationRate,
    }
  }, [filteredDepartments])

  const atRiskBeforeRoleScope = useMemo(
    () => filteredDepartments.filter((dept) => !dept.isCompliant),
    [filteredDepartments],
  )

  const visibleDepartments = filteredDepartments

  const atRiskDepartments = useMemo(
    () => visibleDepartments.filter((dept) => !dept.isCompliant),
    [visibleDepartments],
  )

  const metrics = useMemo(() => {
    const roleMetricMap = {
      admin: [
        { label: 'Enterprise Headcount', value: totals.totalEmployees.toLocaleString() },
        { label: 'Local Workforce', value: totals.localEmployees.toLocaleString() },
        { label: 'Localization Rate', value: `${totals.localizationRate.toFixed(1)}%` },
        { label: 'Monthly Payroll', value: `$${totals.payroll.toLocaleString()}` },
        { label: 'Open Vacancies', value: totals.vacancies.toLocaleString() },
        {
          label: 'Compliance Coverage',
          value: `${departments.length - atRiskBeforeRoleScope.length}/${departments.length || 0}`,
        },
      ],
      hr: [
        { label: 'Total Employees', value: totals.totalEmployees.toLocaleString() },
        { label: 'Local Employees', value: totals.localEmployees.toLocaleString() },
        { label: 'Global Employees', value: totals.externalEmployees.toLocaleString() },
        { label: 'Localization Rate', value: `${totals.localizationRate.toFixed(1)}%` },
        { label: 'Monthly Payroll', value: `$${totals.payroll.toLocaleString()}` },
        { label: 'Open Vacancies', value: totals.vacancies.toLocaleString() },
      ],
      manager: [
        { label: 'Team Size', value: totals.totalEmployees.toLocaleString() },
        { label: 'Local Team Members', value: totals.localEmployees.toLocaleString() },
        { label: 'Team Localization', value: `${totals.localizationRate.toFixed(1)}%` },
        { label: 'Team Payroll', value: `$${totals.payroll.toLocaleString()}` },
        { label: 'Open Team Vacancies', value: totals.vacancies.toLocaleString() },
        { label: 'At-Risk Units', value: atRiskDepartments.length.toLocaleString() },
      ],
    }

    return roleMetricMap[role] || roleMetricMap.admin
  }, [
    atRiskBeforeRoleScope.length,
    atRiskDepartments.length,
    departments.length,
    role,
    totals.externalEmployees,
    totals.localizationRate,
    totals.localEmployees,
    totals.payroll,
    totals.totalEmployees,
    totals.vacancies,
  ])

  const exportCsv = useCallback(() => {
    const header = [
      'Department',
      'Total Employees',
      'Local Employees',
      'Global Employees',
      'Localization Rate %',
      'Monthly Payroll (USD)',
      'Vacancies',
      `Recommended Local Hires @ ${targetRate}%`,
    ]

    const rows = visibleDepartments.map((dept) => [
      dept.name,
      dept.totalEmployees,
      dept.localEmployees,
      dept.externalEmployees,
      dept.rate.toFixed(1),
      dept.monthlyPayroll,
      dept.vacancies,
      dept.recommendedLocalHires,
    ])

    const csv = [header, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'worklytics-workforce-dashboard.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [targetRate, visibleDepartments])

  return {
    viewState: {
      loading,
      error,
      lastUpdated,
      isMock,
    },
    controls: {
      search,
      setSearch,
      statusFilter,
      setStatusFilter,
      sortBy,
      setSortBy,
      showOnlyOpenVacancies,
      setShowOnlyOpenVacancies,
      targetRate,
      setTargetRate,
    },
    metrics,
    totals,
    filteredDepartments: visibleDepartments,
    atRiskDepartments,
    refresh,
    exportCsv,
  }
}
