import React, { useContext, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import AuthContext from './AuthContext'
import Login from './components/Login'
import Register from './components/Register'
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
      <AppInner />
    </AuthProvider>
  )
}

function AppInner(){
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/detect" element={<Detect/>} />
        <Route path="/appointments" element={<Appointments/>} />
        <Route path="/reminders" element={<Reminders/>} />
        <Route path="/admin/users" element={<AdminUsers/>} />
      </Routes>
    </>
  )
}
