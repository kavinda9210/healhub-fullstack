import React, { useState, useContext } from 'react'
import AuthContext from '../AuthContext'
import { detectImageMultipart } from '../api'

export default function Detect(){
  const { token } = useContext(AuthContext)
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)

  async function submit(e){
    e.preventDefault()
    if(!file) return
    const res = await detectImageMultipart(token, file)
    setResult(res)
  }

  return (
    <div className="container">
      <h3>AI Detection</h3>
      <form onSubmit={submit}>
        <input type="file" onChange={e=>setFile(e.target.files[0])} />
        <button>Detect</button>
      </form>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
