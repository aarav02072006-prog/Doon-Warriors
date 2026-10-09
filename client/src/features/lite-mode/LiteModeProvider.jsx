import React, { createContext, useContext, useState } from 'react'

const LiteModeContext = createContext(null)

export function LiteModeProvider({ children }) {
  const [isLite, setIsLite] = useState(false)

  const toggleLite = () => setIsLite((prev) => !prev)

  return (
    <LiteModeContext.Provider value={{ isLite, toggleLite }}>
      {children}
    </LiteModeContext.Provider>
  )
}

export function useLiteMode() {
  const context = useContext(LiteModeContext)
  if (!context) {
    throw new Error('useLiteMode must be used within a LiteModeProvider')
  }
  return context
}
