import React, { useState } from 'react'
import { verifyEmail, resendVerification } from '../api'
import { useNavigate } from 'react-router-dom'
import { useAlert } from '../AlertContext'

export default function VerifyEmail(){
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { showAlert } = useAlert()

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    try{
      const res = await verifyEmail({ email, code })
      if(res && res.status === 'success'){
        showAlert('Email verified','success')
        navigate('/login')
      } else {
        const msg = res && (res.message || (res.errors && res.errors.join(', '))) || 'Verification failed'
        showAlert(msg,'error')
      }
    }catch(err){
      showAlert(err.message || 'Verification error','error')
    }finally{
      setLoading(false)
    }
  }

  async function handleResend(e){
    e.preventDefault()
    if(!email){ showAlert('Enter your email to resend code','error'); return }
    const res = await resendVerification({ email })
    if(res && res.status === 'success'){
      showAlert('Verification code resent — check email','success')
    } else {
      const msg = res && (res.message || (res.errors && res.errors.join(', '))) || 'Resend failed'
      showAlert(msg,'error')
    }
  }

  return (
    <div className="container">
      <h3>Verify Email</h3>
      <form onSubmit={submit}>
        <input placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Verification code" value={code} onChange={e=>setCode(e.target.value)} />
        <button disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
      </form>
    </div>
  )
}
