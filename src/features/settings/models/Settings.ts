export interface Setting {
  id: string
  key: string
  value: string
  description?: string
  type: 'string' | 'number' | 'boolean' | 'json'
  category: 'general' | 'donations' | 'notifications' | 'security' | 'appearance'
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    showProfile: boolean
    showDonations: boolean
  }
}
