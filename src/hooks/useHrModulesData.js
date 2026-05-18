import { useCallback, useEffect, useState } from 'react'
import { mockHrModulesData } from '../data/mockHrModulesData'

async function parseJson(response) {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to fetch data')
  }
  return payload
}

export function useHrModulesData(token) {
  const [modules, setModules] = useState(mockHrModulesData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')

    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    try {
      const [employees, payroll, attendance, compliance, reports, approvals] = await Promise.all([
        fetch('/api/employees', { headers }).then(parseJson),
        fetch('/api/payroll', { headers }).then(parseJson),
        fetch('/api/attendance', { headers }).then(parseJson),
        fetch('/api/compliance', { headers }).then(parseJson),
        fetch('/api/reports', { headers }).then(parseJson),
        fetch('/api/approvals', { headers }).then(parseJson),
      ])

      setModules({
        employees: employees.employees ?? [],
        payroll: payroll.payroll ?? [],
        attendance: attendance.attendance ?? [],
        compliance: compliance.compliance ?? [],
        reports: reports.reports ?? [],
        approvals: approvals.approvals ?? [],
      })
    } catch (err) {
      setModules(mockHrModulesData)
      setError(err instanceof Error ? err.message : 'Failed to fetch module data')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    modules,
    loading,
    error,
    refresh: fetchAll,
  }
}
