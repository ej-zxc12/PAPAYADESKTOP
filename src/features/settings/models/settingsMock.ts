import type { Setting, UserSettings } from '../models/Settings'

export const settingsMock: Setting[] = [
  {
    id: 'SET-001',
    key: 'organizationName',
    value: 'Papaya Academy, Inc.',
    description: 'Name of the organization',
    type: 'string',
    category: 'general',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'SET-002',
    key: 'maxDonationPerTransaction',
    value: '100000',
    description: 'Maximum donation amount per transaction',
    type: 'number',
    category: 'donations',
    isPublic: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'SET-003',
    key: 'emailNotifications',
    value: 'true',
    description: 'Enable email notifications',
    type: 'boolean',
    category: 'notifications',
    isPublic: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

export const userSettingsMock: UserSettings = {
  theme: 'light',
  language: 'en',
  timezone: 'Asia/Manila',
  notifications: {
    email: true,
    push: true,
    sms: false
  },
  privacy: {
    showProfile: true,
    showDonations: false
  }
}
