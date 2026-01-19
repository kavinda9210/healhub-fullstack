import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/auth'

function roleToDashboardPath(role) {
  switch (role) {
    case 'doctor':
      return '/doctor/dashboard'
    case 'admin':
      return '/admin/dashboard'
    case 'ambulance_staff':
    case 'ambulance':
      return '/ambulance/dashboard'
    case 'patient':
    default:
      return '/patient/dashboard'
  }
}

export default function Login() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState(() => window.sessionStorage.getItem('lastIdentifier') || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { user } = await login({ identifier, password })
      navigate(roleToDashboardPath(user?.role), { replace: true })
    } catch (err) {
      setError(err?.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <h1>Login</h1>
      <div className="card">
        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span>Identifier (email or phone)</span>
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          </label>

          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          {error ? <p className="error">{error}</p> : null}

          <button className="btn" disabled={submitting} type="submit">
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 10 }}>
          Note: if the backend requires email verification, verify first.
        </p>
      </div>
    </div>
  )
}
