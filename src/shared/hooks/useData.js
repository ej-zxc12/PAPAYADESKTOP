import { useState, useEffect, useCallback } from 'react'
import { supabaseHelpers } from '../../core/services/data'

export function useSupabaseData() {
  const [donations, setDonations] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [donors, setDonors] = useState([])
  const [partners, setPartners] = useState([])
  const [messages, setMessages] = useState([])
  const [sf10Students, setSf10Students] = useState([])
  const [sf10Records, setSf10Records] = useState([])
  const [alumni, setAlumni] = useState([])
  const [newsArticles, setNewsArticles] = useState([])
  const [loading, setLoading] = useState({})
  const [error, setError] = useState({})

  // Generic loading state manager
  const setLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }))
  }

  // Generic error state manager
  const setErrorState = (key, value) => {
    setError(prev => ({ ...prev, [key]: value }))
  }

  // Fetch donations
  const fetchDonations = useCallback(async () => {
    setLoadingState('donations', true)
    setErrorState('donations', null)
    
    try {
      const { data, error } = await supabaseHelpers.getDonations()
      if (error) throw error
      setDonations(data || [])
    } catch (error) {
      setErrorState('donations', error.message)
      console.error('Error fetching donations:', error)
    } finally {
      setLoadingState('donations', false)
    }
  }, [])

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    setLoadingState('campaigns', true)
    setErrorState('campaigns', null)
    
    try {
      const { data, error } = await supabaseHelpers.getCampaigns()
      if (error) throw error
      setCampaigns(data || [])
    } catch (error) {
      setErrorState('campaigns', error.message)
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoadingState('campaigns', false)
    }
  }, [])

  // Fetch donors
  const fetchDonors = useCallback(async () => {
    setLoadingState('donors', true)
    setErrorState('donors', null)
    
    try {
      const { data, error } = await supabaseHelpers.getDonors()
      if (error) throw error
      setDonors(data || [])
    } catch (error) {
      setErrorState('donors', error.message)
      console.error('Error fetching donors:', error)
    } finally {
      setLoadingState('donors', false)
    }
  }, [])

  // Fetch partners
  const fetchPartners = useCallback(async () => {
    setLoadingState('partners', true)
    setErrorState('partners', null)
    
    try {
      const { data, error } = await supabaseHelpers.getPartners()
      if (error) throw error
      setPartners(data || [])
    } catch (error) {
      setErrorState('partners', error.message)
      console.error('Error fetching partners:', error)
    } finally {
      setLoadingState('partners', false)
    }
  }, [])

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    setLoadingState('messages', true)
    setErrorState('messages', null)
    
    try {
      const { data, error } = await supabaseHelpers.getMessages()
      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      setErrorState('messages', error.message)
      console.error('Error fetching messages:', error)
    } finally {
      setLoadingState('messages', false)
    }
  }, [])

  // Create donation
  const createDonation = useCallback(async (donationData) => {
    setLoadingState('createDonation', true)
    setErrorState('createDonation', null)
    
    try {
      const { data, error } = await supabaseHelpers.createDonation(donationData)
      if (error) throw error
      
      // Refresh donations list
      await fetchDonations()
      return { success: true, data }
    } catch (error) {
      setErrorState('createDonation', error.message)
      return { success: false, error: error.message }
    } finally {
      setLoadingState('createDonation', false)
    }
  }, [fetchDonations])

  // Create campaign
  const createCampaign = useCallback(async (campaignData) => {
    setLoadingState('createCampaign', true)
    setErrorState('createCampaign', null)
    
    try {
      const { data, error } = await supabaseHelpers.createCampaign(campaignData)
      if (error) throw error
      
      // Refresh campaigns list
      await fetchCampaigns()
      return { success: true, data }
    } catch (error) {
      setErrorState('createCampaign', error.message)
      return { success: false, error: error.message }
    } finally {
      setLoadingState('createCampaign', false)
    }
  }, [fetchCampaigns])

  // Update donation
  const updateDonation = useCallback(async (id, updates) => {
    setLoadingState('updateDonation', true)
    setErrorState('updateDonation', null)
    
    try {
      const { data, error } = await supabaseHelpers.updateDonation(id, updates)
      if (error) throw error
      
      // Refresh donations list
      await fetchDonations()
      return { success: true, data }
    } catch (error) {
      setErrorState('updateDonation', error.message)
      return { success: false, error: error.message }
    } finally {
      setLoadingState('updateDonation', false)
    }
  }, [fetchDonations])

  // Delete donation
  const deleteDonation = useCallback(async (id) => {
    setLoadingState('deleteDonation', true)
    setErrorState('deleteDonation', null)
    
    try {
      const { error } = await supabaseHelpers.deleteDonation(id)
      if (error) throw error
      
      // Refresh donations list
      await fetchDonations()
      return { success: true }
    } catch (error) {
      setErrorState('deleteDonation', error.message)
      return { success: false, error: error.message }
    } finally {
      setLoadingState('deleteDonation', false)
    }
  }, [fetchDonations])

  // Update message read status
  const updateMessage = useCallback(async (id, updates) => {
    setLoadingState('updateMessage', true)
    setErrorState('updateMessage', null)
    
    try {
      const { data, error } = await supabaseHelpers.updateMessage(id, updates)
      if (error) throw error
      
      // Refresh messages list
      await fetchMessages()
      return { success: true, data }
    } catch (error) {
      setErrorState('updateMessage', error.message)
      return { success: false, error: error.message }
    } finally {
      setLoadingState('updateMessage', false)
    }
  }, [fetchMessages])

  // Set up real-time subscriptions
  useEffect(() => {
    const subscriptions = []

    // Subscribe to donations changes
    const donationsSub = supabaseHelpers.subscribeToTable('donations', (payload) => {
      console.log('Donations change:', payload)
      fetchDonations()
    })
    subscriptions.push(donationsSub)

    // Subscribe to campaigns changes
    const campaignsSub = supabaseHelpers.subscribeToTable('campaigns', (payload) => {
      console.log('Campaigns change:', payload)
      fetchCampaigns()
    })
    subscriptions.push(campaignsSub)

    // Subscribe to messages changes
    const messagesSub = supabaseHelpers.subscribeToTable('messages', (payload) => {
      console.log('Messages change:', payload)
      fetchMessages()
    })
    subscriptions.push(messagesSub)

    // Initial data fetch
    fetchDonations()
    fetchCampaigns()
    fetchDonors()
    fetchPartners()
    fetchMessages()

    // Cleanup subscriptions
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe())
    }
  }, [fetchDonations, fetchCampaigns, fetchDonors, fetchPartners, fetchMessages])

  return {
    // Data
    donations,
    campaigns,
    donors,
    partners,
    messages,
    sf10Students,
    sf10Records,
    alumni,
    newsArticles,
    
    // Loading states
    loading,
    
    // Error states
    error,
    
    // Actions
    fetchDonations,
    fetchCampaigns,
    fetchDonors,
    fetchPartners,
    fetchMessages,
    createDonation,
    createCampaign,
    updateDonation,
    deleteDonation,
    updateMessage,
  }
}
