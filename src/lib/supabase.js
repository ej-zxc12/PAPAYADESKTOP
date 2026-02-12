import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const supabaseHelpers = {
  // Authentication
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Donations
  async getDonations() {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        donors (name, email),
        campaigns (name),
        partners (name)
      `)
      .order('date', { ascending: false })
    return { data, error }
  },

  async createDonation(donationData) {
    const { data, error } = await supabase
      .from('donations')
      .insert(donationData)
      .select()
    return { data, error }
  },

  async updateDonation(id, updates) {
    const { data, error } = await supabase
      .from('donations')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async deleteDonation(id) {
    const { error } = await supabase
      .from('donations')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Campaigns/Programs
  async getCampaigns() {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createCampaign(campaignData) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
    return { data, error }
  },

  async updateCampaign(id, updates) {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Donors
  async getDonors() {
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createDonor(donorData) {
    const { data, error } = await supabase
      .from('donors')
      .insert(donorData)
      .select()
    return { data, error }
  },

  // Partners
  async getPartners() {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createPartner(partnerData) {
    const { data, error } = await supabase
      .from('partners')
      .insert(partnerData)
      .select()
    return { data, error }
  },

  // Messages
  async getMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('received_at', { ascending: false })
    return { data, error }
  },

  async updateMessage(id, updates) {
    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Real-time subscriptions
  subscribeToTable(tableName, callback) {
    return supabase
      .channel(`public:${tableName}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: tableName },
        callback
      )
      .subscribe()
  }
}
