import React, { createContext, useState, useEffect } from 'react'
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) localStorage.setItem('access_token', token)
    else localStorage.removeItem('access_token')
  }, [token])

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
