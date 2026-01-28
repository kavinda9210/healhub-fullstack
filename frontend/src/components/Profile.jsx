import React, { useContext, useEffect, useState } from 'react'
import AuthContext from '../AuthContext'
import { getProfile, uploadProfilePicture } from '../api'

export default function Profile(){
  const { token, setUser } = useContext(AuthContext)
  const [profile, setProfile] = useState(null)
  const [file, setFile] = useState(null)

  useEffect(()=>{
    if(!token) return
    getProfile(token).then(r=>{ if(r && r.data) setProfile(r.data) })
  },[token])

  async function upload(e){
    e.preventDefault()
    if(!file) return
    const res = await uploadProfilePicture(token, file)
    if(res && res.status === 'success'){
      alert('Uploaded')
    } else alert(res.message||'Upload failed')
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
