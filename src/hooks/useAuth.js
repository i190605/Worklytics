import { useCallback, useEffect, useState } from 'react'

const TOKEN_KEY = 'worklytics_token'

async function parseJson(response) {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed')
  }
  return payload
}

export function useAuth() {
  const [token, setToken] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setUser(null)
    setError('')
  }, [])

  const login = useCallback(async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const payload = await parseJson(response)
    localStorage.setItem(TOKEN_KEY, payload.token)
    setToken(payload.token)
    setUser(payload.user)
    setError('')
  }, [])

  useEffect(() => {
    const existingToken = localStorage.getItem(TOKEN_KEY)
    if (!existingToken) {
      setLoading(false)
      return
    }

    let active = true
    const restoreSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${existingToken}` },
        })
        const payload = await parseJson(response)
        if (!active) return
        setToken(existingToken)
        setUser(payload.user)
        setError('')
      } catch {
        if (!active) return
        localStorage.removeItem(TOKEN_KEY)
        setToken('')
        setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    restoreSession()
    return () => {
      active = false
    }
  }, [])

  return {
    token,
    user,
    loading,
    error,
    login: async (email, password) => {
      try {
        await login(email, password)
      } catch (err) {
        setError(err.message || 'Login failed')
        throw err
      }
    },
    logout,
  }
}
