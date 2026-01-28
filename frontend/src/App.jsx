import React, { useContext, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import AuthContext from './AuthContext'
import { AlertProvider, useAlert } from './AlertContext'
import Login from './components/Login'
import Register from './components/Register'
import VerifyEmail from './components/VerifyEmail'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import Profile from './components/Profile'
import Detect from './components/Detect'
import Appointments from './components/Appointments'
import Reminders from './components/Reminders'
import AdminUsers from './components/AdminUsers'

function Nav() {
  const { token, setToken } = useContext(AuthContext)
  const navigate = useNavigate()
  return (
    <div className="nav">
      <Link to="/">Home</Link>
      {!token && <Link to="/login">Login</Link>}
      {!token && <Link to="/register">Register</Link>}
      {!token && <Link to="/verify-email">Verify Email</Link>}
      {!token && <Link to="/forgot-password">Forgot Password</Link>}
      {token && <Link to="/profile">Profile</Link>}
      {token && <Link to="/detect">Detect</Link>}
      {token && <Link to="/appointments">Appointments</Link>}
      {token && <Link to="/reminders">Reminders</Link>}
      {token && <Link to="/admin/users">Admin</Link>}
      {token && (
        <button className="small" onClick={() => { setToken(null); navigate('/') }}>Logout</button>
      )}
    </div>
  )
}

function Home(){
  return <div className="container"><h2>HealHub Frontend</h2><p>Use the navigation to test features.</p></div>
}

export default function AppWrapper(){
  return (
    <AuthProvider>
      <AlertProvider>
        <AppInner />
      </AlertProvider>
    </AuthProvider>
  )
}

function AlertBox(){
  const { alert } = useAlert() || {}
  if (!alert) return null
  const bg = alert.type === 'error' ? '#f88' : alert.type === 'success' ? '#8f8' : '#eef'
  return (
    <div style={{ position:'fixed', top:10, right:10, padding:'12px 16px', background:bg, border:'1px solid #ccc', borderRadius:6, zIndex:9999 }}>
      {alert.message}
    </div>
  )
}

function AppInner(){
  return (
    <>
      <Nav />
      <AlertBox />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/verify-email" element={<VerifyEmail/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/detect" element={<Detect/>} />
        <Route path="/appointments" element={<Appointments/>} />
        <Route path="/reminders" element={<Reminders/>} />
        <Route path="/admin/users" element={<AdminUsers/>} />
        <Route path="/verify-email" element={<VerifyEmail/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
        <Route path="/reset-password" element={<ResetPassword/>} />
      </Routes>
    </>
  )
}
