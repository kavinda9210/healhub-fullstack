import React, { useState } from 'react'
import { forgotPassword } from '../api'
import { useAlert } from '../AlertContext'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword(){
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { showAlert } = useAlert()
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    const res = await forgotPassword({ email })
    setLoading(false)
    if(res && res.status === 'success'){
      showAlert('Password reset sent — check your email','success')
      // optionally navigate to reset page where user can paste token
      navigate('/reset-password')
    } else {
      const msg = res && (res.message || (res.errors && res.errors.join(', '))) || 'Request failed'
      showAlert(msg,'error')
    }
  }

  return (
    <div className="container">
      <h3>Forgot Password</h3>
      <form onSubmit={submit}>
        <input placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} />
        <button disabled={loading}>{loading ? 'Sending...' : 'Send reset email'}</button>
      </form>
    </div>
  )
}
