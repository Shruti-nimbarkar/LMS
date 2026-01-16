import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(undefined)

export function LabManagementAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth
    const token = localStorage.getItem('labManagementAccessToken')
    const storedUser = localStorage.getItem('labManagementUser')
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem('labManagementAccessToken')
        localStorage.removeItem('labManagementUser')
      }
    } else {
      // For demo, set a default user
      const defaultUser = {
        id: 1,
        name: 'Lab User',
        email: 'lab@techlink.com',
        role: 'engineer'
      }
      setUser(defaultUser)
      localStorage.setItem('labManagementUser', JSON.stringify(defaultUser))
    }
    
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Mock login - in real app, call API
    const user = {
      id: 1,
      name: 'Lab User',
      email: email,
      role: 'engineer'
    }
    setUser(user)
    localStorage.setItem('labManagementAccessToken', 'mock-token')
    localStorage.setItem('labManagementUser', JSON.stringify(user))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('labManagementAccessToken')
    localStorage.removeItem('labManagementUser')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useLabManagementAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useLabManagementAuth must be used within a LabManagementAuthProvider')
  }
  return context
}
