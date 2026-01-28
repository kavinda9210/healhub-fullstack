import React, { useState } from 'react'
import { register } from '../api'
import { useNavigate } from 'react-router-dom'
import { useAlert } from '../AlertContext'

export default function Register(){
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email,setEmail]=useState('')
  const [phone,setPhone]=useState('')
  const [dateOfBirth,setDateOfBirth]=useState('')
  const [address,setAddress]=useState('')
  const [city,setCity]=useState('')
  const [stateField,setStateField]=useState('')
  const [country,setCountry]=useState('')
  const [postalCode,setPostalCode]=useState('')
  const [password,setPassword]=useState('')
  const [confirm,setConfirm]=useState('')
  const [error,setError]=useState(null)
  const navigate = useNavigate()

  const { showAlert } = useAlert()
  async function submit(e){
    e.preventDefault()
    setError(null)
    if(password !== confirm){ setError('Passwords do not match'); showAlert('Passwords do not match','error'); return }
    if(!dateOfBirth){ setError('Date of birth is required'); showAlert('Date of birth is required','error'); return }
    const payload = {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email: email || undefined,
      phone: phone || undefined,
      password: password,
      confirmPassword: confirm,
      dateOfBirth: dateOfBirth,
      address: address || undefined,
      city: city || undefined,
      state: stateField || undefined,
      country: country || undefined,
      postalCode: postalCode || undefined
    }

    const res = await register(payload)
    if (res && res.status === 'success') {
      showAlert('Registered — check your email for verification','success');
      navigate('/verify-email')
    } else {
      const msg = res && (res.message || (res.errors && res.errors.join(', '))) || 'Register failed'
      setError(msg)
      showAlert(msg,'error')
    }
  }

  return (
    <div className="container">
      <h3>Register</h3>
      <form onSubmit={submit}>
        <input placeholder="First Name" value={firstName} onChange={e=>setFirstName(e.target.value)} />
        <input placeholder="Last Name" value={lastName} onChange={e=>setLastName(e.target.value)} />
        <input placeholder="Email (or leave empty if using phone)" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Phone (or leave empty if using email)" value={phone} onChange={e=>setPhone(e.target.value)} />
        <input placeholder="Date of Birth (YYYY-MM-DD)" value={dateOfBirth} onChange={e=>setDateOfBirth(e.target.value)} />
        <input placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)} />
        <input placeholder="City" value={city} onChange={e=>setCity(e.target.value)} />
        <input placeholder="State" value={stateField} onChange={e=>setStateField(e.target.value)} />
        <input placeholder="Country (e.g. US)" value={country} onChange={e=>setCountry(e.target.value)} />
        <input placeholder="Postal Code" value={postalCode} onChange={e=>setPostalCode(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input placeholder="Confirm Password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
        <button>Register</button>
        {error && <div style={{color:'red'}}>{error}</div>}
      </form>
    </div>
  )
}
