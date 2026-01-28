import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../AuthContext'
import { login } from '../api'
import { useAlert } from '../AlertContext'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { setToken } = useContext(AuthContext)
  const navigate = useNavigate()

  const { showAlert } = useAlert()
  async function submit(e){
    e.preventDefault()
    setError(null)
    if(!email || !password){ setError('Email and password required'); showAlert('Email and password required','error'); return }
    const res = await login({ identifier: email, password })
    if (res && res.data && res.data.token) {
      setToken(res.data.token)
      showAlert('Logged in', 'success')
      navigate('/profile')
    } else {
      const msg = res && (res.message || (res.errors && res.errors.join(', '))) || 'Login failed'
      setError(msg)
      showAlert(msg, 'error')
    }
  }

  return (
    <div className="container">
      <h3>Login</h3>
      <form onSubmit={submit}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button>Login</button>
        {error && <div style={{color:'red'}}>{error}</div>}
      </form>
    </div>
  )
}
