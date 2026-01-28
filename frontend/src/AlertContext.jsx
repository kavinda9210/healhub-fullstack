import React, { createContext, useState, useContext, useCallback } from 'react'

const AlertContext = createContext()

export function AlertProvider({ children }){
  const [alert, setAlert] = useState(null)

  const showAlert = useCallback((message, type='info', timeout=4000) => {
    setAlert({ message, type })
    if (timeout) setTimeout(()=> setAlert(null), timeout)
  }, [])

  const clear = useCallback(()=> setAlert(null), [])

  return (
    <AlertContext.Provider value={{ alert, showAlert, clear }}>
      {children}
    </AlertContext.Provider>
  )
}

export function useAlert(){
  return useContext(AlertContext)
}

export default AlertContext
