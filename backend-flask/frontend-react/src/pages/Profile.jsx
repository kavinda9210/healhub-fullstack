import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import { getToken, getUser } from '../lib/storage'
import ApiResult from '../components/ApiResult'
import { getApiBaseUrl } from '../lib/api'

export default function Profile() {
  const navigate = useNavigate()
  const [token] = useState(() => getToken())
  const [user] = useState(() => getUser())

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const [profile, setProfile] = useState(null)

  const [departments, setDepartments] = useState([])
  const [doctorDays, setDoctorDays] = useState([])
  const [ambulanceDays, setAmbulanceDays] = useState([])
  const [doctorUpdates, setDoctorUpdates] = useState({
    departmentId: '',
    hospitalName: '',
    licenseNumber: '',
    availableFrom: '',
    availableTo: '',
    availableDate: '',
    slotDurationMinutes: 30,
  })
  const [ambulanceUpdates, setAmbulanceUpdates] = useState({
    staffType: '',
    vehicleRegistration: '',
    assignedCity: '',
    assignedState: '',
    shiftType: '',
  })
  const [dirtyRole, setDirtyRole] = useState(() => new Set())

  const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const MIN_USER_AGE = Number(import.meta.env.VITE_MIN_USER_AGE || 13)
  function maxDobISO(minAgeYears) {
    const today = new Date()
    const d = new Date(today.getFullYear() - minAgeYears, today.getMonth(), today.getDate())
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const [pictureFile, setPictureFile] = useState(null)

  const [newEmail, setNewEmail] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [phoneCode, setPhoneCode] = useState('')

  const [dirty, setDirty] = useState(() => new Set())

  function setField(field, value) {
    setUpdates((s) => ({ ...s, [field]: value }))
    setDirty((prev) => {
      const next = new Set(prev)
      next.add(field)
      return next
    })
  }

  const [updates, setUpdates] = useState(() => ({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone: '',
    alternate_email: '',
    alternate_phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    profile_image_url: '',
  }))

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    refreshProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate])

  async function refreshProfile() {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const payload = await apiRequest('/auth/profile', { method: 'GET', auth: true })
      setResult(payload)
      const p = payload?.data || {}
      setProfile(p)
      setUpdates({
        first_name: p.first_name ?? '',
        last_name: p.last_name ?? '',
        date_of_birth: p.date_of_birth ?? '',
        phone: p.phone ?? '',
        alternate_email: p.alternate_email ?? '',
        alternate_phone: p.alternate_phone ?? '',
        address: p.address ?? '',
        city: p.city ?? '',
        state: p.state ?? '',
        postal_code: p.postal_code ?? '',
        country: p.country ?? 'US',
        profile_image_url: p.profile_image_url ?? '',
      })
      setDirty(new Set())

      // Role-specific
      if (p.role === 'doctor' && p.doctor) {
        setDoctorUpdates({
          departmentId: p.doctor.departmentId ?? '',
          hospitalName: p.doctor.hospitalName ?? '',
          licenseNumber: p.doctor.licenseNumber ?? '',
          availableFrom: (p.doctor.availableFrom ?? '').toString().slice(0, 5),
          availableTo: (p.doctor.availableTo ?? '').toString().slice(0, 5),
          availableDate: (p.doctor.availableDate ?? '').toString().slice(0, 10),
          slotDurationMinutes: p.doctor.slotDurationMinutes ?? 30,
        })
        setDoctorDays(Array.isArray(p.doctor.availableDays) ? p.doctor.availableDays : [])

        // Departments for doctor
        try {
          const deps = await apiRequest('/user/departments', { method: 'GET', auth: true })
          setDepartments(Array.isArray(deps?.data) ? deps.data : [])
        } catch {}
      }

      if (p.role === 'ambulance_staff' && p.ambulance) {
        setAmbulanceUpdates({
          staffType: p.ambulance.staffType ?? '',
          vehicleRegistration: p.ambulance.vehicleRegistration ?? '',
          assignedCity: p.ambulance.assignedCity ?? '',
          assignedState: p.ambulance.assignedState ?? '',
          shiftType: p.ambulance.shiftType ?? '',
        })
        setAmbulanceDays(Array.isArray(p.ambulance.availableDays) ? p.ambulance.availableDays : [])
      }

      setDirtyRole(new Set())
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  function toggleRoleDay(which, day) {
    if (which === 'doctor') {
      setDoctorDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
      setDirtyRole((prev) => new Set(prev).add('doctor.days'))
    }
    if (which === 'ambulance') {
      setAmbulanceDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
      setDirtyRole((prev) => new Set(prev).add('ambulance.days'))
    }
  }

  function setDoctorField(field, value) {
    setDoctorUpdates((s) => ({ ...s, [field]: value }))
    setDirtyRole((prev) => new Set(prev).add(`doctor.${field}`))
  }

  function setAmbulanceField(field, value) {
    setAmbulanceUpdates((s) => ({ ...s, [field]: value }))
    setDirtyRole((prev) => new Set(prev).add(`ambulance.${field}`))
  }

  async function saveProfile() {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const body = Object.fromEntries(
        Array.from(dirty).map((key) => [key, updates[key] === '' ? null : updates[key]])
      )
      const rolePatch = {}
      if (profile?.role === 'doctor' && dirtyRole.size > 0) {
        rolePatch.doctor = {
          departmentId: doctorUpdates.departmentId || undefined,
          hospitalName: doctorUpdates.hospitalName || undefined,
          licenseNumber: doctorUpdates.licenseNumber || undefined,
          availableFrom: doctorUpdates.availableFrom || undefined,
          availableTo: doctorUpdates.availableTo || undefined,
          availableDate: doctorUpdates.availableDate || undefined,
          slotDurationMinutes: doctorUpdates.slotDurationMinutes,
          availableDays: doctorDays,
        }
      }
      if (profile?.role === 'ambulance_staff' && dirtyRole.size > 0) {
        rolePatch.ambulance = {
          staffType: ambulanceUpdates.staffType || undefined,
          vehicleRegistration: ambulanceUpdates.vehicleRegistration || undefined,
          assignedCity: ambulanceUpdates.assignedCity || undefined,
          assignedState: ambulanceUpdates.assignedState || undefined,
          shiftType: ambulanceUpdates.shiftType || undefined,
          availableDays: ambulanceDays,
        }
      }

      const finalBody = { ...body, ...rolePatch }
      if (Object.keys(finalBody).length === 0) {
        throw new Error('No changes to save')
      }
      const payload = await apiRequest('/auth/profile', {
        method: 'PUT',
        auth: true,
        body: finalBody,
      })
      setResult(payload)
      setDirty(new Set())
      setDirtyRole(new Set())
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  async function uploadProfilePicture() {
    if (!token) {
      navigate('/login', { replace: true })
      return
    }
    if (!pictureFile) return

    setUploading(true)
    setResult(null)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', pictureFile)

      const res = await fetch(`${getApiBaseUrl()}/auth/profile-picture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      })

      const contentType = res.headers.get('content-type') || ''
      const payload = contentType.includes('application/json') ? await res.json() : await res.text()

      if (!res.ok) {
        const message =
          (payload && typeof payload === 'object' && (payload.message || payload.error)) || `Request failed (${res.status})`
        const err = new Error(message)
        err.status = res.status
        err.payload = payload
        throw err
      }

      setResult(payload)

      const nextUrl = payload?.data?.profile_image_url || payload?.data?.user?.profile_image_url
      if (nextUrl) {
        setUpdates((s) => ({ ...s, profile_image_url: nextUrl }))
      }
    } catch (err) {
      setError(err)
    } finally {
      setUploading(false)
    }
  }

  async function requestEmailChange() {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const payload = await apiRequest('/auth/change-email/request', {
        method: 'POST',
        auth: true,
        body: { newEmail },
      })
      setResult(payload)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogoutAll() {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const payload = await apiRequest('/auth/logout-all', {
        method: 'POST',
        auth: true,
      })
      setResult(payload)
      setTimeout(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login', { replace: true })
      }, 1500)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  async function verifyEmailChange() {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const payload = await apiRequest('/auth/change-email/verify', {
        method: 'POST',
        auth: true,
        body: { newEmail, code: emailCode },
      })
      setResult(payload)
      await refreshProfile()
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  async function requestPhoneChange() {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const payload = await apiRequest('/auth/change-phone/request', {
        method: 'POST',
        auth: true,
        body: { newPhone },
      })
      setResult(payload)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  async function verifyPhoneChange() {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const payload = await apiRequest('/auth/change-phone/verify', {
        method: 'POST',
        auth: true,
        body: { newPhone, code: phoneCode },
      })
      setResult(payload)
      await refreshProfile()
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Profile</h1>
        <div className="row">
          <Link className="btn secondary" to="/">
            Home
          </Link>
        </div>
      </div>

      <div className="card">
        <p className="muted">
          Signed in as <strong>{user?.email || user?.phone || 'user'}</strong>
        </p>

        <div className="row">
          <button className="btn" onClick={refreshProfile} disabled={loading}>
            {loading ? 'Loading…' : 'GET /auth/profile'}
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <p className="muted" style={{ marginTop: 0 }}>
            Profile picture
          </p>

          {updates.profile_image_url ? (
            <img
              alt="Profile"
              src={updates.profile_image_url}
              style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div className="muted">No profile picture</div>
          )}

          <div className="row" style={{ alignItems: 'center', marginTop: 8 }}>
            <input type="file" accept="image/*" onChange={(e) => setPictureFile(e.target.files?.[0] || null)} />
            <button className="btn" onClick={uploadProfilePicture} disabled={uploading || !pictureFile} type="button">
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <p className="muted" style={{ marginTop: 0 }}>
            Primary identifiers
          </p>
          <div className="grid">
            <label className="field">
              <span>Email (cannot edit directly)</span>
              <input value={profile?.email ?? ''} readOnly />
            </label>
            <label className="field">
              <span>Phone (cannot edit directly)</span>
              <input value={profile?.phone ?? ''} readOnly />
            </label>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <p className="muted" style={{ marginTop: 0 }}>
            Change email (requires verification)
          </p>
          <div className="grid">
            <label className="field">
              <span>New Email</span>
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </label>
            <label className="field">
              <span>Verification Code</span>
              <input value={emailCode} onChange={(e) => setEmailCode(e.target.value)} />
            </label>
          </div>
          <div className="row">
            <button className="btn" type="button" disabled={loading || !newEmail} onClick={requestEmailChange}>
              {loading ? 'Sending…' : 'Send Code'}
            </button>
            <button className="btn secondary" type="button" disabled={loading || !newEmail || !emailCode} onClick={verifyEmailChange}>
              {loading ? 'Verifying…' : 'Verify & Update Email'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <p className="muted" style={{ marginTop: 0 }}>
            Change phone (requires verification)
          </p>
          <div className="grid">
            <label className="field">
              <span>New Phone</span>
              <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            </label>
            <label className="field">
              <span>Verification Code</span>
              <input value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} />
            </label>
          </div>
          <div className="row">
            <button className="btn" type="button" disabled={loading || !newPhone} onClick={requestPhoneChange}>
              {loading ? 'Sending…' : 'Send Code'}
            </button>
            <button className="btn secondary" type="button" disabled={loading || !newPhone || !phoneCode} onClick={verifyPhoneChange}>
              {loading ? 'Verifying…' : 'Verify & Update Phone'}
            </button>
          </div>
        </div>

        <div className="grid" style={{ marginTop: 12 }}>
          <label className="field">
            <span>First Name</span>
            <input
              value={updates.first_name}
              onChange={(e) => setField('first_name', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Last Name</span>
            <input
              value={updates.last_name}
              onChange={(e) => setField('last_name', e.target.value)}
            />
          </label>

          <label className="field">
            <span>Date of Birth</span>
            <input
              type="date"
              value={(updates.date_of_birth || '').toString().slice(0, 10)}
              onChange={(e) => setField('date_of_birth', e.target.value)}
              max={maxDobISO(MIN_USER_AGE)}
            />
          </label>
          <label className="field">
            <span>Phone</span>
            <input value={updates.phone} readOnly />
          </label>

          <label className="field">
            <span>Alternate Email</span>
            <input
              value={updates.alternate_email}
              onChange={(e) => setField('alternate_email', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Alternate Phone</span>
            <input
              value={updates.alternate_phone}
              onChange={(e) => setField('alternate_phone', e.target.value)}
            />
          </label>

          <label className="field" style={{ gridColumn: '1 / -1' }}>
            <span>Address</span>
            <input
              value={updates.address}
              onChange={(e) => setField('address', e.target.value)}
            />
          </label>

          <label className="field">
            <span>City</span>
            <input value={updates.city} onChange={(e) => setField('city', e.target.value)} />
          </label>
          <label className="field">
            <span>State</span>
            <input value={updates.state} onChange={(e) => setField('state', e.target.value)} />
          </label>

          <label className="field">
            <span>Postal Code</span>
            <input
              value={updates.postal_code}
              onChange={(e) => setField('postal_code', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Country</span>
            <input
              value={updates.country}
              onChange={(e) => setField('country', e.target.value)}
            />
          </label>

          <label className="field" style={{ gridColumn: '1 / -1' }}>
            <span>Profile Image URL</span>
            <input
              value={updates.profile_image_url}
              onChange={(e) => setField('profile_image_url', e.target.value)}
            />
          </label>
        </div>

        {profile?.role === 'doctor' && (
          <div style={{ marginTop: 12 }}>
            <p className="muted" style={{ marginTop: 0 }}>Doctor Profile</p>
            <div className="grid">
              <label className="field" style={{ gridColumn: '1 / -1' }}>
                <span>Department</span>
                <select value={doctorUpdates.departmentId} onChange={(e) => setDoctorField('departmentId', e.target.value)}>
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Hospital Name</span>
                <input value={doctorUpdates.hospitalName} onChange={(e) => setDoctorField('hospitalName', e.target.value)} />
              </label>
              <label className="field">
                <span>License Number</span>
                <input value={doctorUpdates.licenseNumber} onChange={(e) => setDoctorField('licenseNumber', e.target.value)} />
              </label>

              <label className="field">
                <span>Available From</span>
                <input type="time" value={doctorUpdates.availableFrom} onChange={(e) => setDoctorField('availableFrom', e.target.value)} />
              </label>
              <label className="field">
                <span>Available To</span>
                <input type="time" value={doctorUpdates.availableTo} onChange={(e) => setDoctorField('availableTo', e.target.value)} />
              </label>

              <label className="field">
                <span>Available Date</span>
                <input type="date" value={doctorUpdates.availableDate} onChange={(e) => setDoctorField('availableDate', e.target.value)} />
              </label>
              <label className="field">
                <span>Slot Duration (minutes)</span>
                <input type="number" min={5} value={doctorUpdates.slotDurationMinutes} onChange={(e) => setDoctorField('slotDurationMinutes', Number(e.target.value))} />
              </label>

              <label className="field" style={{ gridColumn: '1 / -1' }}>
                <span>Available Days</span>
                <div className="row" style={{ flexWrap: 'wrap', gap: 10 }}>
                  {DAYS_OF_WEEK.map((day) => (
                    <label key={day} className="row" style={{ gap: 6, alignItems: 'center' }}>
                      <input type="checkbox" checked={doctorDays.includes(day)} onChange={() => toggleRoleDay('doctor', day)} />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </label>
            </div>
          </div>
        )}

        {profile?.role === 'ambulance_staff' && (
          <div style={{ marginTop: 12 }}>
            <p className="muted" style={{ marginTop: 0 }}>Ambulance Staff Profile</p>
            <div className="grid">
              <label className="field">
                <span>Staff Type</span>
                <select value={ambulanceUpdates.staffType} onChange={(e) => setAmbulanceField('staffType', e.target.value)}>
                  <option value="">Select Staff Type</option>
                  <option value="driver">Driver</option>
                  <option value="paramedic">Paramedic</option>
                  <option value="attendant">Attendant</option>
                  <option value="nurse">Nurse</option>
                </select>
              </label>
              <label className="field">
                <span>Vehicle Registration</span>
                <input value={ambulanceUpdates.vehicleRegistration} onChange={(e) => setAmbulanceField('vehicleRegistration', e.target.value)} />
              </label>
              <label className="field">
                <span>Assigned City</span>
                <input value={ambulanceUpdates.assignedCity} onChange={(e) => setAmbulanceField('assignedCity', e.target.value)} />
              </label>
              <label className="field">
                <span>Assigned State</span>
                <input value={ambulanceUpdates.assignedState} onChange={(e) => setAmbulanceField('assignedState', e.target.value)} />
              </label>
              <label className="field">
                <span>Shift Type</span>
                <select value={ambulanceUpdates.shiftType} onChange={(e) => setAmbulanceField('shiftType', e.target.value)}>
                  <option value="">Select Shift</option>
                  <option value="day">Day</option>
                  <option value="night">Night</option>
                  <option value="rotating">Rotating</option>
                </select>
              </label>
              <label className="field" style={{ gridColumn: '1 / -1' }}>
                <span>Available Days</span>
                <div className="row" style={{ flexWrap: 'wrap', gap: 10 }}>
                  {DAYS_OF_WEEK.map((day) => (
                    <label key={day} className="row" style={{ gap: 6, alignItems: 'center' }}>
                      <input type="checkbox" checked={ambulanceDays.includes(day)} onChange={() => toggleRoleDay('ambulance', day)} />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </label>
            </div>
          </div>
        )}

        <button className="btn" onClick={saveProfile} disabled={loading}>
          {loading ? 'Saving…' : 'PUT /auth/profile'}
        </button>

        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
          <h3>Sessions</h3>
          <button className="btn btn-danger" onClick={handleLogoutAll} disabled={loading}>
            {loading ? 'Logging out…' : 'Logout from All Sessions'}
          </button>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            This will log you out from all devices and clear all active sessions.
          </p>
        </div>

        <ApiResult result={result} error={error} />
      </div>
    </div>
  )
}
