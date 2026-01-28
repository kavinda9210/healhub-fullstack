const BASE = 'http://127.0.0.1:5000'

function jsonHeaders(token) {
  const h = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

export async function register(payload) {
  const res = await fetch(`${BASE}/api/auth/register`, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload) })
  return res.json()
}

export async function login(payload) {
  const res = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload) })
  return res.json()
}

export async function getProfile(token) {
  const res = await fetch(`${BASE}/api/auth/profile`, { headers: jsonHeaders(token) })
  return res.json()
}

export async function uploadProfilePicture(token, file) {
  const fd = new FormData();
  fd.append('image', file)
  const res = await fetch(`${BASE}/api/auth/profile-picture`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
  return res.json()
}

export async function detectImageMultipart(token, file) {
  const fd = new FormData();
  fd.append('image', file)
  const res = await fetch(`${BASE}/api/patient/detect`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
  return res.json()
}

export async function detectImageBase64(token, base64) {
  const res = await fetch(`${BASE}/api/patient/detect`, { method: 'POST', headers: jsonHeaders(token), body: JSON.stringify({ imageBase64: base64 }) })
  return res.json()
}

export async function getSlots(token, doctorId, date) {
  const url = new URL(`${BASE}/api/appointment/slots`)
  url.searchParams.set('doctorId', doctorId)
  url.searchParams.set('date', date)
  const res = await fetch(url.toString(), { headers: jsonHeaders(token) })
  return res.json()
}

export async function bookAppointment(token, payload) {
  const res = await fetch(`${BASE}/api/appointment/book`, { method: 'POST', headers: jsonHeaders(token), body: JSON.stringify(payload) })
  return res.json()
}

export async function listReminders(token) {
  const res = await fetch(`${BASE}/api/reminder/`, { headers: jsonHeaders(token) })
  return res.json()
}

export async function createReminder(token, payload) {
  const res = await fetch(`${BASE}/api/reminder/`, { method: 'POST', headers: jsonHeaders(token), body: JSON.stringify(payload) })
  return res.json()
}

export async function listUsers(token) {
  const res = await fetch(`${BASE}/api/admin/users`, { headers: jsonHeaders(token) })
  return res.json()
}

export async function createUser(token, payload) {
  const res = await fetch(`${BASE}/api/admin/users`, { method: 'POST', headers: jsonHeaders(token), body: JSON.stringify(payload) })
  return res.json()
}

export default { BASE }
