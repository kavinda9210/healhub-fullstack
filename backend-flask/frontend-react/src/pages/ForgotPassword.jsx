import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import ApiResult from '../components/ApiResult'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    setError(null)
    try {
      const payload = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      })
      setResult(payload)

      const userId = payload?.data?.userId
      const params = new URLSearchParams()
      if (email) params.set('email', email)
      if (userId) params.set('userId', userId)
      navigate(`/reset-password?${params.toString()}`)
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Forgot Password</h1>
        <div className="row">
          <Link className="btn secondary" to="/">
            Home
          </Link>
          <Link className="btn" to="/reset-password">
            Enter Reset Code
          </Link>
        </div>
      </div>

      <div className="card">
        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>
          <button className="btn" disabled={submitting} type="submit">
            {submitting ? 'Sending…' : 'Send Reset Email'}
          </button>
        </form>

        <ApiResult result={result} error={error} />
      </div>
    </div>
  )
}
