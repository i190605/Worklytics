import { useState } from 'react'
import logo from '../../assets/worklytics-logo.png'

export function LoginForm({ onLogin, error }) {
  const [email, setEmail] = useState('admin@worklytics.com')
  const [password, setPassword] = useState('ADMIN#12345')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await onLogin(email, password)
    } catch {
      // handled by useAuth
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <img src={logo} alt="Worklytics logo" className="auth-logo" />
          <div>
            <h1>Worklytics Secure Access</h1>
            <p>Sign in to access the workforce intelligence module.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="auth-btn" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {error ? <p className="auth-error">{error}</p> : null}

        <div className="demo-credentials">
          <strong>Demo users:</strong>
          <ul>
            <li>Admin: admin@worklytics.com / ADMIN#12345</li>
            <li>HR: hr@worklytics.com / HR#12345</li>
            <li>Manager: manager@worklytics.com / MGR#12345</li>
          </ul>
        </div>
      </section>
    </main>
  )
}
