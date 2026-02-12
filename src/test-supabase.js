// Test file to verify Supabase connection
// Run this in your browser console or as a temporary component

import { supabase } from './lib/supabase.js'

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('campaigns').select('count').single()
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('📊 Campaigns count:', data)
    
    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError && authError.message !== 'No user logged in') {
      console.error('❌ Auth check failed:', authError.message)
    } else {
      console.log('✅ Authentication system ready')
    }
    
    return true
  } catch (err) {
    console.error('❌ Connection test failed:', err)
    return false
  }
}

// Export for testing
export { testSupabaseConnection }

// Auto-run when imported
testSupabaseConnection()
