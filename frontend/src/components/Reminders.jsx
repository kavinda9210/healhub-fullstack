import React, { useState, useContext, useEffect } from 'react'
import AuthContext from '../AuthContext'
import { listReminders, createReminder } from '../api'
import { useAlert } from '../AlertContext'

export default function Reminders(){
  const { token } = useContext(AuthContext)
  const [reminders, setReminders] = useState([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const { showAlert } = useAlert()
  useEffect(()=>{ if(token) listReminders(token).then(r=>{ if(r && r.status === 'error') showAlert(r.message,'error'); else setReminders(r.data||[]) }) },[token])

  async function submit(e){
    e.preventDefault()
    const res = await createReminder(token, { title, message, scheduled_at: new Date().toISOString() })
    if(res && res.status === 'success') { setReminders(prev=>[res.data, ...prev]); showAlert('Reminder created','success') }
    else showAlert(res.message || 'Create failed','error')
  }

  return (
    <div className="container">
      <h3>Reminders</h3>
      <form onSubmit={submit}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <input placeholder="Message" value={message} onChange={e=>setMessage(e.target.value)} />
        <button>Create</button>
      </form>
      <ul>
        {reminders.map(r=> <li key={r.id}>{r.title} — {r.scheduled_at}</li>)}
      </ul>
    </div>
  )
}
