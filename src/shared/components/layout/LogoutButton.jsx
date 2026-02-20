import React from 'react'
import { useAuth } from '../hooks/useAuth'

export default function LogoutButton() {
  const { signOut } = useAuth()

  const handleLogout = async () => {
    const result = await signOut()
    if (result.success) {
      // Handle successful logout (e.g., redirect to login)
      console.log('Logged out successfully')
    } else {
      console.error('Logout failed:', result.error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      <span>Logout</span>
    </button>
  )
}
