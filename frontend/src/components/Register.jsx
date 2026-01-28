import React, { useState } from 'react'
import { register } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [email,setEmail]=useState('')
  const [name,setName]=useState('')
  const [password,setPassword]=useState('')
  const [confirm,setConfirm]=useState('')
  const [error,setError]=useState(null)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError(null)
    if(password !== confirm){ setError('Passwords do not match'); return }
    const res = await register({ email, password, name })
    if (res && res.status === 'success') navigate('/login')
    else setError(res.message || 'Register failed')
  }

  return (
    <div className="container">
      <h3>Register</h3>
      <form onSubmit={submit}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input placeholder="Confirm Password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
        <button>Register</button>
        {error && <div style={{color:'red'}}>{error}</div>}
      </form>
    </div>
  )
}
