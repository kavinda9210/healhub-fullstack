import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import ApiResult from '../components/ApiResult'

export default function ResendVerification() {
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
      const payload = await apiRequest('/auth/resend-verification', {
        method: 'POST',
        body: { email },
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
        <h1 style={{ margin: 0 }}>Resend Verification</h1>
        <div className="row">
          <Link className="btn secondary" to="/">
            Home
          </Link>
          <Link className="btn" to="/verify-email">
            Verify Email
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
            {submitting ? 'Sending…' : 'Send Code'}
          </button>
        </form>

        <ApiResult result={result} error={error} />
      </div>
    </div>
  )
}
