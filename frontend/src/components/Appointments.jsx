import React, { useState, useContext } from 'react'
import AuthContext from '../AuthContext'
import { getSlots, bookAppointment } from '../api'
import { useAlert } from '../AlertContext'

export default function Appointments(){
  const { token } = useContext(AuthContext)
  const [doctorId, setDoctorId] = useState('123')
  const [date, setDate] = useState('2026-01-28')
  const [slots, setSlots] = useState([])
  const [message, setMessage] = useState('')

  const { showAlert } = useAlert()
  async function loadSlots(){
    const res = await getSlots(token, doctorId, date)
    if (res && res.status === 'error') { showAlert(res.message || 'Failed to load slots','error'); setSlots([]); return }
    setSlots(res.data || [])
  }

  async function book(slot){
    const res = await bookAppointment(token, { doctorId: Number(doctorId), appointmentDate: slot, reason: 'Booking from UI' })
    if(res && res.status === 'success') { setMessage('Booked'); showAlert('Appointment booked','success') }
    else { const m = res && (res.message || 'Failed'); setMessage(m); showAlert(m,'error') }
  }

  return (
    <div className="container">
      <h3>Appointments</h3>
      <input value={doctorId} onChange={e=>setDoctorId(e.target.value)} placeholder="Doctor ID" />
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
      <button onClick={loadSlots}>Load Slots</button>
      <div>
        {slots.map(s=> (
          <div key={s}>
            <span>{s}</span> <button className="small" onClick={()=>book(s)}>Book</button>
          </div>
        ))}
      </div>
      {message && <div>{message}</div>}
    </div>
  )
}
