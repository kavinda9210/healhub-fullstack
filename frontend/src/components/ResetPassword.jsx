import React, { useState } from 'react'
import { resetPassword } from '../api'
import { useAlert } from '../AlertContext'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword(){
  const [userId, setUserId] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const { showAlert } = useAlert()
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    if(password !== confirm){ showAlert('Passwords do not match','error'); return }
    setLoading(true)
    const res = await resetPassword({ userId, token, password, confirmPassword: confirm })
    setLoading(false)
    if(res && res.status === 'success'){
      showAlert('Password reset successful','success')
      navigate('/login')
    } else {
      const msg = res && (res.message || (res.errors && res.errors.join(', '))) || 'Reset failed'
      showAlert(msg,'error')
    }
  }

  return (
    <div className="container">
      <h3>Reset Password</h3>
      <form onSubmit={submit}>
        <input placeholder="User ID (from email)" value={userId} onChange={e=>setUserId(e.target.value)} />
        <input placeholder="Reset token/code (from email)" value={token} onChange={e=>setToken(e.target.value)} />
        <input placeholder="New password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input placeholder="Confirm password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
        <button disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
      </form>
    </div>
  )
}
