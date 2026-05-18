import './App.css'
import { DashboardScreen } from './components/dashboard/DashboardScreen'
import { LoginForm } from './components/auth/LoginForm'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, token, loading, error, login, logout } = useAuth()

  if (loading) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Loading Worklytics workspace…</h1>
        </section>
      </main>
    )
  }

  if (!user || !token) {
    return <LoginForm onLogin={login} error={error} />
  }

  return <DashboardScreen user={user} token={token} onLogout={logout} />
}

export default App
