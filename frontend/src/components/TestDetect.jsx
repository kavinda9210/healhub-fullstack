import React, { useState, useContext, useEffect } from 'react'
import AuthContext from '../AuthContext'
import { detectImageAllMultipart, submitFeedbackMultipart } from '../api'
import { useAlert } from '../AlertContext'

export default function TestDetect(){
  const { token } = useContext(AuthContext)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [feedbackMode, setFeedbackMode] = useState(false)
  const [classes, setClasses] = useState([])
  const [selectedLabel, setSelectedLabel] = useState('')

  const { showAlert } = useAlert()

  useEffect(()=>{
    if (!file) { setPreview(null); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return ()=> URL.revokeObjectURL(url)
  }, [file])

  async function runDetect(){
    if(!file) { showAlert('Please choose an image','error'); return }
    setLoading(true)
    setResult(null)
    try{
      const res = await detectImageAllMultipart(token, file)
      if (res && res.status === 'error'){
        showAlert(res.message || 'Detection failed', 'error')
        setResult({ error: res.message })
      } else {
        // show detection
        setResult(res.data || res)
      }
    }catch(err){
      showAlert(err.message || 'Network error', 'error')
    }finally{ setLoading(false) }
  }

  async function loadClasses(){
    try{
      const st = await fetch('http://127.0.0.1:5000/api/patient/ai/status', { headers: { Authorization: `Bearer ${token}` } })
      const j = await st.json()
      setClasses(j.data && j.data.classes ? j.data.classes : [])
    }catch(_){ setClasses([]) }
  }

  async function submitFeedback(e){
    e.preventDefault()
    if(!file || !selectedLabel){ showAlert('Image and correct label required','error'); return }
    setLoading(true)
    try{
      const resp = await submitFeedbackMultipart(token, file, selectedLabel)
      if (resp && resp.status === 'error'){
        showAlert(resp.message || 'Feedback failed','error')
      } else {
        showAlert('Retraining complete (short run) and re-evaluated', 'success')
        setResult(resp.data && resp.data.detection_after_retrain ? resp.data.detection_after_retrain : resp.data)
        setFeedbackMode(false)
      }
    }catch(err){ showAlert(err.message || 'Network error','error') }
    finally{ setLoading(false) }
  }

  return (
    <div className="container">
      <h3>Test Detect (Patient)</h3>
      <div>
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
        <button disabled={loading} onClick={runDetect} style={{marginLeft:8}}>{loading? 'Running...' : 'Detect'}</button>
        <button style={{marginLeft:8}} onClick={()=>{ setFeedbackMode(!feedbackMode); if(!classes.length) loadClasses() }}>{feedbackMode? 'Hide Feedback':'Provide Feedback'}</button>
      </div>

      {preview && (
        <div style={{marginTop:12}}>
          <strong>Preview:</strong>
          <div>
            <img src={preview} alt="preview" style={{maxWidth:300, maxHeight:300, marginTop:8}} />
          </div>
        </div>
      )}

      {result && (
        <div style={{marginTop:12}}>
          <h4>Detection Result</h4>
          <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {feedbackMode && (
        <form onSubmit={submitFeedback} style={{marginTop:12}}>
          <label>Correct label:</label>
          <select value={selectedLabel} onChange={e=>setSelectedLabel(e.target.value)} style={{marginLeft:8}}>
            <option value="">-- choose --</option>
            {classes.map(c=>(<option key={c} value={c}>{c}</option>))}
          </select>
          <button disabled={loading} style={{marginLeft:8}}>{loading? 'Submitting...' : 'Submit Feedback & Retrain'}</button>
        </form>
      )}
    </div>
  )
}
