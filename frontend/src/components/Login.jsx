import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../AuthContext'
import { login } from '../api'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { setToken } = useContext(AuthContext)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError(null)
    const res = await login({ email, password })
    if (res && res.data && res.data.access_token) {
      setToken(res.data.access_token)
      navigate('/profile')
    } else {
      setError(res.message || 'Login failed')
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
