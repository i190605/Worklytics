import { useCallback, useEffect, useRef, useState } from 'react'
import { mockDashboardData } from '../data/mockDashboardData'

const API_URL = import.meta.env.VITE_DASHBOARD_API_URL || '/api/dashboard'
const POLL_MS = Number(import.meta.env.VITE_DASHBOARD_POLL_MS || 15000)

export function useDashboardData(token) {
  const [dashboard, setDashboard] = useState(mockDashboardData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isMock, setIsMock] = useState(true)
  const mountedRef = useRef(true)
  const lastPayloadSignatureRef = useRef(JSON.stringify(mockDashboardData))

  const fetchDashboard = useCallback(async () => {
    try {
      setError('')
      const response = await fetch(API_URL, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        const err = new Error(`Failed to load dashboard data (${response.status})`)
        err.status = response.status
        throw err
      }

      const payload = await response.json()
      if (!payload || !Array.isArray(payload.departments)) {
        throw new Error('Invalid dashboard payload. Expected { departments: [] }.')
      }

      if (!mountedRef.current) return

      const nextSignature = JSON.stringify(payload)
      const hasDataChanged = nextSignature !== lastPayloadSignatureRef.current

      if (hasDataChanged) {
        lastPayloadSignatureRef.current = nextSignature
        setDashboard(payload)
        setLastUpdated(new Date())
      }

      setIsMock(false)
    } catch (err) {
      if (!mountedRef.current) return

      if (err?.status === 401) {
        const unauthorizedFallback = { departments: [] }
        lastPayloadSignatureRef.current = JSON.stringify(unauthorizedFallback)
        setDashboard(unauthorizedFallback)
        setIsMock(false)
        setError('Session expired or unauthorized. Please login again.')
      } else {
        lastPayloadSignatureRef.current = JSON.stringify(mockDashboardData)
        setDashboard(mockDashboardData)
        setIsMock(true)
        setError(err.message || 'Failed to load live data. Showing fallback data.')
      }
      setLastUpdated(new Date())
    } finally {
      if (!mountedRef.current) return
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    mountedRef.current = true
    setLoading(true)
    fetchDashboard()

    const timer = setInterval(fetchDashboard, POLL_MS)
    return () => {
      mountedRef.current = false
      clearInterval(timer)
    }
  }, [fetchDashboard, token])

  return {
    dashboard,
    loading,
    error,
    lastUpdated,
    isMock,
    refresh: fetchDashboard,
  }
}
