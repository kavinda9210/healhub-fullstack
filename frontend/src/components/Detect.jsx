import React, { useState, useContext, useEffect } from 'react'
import AuthContext from '../AuthContext'
import { detectImageMultipart } from '../api'
import { useAlert } from '../AlertContext'

export default function Detect(){
  const { token } = useContext(AuthContext)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const { showAlert } = useAlert()

  useEffect(()=>{
    if (!file) { setPreview(null); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return ()=> URL.revokeObjectURL(url)
  }, [file])

  async function submit(e){
    e.preventDefault()
    if(!file) { showAlert('Please choose an image','error'); return }
    setLoading(true)
    setResult(null)
    try{
      const res = await detectImageMultipart(token, file)
      if (res && res.status === 'error'){
        showAlert(res.message || 'Detection failed', 'error')
        setResult(res)
      } else {
        // also fetch raw probabilities to show top-N and decide "no issue"
        let raw = null
        try{
          const rawRes = await detectImageRawMultipart(token, file)
          if (rawRes && rawRes.status === 'success') raw = rawRes.data
        }catch(_){ raw = null }

        showAlert('Detection completed', 'success')
        setResult({ api: res, raw })
      }
    }catch(err){
      showAlert(err.message || 'Network error', 'error')
      setResult({ status: 'error', message: err.message })
    }finally{
      setLoading(false)
    }
  }

  function renderDetection(apiResult, raw){
    if(!apiResult) return null
    const det = (apiResult.data && apiResult.data.detection) || apiResult
    const CONFIDENT_THRESHOLD = 0.8

    // class grouping for simple "Wound" vs "Rash" identification
    const woundSet = new Set(['Diabetic Foot Ulcer','Pressure Ulcers','Burns'])
    const rashSet = new Set(['Eczema','Fungal Infection','Herpes Rash','Contact Dermatitis','Hives','Psoriasis','Chickenpox','Impetigo','Acne','Cellulitis'])

    // determine final status
    let confident = (det.confidence || 0) >= CONFIDENT_THRESHOLD
    let issueType = 'Unknown'
    if (det.label && woundSet.has(det.label)) issueType = 'Wound'
    else if (det.label && rashSet.has(det.label)) issueType = 'Rash'

    return (
      <div style={{marginTop:12}}>
        <h4>Detection</h4>
        {!confident && <div style={{color:'#b36'}}>No clear wound or rash detected (low confidence)</div>}
        <p><strong>Top label:</strong> {det.label || 'Unknown'}</p>
        <p><strong>Confidence:</strong> {Math.round((det.confidence||0)*100)}% {confident? '(confident)':''}</p>
        <p><strong>Type:</strong> {issueType}</p>
        {det.treatments && (
          <div>
            <strong>Treatments:</strong>
            <ul>{det.treatments.map((t,i)=>(<li key={i}>{t}</li>))}</ul>
          </div>
        )}
        {det.specialization && <p><strong>Specialization:</strong> {det.specialization}</p>}

        {raw && raw.classes && raw.probs && (
          <div style={{marginTop:8}}>
            <strong>Top predictions:</strong>
            <ol>
              {raw.classes.map((c,i)=>({c, p: raw.probs[i]})).sort((a,b)=>b.p-a.p).slice(0,3).map((it,idx)=>(
                <li key={idx}>{it.c} — {Math.round(it.p*100)}%</li>
              ))}
            </ol>
            <small>Low top probability implies no clear wound/rash detected.</small>
          </div>
        )}
      </div>
    )
  }

  function renderDoctors(d){
    if(!d) return null
    const docs = d.doctors || []
    if(!docs.length) return null
    return (
      <div style={{marginTop:12}}>
        <h4>Recommended Doctors</h4>
        <ul>
          {docs.map((doc, i)=>(
            <li key={i}>{doc.name || doc.full_name || doc.email || JSON.stringify(doc)}</li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="container">
      <h3>AI Detection</h3>
      <form onSubmit={submit}>
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
        <button disabled={loading} style={{marginLeft:8}}>{loading? 'Detecting...' : 'Detect'}</button>
      </form>

      {preview && (
        <div style={{marginTop:12}}>
          <strong>Preview:</strong>
          <div>
            <img src={preview} alt="preview" style={{maxWidth:300, maxHeight:300, marginTop:8}} />
          </div>
        </div>
      )}

      {result && result.status === 'error' && (
        <div style={{marginTop:12,color:'red'}}><strong>Error:</strong> {result.message}</div>
      )}

      {result && result.api && result.api.status === 'success' && (
        <div style={{marginTop:12}}>
          {renderDetection(result.api, result.raw)}
          {renderDoctors(result.api.data)}
        </div>
      )}

      {/* fallback raw output for debugging */}
      {result && result.status !== 'success' && result.status !== 'error' && <pre style={{marginTop:12}}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
