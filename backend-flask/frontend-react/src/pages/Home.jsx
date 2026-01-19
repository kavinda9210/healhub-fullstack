import { Link } from 'react-router-dom'
import { getUser, getToken } from '../lib/storage'

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

export default function Home() {
  const token = getToken()
  const user = getUser()
  const isAuthed = Boolean(token)

  return (
    <div className="page">
      <h1>HealHub</h1>
      <p className="muted">Minimal frontend to check the backend API.</p>

      {isAuthed ? (
        <div className="card">
          <p>
            Signed in as <strong>{user?.email || user?.phone || 'user'}</strong> ({user?.role || 'patient'})
          </p>
          <div className="row">
            <Link className="btn" to={roleToDashboardPath(user?.role)}>
              Go to dashboard
            </Link>
            <Link className="btn secondary" to="/profile">
              Profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <p>You are not logged in.</p>
          <div className="row">
            <Link className="btn" to="/login">
              Login
            </Link>
            <Link className="btn secondary" to="/register">
              Register
            </Link>
            <Link className="btn secondary" to="/verify-email">
              Verify Email
            </Link>
            <Link className="btn secondary" to="/forgot-password">
              Forgot Password
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
