import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState(() => ({
    firstName: 'John',
    lastName: 'Doe',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '1990-01-15',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'US',
    postalCode: '10001',
  }))

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  function setField(key, value) {
    setForm((s) => ({ ...s, [key]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setSubmitting(true)
    try {
      const payload = await apiRequest('/auth/register', {
        method: 'POST',
        body: form,
      })

      setSuccessMessage(payload?.message || 'Registration successful. Please verify your email.')

      // Convenience: if they registered with email, prefill login identifier.
      if (form.email) window.sessionStorage.setItem('lastIdentifier', form.email)
      else if (form.phone) window.sessionStorage.setItem('lastIdentifier', form.phone)

      // Redirect into email verification flow.
      if (form.email) {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`, { replace: true })
      }
    } catch (err) {
      const apiErrors = err?.payload?.errors
      if (Array.isArray(apiErrors) && apiErrors.length) setError(apiErrors.join('\n'))
      else setError(err?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Register</h1>
        <div className="row">
          <Link className="btn secondary" to="/">
            Home
          </Link>
          <button className="btn" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </div>

      <div className="card">
        <form onSubmit={onSubmit} className="form">
          <div className="grid">
            <label className="field">
              <span>First name</span>
              <input value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} />
            </label>
            <label className="field">
              <span>Last name</span>
              <input value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} />
            </label>

            <label className="field">
              <span>Email (email or phone required)</span>
              <input value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="you@example.com" />
            </label>
            <label className="field">
              <span>Phone (email or phone required)</span>
              <input value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+15551234567" />
            </label>

            <label className="field">
              <span>Password</span>
              <input type="password" value={form.password} onChange={(e) => setField('password', e.target.value)} />
            </label>
            <label className="field">
              <span>Confirm password</span>
              <input type="password" value={form.confirmPassword} onChange={(e) => setField('confirmPassword', e.target.value)} />
            </label>

            <label className="field">
              <span>Date of birth</span>
              <input value={form.dateOfBirth} onChange={(e) => setField('dateOfBirth', e.target.value)} placeholder="1990-01-15" />
            </label>
            <label className="field">
              <span>Address</span>
              <input value={form.address} onChange={(e) => setField('address', e.target.value)} />
            </label>

            <label className="field">
              <span>City</span>
              <input value={form.city} onChange={(e) => setField('city', e.target.value)} />
            </label>
            <label className="field">
              <span>State</span>
              <input value={form.state} onChange={(e) => setField('state', e.target.value)} />
            </label>

            <label className="field">
              <span>Country</span>
              <input value={form.country} onChange={(e) => setField('country', e.target.value)} />
            </label>
            <label className="field">
              <span>Postal code</span>
              <input value={form.postalCode} onChange={(e) => setField('postalCode', e.target.value)} />
            </label>
          </div>

          {error ? <pre className="error" style={{ whiteSpace: 'pre-wrap' }}>{error}</pre> : null}
          {successMessage ? <p className="muted">{successMessage}</p> : null}

          <button className="btn" disabled={submitting} type="submit">
            {submitting ? 'Registering…' : 'Register'}
          </button>

          <p className="muted" style={{ marginTop: 10 }}>
            After registering, verify your email with the code, then login.
          </p>
        </form>
      </div>
    </div>
  )
}
