import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import ApiResult from '../components/ApiResult'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlEmail = params.get('email')
    const urlUserId = params.get('userId')
    const urlToken = params.get('token')
    if (urlEmail && !email) setEmail(urlEmail)
    if (urlUserId && !userId) setUserId(urlUserId)
    if (urlToken && !token) setToken(urlToken)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    setError(null)
    try {
      const payload = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: {
          userId,
          token,
          password,
          confirmPassword,
        },
      })
      setResult(payload)
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Reset Password</h1>
        <div className="row">
          <Link className="btn secondary" to="/">
            Home
          </Link>
          <Link className="btn" to="/login">
            Login
          </Link>
        </div>
      </div>

      <div className="card">
        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>
          <label className="field">
            <span>User ID</span>
            <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="user-id" />
          </label>
          <label className="field">
            <span>Reset Code</span>
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="6-digit-code" />
          </label>
          <label className="field">
            <span>New Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label className="field">
            <span>Confirm Password</span>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </label>

          <button className="btn" disabled={submitting} type="submit">
            {submitting ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <ApiResult result={result} error={error} />
      </div>
    </div>
  )
}
