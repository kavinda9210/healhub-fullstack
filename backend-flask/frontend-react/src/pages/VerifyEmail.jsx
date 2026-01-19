import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import ApiResult from '../components/ApiResult'

export default function VerifyEmail() {
  const [email, setEmail] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('email') || window.sessionStorage.getItem('lastIdentifier') || ''
  })
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    setError(null)
    try {
      const payload = await apiRequest('/auth/verify-email', {
        method: 'POST',
        body: { email, code },
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
        <h1 style={{ margin: 0 }}>Verify Email</h1>
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
            <span>Code</span>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
          </label>

          <button className="btn" disabled={submitting} type="submit">
            {submitting ? 'Verifying…' : 'Verify'}
          </button>
        </form>

        <ApiResult result={result} error={error} />
      </div>
    </div>
  )
}
