import React, { useState, useEffect } from 'react'
import { apiRequest } from '../lib/api'

export default function DoctorAvailability() {
  const [profile, setProfile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const p = await apiRequest('/doctor/profile', { method: 'GET', auth: true })
        setProfile(p.data || {})
      } catch (e) {
        setError(e.message || String(e))
      }
    }
    load()
  }, [])

  async function save() {
    setBusy(true)
    setError(null)
    try {
      const payload = {
        availableDays: profile.availableDays || [],
        availableDate: profile.available_date || new Date().toISOString().slice(0, 10),
        availableFrom: profile.available_from || '09:00:00',
        availableTo: profile.available_to || '17:00:00',
        slotDurationMinutes: profile.slot_duration_minutes || 30
      }
      await apiRequest('/doctor/availability', { method: 'POST', body: payload, auth: true })
      alert('Availability saved')
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  if (error) return <p className="error">{error}</p>
  if (!profile) return <p>Loading profile…</p>

  return (
    <div className="card">
      <h3>Clinic Availability</h3>
      <div>
        <label>Available Days (comma separated numbers 0-6):</label>
        <input
          value={(profile.availableDays || []).join(',')}
          onChange={(e) => setProfile({ ...profile, availableDays: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
        />
      </div>
      <div>
        <label>Available Date (YYYY-MM-DD):</label>
        <input value={profile.available_date || ''} onChange={(e) => setProfile({ ...profile, available_date: e.target.value })} />
      </div>
      <div>
        <label>From (HH:MM:SS):</label>
        <input value={profile.available_from || ''} onChange={(e) => setProfile({ ...profile, available_from: e.target.value })} />
      </div>
      <div>
        <label>To (HH:MM:SS):</label>
        <input value={profile.available_to || ''} onChange={(e) => setProfile({ ...profile, available_to: e.target.value })} />
      </div>
      <div>
        <label>Slot duration (minutes):</label>
        <input type="number" value={profile.slot_duration_minutes || 30} onChange={(e) => setProfile({ ...profile, slot_duration_minutes: Number(e.target.value) })} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save Availability'}</button>
      </div>
    </div>
  )
}
