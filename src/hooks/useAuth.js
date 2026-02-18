import { useState, useEffect, useContext, createContext } from 'react'
import { supabaseHelpers } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { user, error } = await supabaseHelpers.getCurrentUser()
        if (error) throw error
        setUser(user)
      } catch (error) {
        console.error('Session check error:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabaseHelpers.supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    setError('')
    setLoading(true)
    
    try {
      const { data, error } = await supabaseHelpers.signIn(email, password)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setError('')
    setLoading(true)
    
    try {
      const { error } = await supabaseHelpers.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    setError
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
