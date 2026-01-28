const BASE = 'http://127.0.0.1:5000'

function jsonHeaders(token) {
  const h = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

async function handleResponse(res) {
  const ct = res.headers.get('content-type') || ''
  let json = null
  if (ct.includes('application/json')) {
    try { json = await res.json() } catch (e) { json = null }
  }
  if (!res.ok) {
    return {
      status: 'error',
      message: (json && (json.message || json.msg)) || res.statusText || 'Request failed',
      errors: (json && json.errors) || null,
      statusCode: res.status,
      raw: json
    }
  }
  return json || { status: 'success' }
}

async function safeFetch(url, opts) {
  try {
    const res = await fetch(url, opts)
    return await handleResponse(res)
  } catch (err) {
    return { status: 'error', message: err.message || 'Network error' }
  }
}

export async function register(payload) {
  return safeFetch(`${BASE}/api/auth/register`, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload) })
}

export async function login(payload) {
  return safeFetch(`${BASE}/api/auth/login`, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload) })
}

export async function verifyEmail(payload) {
  return safeFetch(`${BASE}/api/auth/verify-email`, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload) })
}

export async function resendVerification(payload) {
  return safeFetch(`${BASE}/api/auth/resend-verification`, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload) })
}

export async function forgotPassword(payload) {
  return safeFetch(`${BASE}/api/auth/forgot-password`, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload) })
}

export async function resetPassword(payload) {
  return safeFetch(`${BASE}/api/auth/reset-password`, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload) })
}

export async function getProfile(token) {
  return safeFetch(`${BASE}/api/auth/profile`, { headers: jsonHeaders(token) })
}

export async function uploadProfilePicture(token, file) {
  const fd = new FormData();
  fd.append('image', file)
  try {
    const res = await fetch(`${BASE}/api/auth/profile-picture`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
    return await handleResponse(res)
  } catch (err) {
    return { status: 'error', message: err.message || 'Network error' }
  }
}

export async function detectImageMultipart(token, file) {
  const fd = new FormData();
  fd.append('image', file)
  try {
    const res = await fetch(`${BASE}/api/patient/detect`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
    return await handleResponse(res)
  } catch (err) {
    return { status: 'error', message: err.message || 'Network error' }
  }
}

export async function detectImageBase64(token, base64) {
  return safeFetch(`${BASE}/api/patient/detect`, { method: 'POST', headers: jsonHeaders(token), body: JSON.stringify({ imageBase64: base64 }) })
}

export async function getSlots(token, doctorId, date) {
  const url = new URL(`${BASE}/api/appointment/slots`)
  if (doctorId) url.searchParams.set('doctorId', doctorId)
  if (date) url.searchParams.set('date', date)
  return safeFetch(url.toString(), { headers: jsonHeaders(token) })
}

export async function bookAppointment(token, payload) {
  return safeFetch(`${BASE}/api/appointment/book`, { method: 'POST', headers: jsonHeaders(token), body: JSON.stringify(payload) })
}

export async function listReminders(token) {
  return safeFetch(`${BASE}/api/reminder/`, { headers: jsonHeaders(token) })
}

export async function createReminder(token, payload) {
  return safeFetch(`${BASE}/api/reminder/`, { method: 'POST', headers: jsonHeaders(token), body: JSON.stringify(payload) })
}

export async function listUsers(token) {
  return safeFetch(`${BASE}/api/admin/users`, { headers: jsonHeaders(token) })
}

export async function createUser(token, payload) {
  return safeFetch(`${BASE}/api/admin/users`, { method: 'POST', headers: jsonHeaders(token), body: JSON.stringify(payload) })
}

export default { BASE }
