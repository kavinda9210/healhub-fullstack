import React, { useState, useEffect, useContext } from 'react'
import AuthContext from '../AuthContext'
import { listUsers, createUser } from '../api'
import { useAlert } from '../AlertContext'

export default function AdminUsers(){
  const { token } = useContext(AuthContext)
  const [users, setUsers] = useState([])
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('patient')

  const { showAlert } = useAlert()
  useEffect(()=>{ if(token) listUsers(token).then(r=>{ if(r && r.status === 'error') showAlert(r.message,'error'); else setUsers(r.data||[]) }) },[token])

  async function submit(e){
    e.preventDefault()
    const res = await createUser(token, { email, name, role })
    if(res && res.status === 'success') { setUsers(prev=>[res.data, ...prev]); showAlert('User created','success') }
    else { const m = res && (res.message || (res.errors && res.errors.join(', '))) || 'Create failed'; showAlert(m,'error') }
  }

  return (
    <div className="container">
      <h3>Admin — Users</h3>
      <form onSubmit={submit}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="patient">patient</option>
          <option value="doctor">doctor</option>
          <option value="admin">admin</option>
        </select>
        <button>Create user</button>
      </form>
      <ul>
        {users.map(u=> <li key={u.id}>{u.id} — {u.email} — {u.role}</li>)}
      </ul>
    </div>
  )
}
