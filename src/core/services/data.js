const createNotConfiguredError = () => {
  const error = new Error('Supabase has been removed from this project.')
  error.name = 'SupabaseRemovedError'
  return error
}

export const supabase = null

export const supabaseHelpers = {
  supabase,

  async signIn() {
    return { data: null, error: createNotConfiguredError() }
  },

  async signOut() {
    return { error: createNotConfiguredError() }
  },

  async getCurrentUser() {
    return { user: null, error: null }
  },

  async getDonations() {
    return { data: [], error: null }
  },

  async createDonation() {
    return { data: null, error: createNotConfiguredError() }
  },

  async updateDonation() {
    return { data: null, error: createNotConfiguredError() }
  },

  async deleteDonation() {
    return { error: createNotConfiguredError() }
  },

  async getCampaigns() {
    return { data: [], error: null }
  },

  async createCampaign() {
    return { data: null, error: createNotConfiguredError() }
  },

  async updateCampaign() {
    return { data: null, error: createNotConfiguredError() }
  },

  async getDonors() {
    return { data: [], error: null }
  },

  async createDonor() {
    return { data: null, error: createNotConfiguredError() }
  },

  async getPartners() {
    return { data: [], error: null }
  },

  async createPartner() {
    return { data: null, error: createNotConfiguredError() }
  },

  async getMessages() {
    return { data: [], error: null }
  },

  async updateMessage() {
    return { data: null, error: createNotConfiguredError() }
  },

  subscribeToTable() {
    return { unsubscribe() {} }
  },
}
