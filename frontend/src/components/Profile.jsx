import React, { useContext, useEffect, useState } from 'react'
import AuthContext from '../AuthContext'
import { getProfile, uploadProfilePicture } from '../api'
import { useAlert } from '../AlertContext'

export default function Profile(){
  const { token, setUser } = useContext(AuthContext)
  const [profile, setProfile] = useState(null)
  const [file, setFile] = useState(null)

  const { showAlert } = useAlert()
  useEffect(()=>{
    if(!token) return
    getProfile(token).then(r=>{ if(r && r.data) setProfile(r.data); else if(r && r.status === 'error') showAlert(r.message || 'Failed to load profile', 'error') })
  },[token])

  async function upload(e){
    e.preventDefault()
    if(!file) return
    const res = await uploadProfilePicture(token, file)
    if(res && res.status === 'success'){
      showAlert('Uploaded', 'success')
    } else showAlert(res.message||'Upload failed', 'error')
  }

  if(!profile) return <div className="container">Loading...</div>
  return (
    <div className="container">
      <h3>Profile</h3>
      <div><strong>{profile.name}</strong> ({profile.email})</div>
      <form onSubmit={upload}>
        <input type="file" onChange={e=>setFile(e.target.files[0])} />
        <button>Upload Picture</button>
      </form>
    </div>
  )
}
