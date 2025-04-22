"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Einfaches Passwort für die Authentifizierung
// In einer Produktionsumgebung sollte dies sicherer implementiert werden
const ADMIN_PASSWORD = "admin123"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Beim ersten Laden prüfen, ob ein Token im localStorage vorhanden ist
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token === "authenticated") {
      setIsAuthenticated(true)
    }
  }, [])

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("auth_token", "authenticated")
      return true
    }
    return false
  }

  const logout = (): void => {
    setIsAuthenticated(false)
    localStorage.removeItem("auth_token")
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
