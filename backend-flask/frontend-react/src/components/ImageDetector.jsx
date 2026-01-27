import React, { useState, useEffect, useRef } from 'react'
import { apiUpload, apiRequest } from '../lib/api'

export default function ImageDetector() {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [error, setError] = useState(null)
  const [reminders, setReminders] = useState([])
  const soundRef = useRef()

  useEffect(() => {
    soundRef.current = new Audio('/notification.mp3')
  }, [])

  useEffect(() => {
    let mounted = true
    async function loadReminders() {
      try {
        const payload = await apiRequest('/reminder/', { method: 'GET', auth: true })
        if (!mounted) return
        setReminders(payload.data || [])
      } catch (e) {}
    }
    loadReminders()
    const iv = setInterval(loadReminders, 30000)
    return () => {
      mounted = false
      clearInterval(iv)
    }
  }, [])

  useEffect(() => {
    if (reminders && reminders.length > 0) {
      // simple sound/alert for any reminders
      try {
        soundRef.current && soundRef.current.play()
      } catch (e) {}
    }
  }, [reminders])

  async function onDetect() {
    setBusy(true)
    setError(null)
    setResult(null)
    setDoctors([])
    try {
      const resp = await apiUpload('/patient/detect', file, { auth: true })
      if (resp && resp.data) {
        setResult(resp.data.detection)
        setDoctors(resp.data.doctors || [])
      }
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  async function book(doctorId) {
    // fetch slots for today by default
    const date = window.prompt('Enter date for slots (YYYY-MM-DD)', new Date().toISOString().slice(0, 10))
    if (!date) return
    setBusy(true)
    try {
      const resp = await apiRequest(`/appointment/slots?doctorId=${doctorId}&date=${date}`, { method: 'GET', auth: true })
      const slots = resp.data || []
      if (!slots.length) {
        alert('No available slots for this date')
        return
      }
      const sel = window.prompt('Enter slot to book (copy full ISO datetime)\n' + slots.join('\n'))
      if (!sel) return
      await apiRequest('/appointment/book', { method: 'POST', body: { doctorId, appointmentDate: sel }, auth: true })
      alert('Appointment requested')
    } catch (e) {
      alert('Booking failed: ' + (e.message || e))
    } finally {
      setBusy(false)
    }
  }

  async function viewSlots(doctorId) {
    const date = window.prompt('Enter date for slots (YYYY-MM-DD)', new Date().toISOString().slice(0, 10))
    if (!date) return
    setBusy(true)
    try {
      const resp = await apiRequest(`/appointment/slots?doctorId=${doctorId}&date=${date}`, { method: 'GET', auth: true })
      const slots = resp.data || []
      if (!slots.length) {
        alert('No slots available')
      } else {
        const sel = window.prompt('Available slots:\n' + slots.join('\n') + '\n\nEnter slot to book (exact):')
        if (sel) {
          await apiRequest('/appointment/book', { method: 'POST', body: { doctorId, appointmentDate: sel }, auth: true })
          alert('Appointment requested')
        }
      }
    } catch (e) {
      alert('Failed to get slots: ' + (e.message || e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h2>AI Skin/Wound Detector</h2>
      <div>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={onDetect} disabled={!file || busy}>
          {busy ? 'Detecting…' : 'Detect'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="card">
          <h3>Detection</h3>
          <p>
            <strong>{result.label}</strong> — confidence: {(result.confidence || 0).toFixed(2)}
          </p>
          <p>Model used: {String(result.model_used)}</p>
          <details>
            <summary>Raw detection payload</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
          </details>
          <p>Treatments:</p>
          <ul>
            {(result.treatments || []).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
          <p>Recommended specialization: {result.specialization}</p>
        </div>
      )}

      {doctors && doctors.length > 0 && (
        <div className="card">
          <h3>Available Doctors</h3>
          <ul>
            {doctors.map((d) => (
              <li key={d.id}>
                {d.hospital_name || d.specialization || d.user_id} — {d.specialization}
                <button style={{ marginLeft: 8 }} onClick={() => book(d.id)}>
                  Book
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
