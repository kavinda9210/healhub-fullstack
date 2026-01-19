import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUser, getToken } from '../lib/storage'
import { logout } from '../lib/auth'
import { apiRequest } from '../lib/api'
import ApiResult from '../components/ApiResult'

export default function DashboardShell({ title, requiredRole, dashboardPath }) {
  const navigate = useNavigate()
  const [user] = useState(() => getUser())
  const [token] = useState(() => getToken())
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) navigate('/login', { replace: true })
  }, [token, navigate])

  useEffect(() => {
    async function load() {
      if (!token || !dashboardPath) return
      setResult(null)
      setError(null)
      try {
        const payload = await apiRequest(dashboardPath, { method: 'GET', auth: true })
        setResult(payload)
      } catch (err) {
        setError(err)
      }
    }

    load()
  }, [token, dashboardPath])

  const role = user?.role || 'patient'
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  const forbidden = Boolean(requiredRole && !allowedRoles.includes(role))

  async function onLogout() {
    setBusy(true)
    try {
      await logout()
    } finally {
      setBusy(false)
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="page">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>{title}</h1>
        <div className="row">
          <Link className="btn secondary" to="/">
            Home
          </Link>
          <Link className="btn secondary" to="/profile">
            Profile
          </Link>
          <button className="btn" onClick={onLogout} disabled={busy}>
            {busy ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      </div>

      <div className="card">
        <p>
          Signed in as <strong>{user?.email || user?.phone || 'user'}</strong> ({role})
        </p>
        {forbidden ? (
          <p className="error">Forbidden: this dashboard is for role "{requiredRole}".</p>
        ) : (
          <p className="muted">Backend: GET {dashboardPath}</p>
        )}

        <ApiResult result={result} error={error} />
      </div>
    </div>
  )
}
