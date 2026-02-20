import type { Donation, DonationReport, OnlineDonation } from '../models/Donations'

export const donationsMock: Donation[] = [
  {
    id: 'DON-001',
    donorId: 'DR-001',
    campaignId: 'CP-001',
    amount: 5000,
    currency: 'PHP',
    method: 'GCash',
    status: 'Completed',
    date: '2024-01-15',
    reference: 'GCASH-12345',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'DON-002',
    donorId: 'DR-002',
    campaignId: 'CP-001',
    amount: 10000,
    currency: 'PHP',
    method: 'Bank Transfer',
    status: 'Completed',
    date: '2024-01-20',
    reference: 'BANK-67890',
    createdAt: '2024-01-20T14:15:00Z',
    updatedAt: '2024-01-20T14:15:00Z'
  }
]

export const donationReportsMock: DonationReport[] = [
  {
    id: 'RPT-001',
    title: 'January 2024 Donation Report',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    totalAmount: 15000,
    currency: 'PHP',
    donationCount: 2,
    averageDonation: 7500,
    topDonors: [
      { name: 'Maria Santos', amount: 10000 },
      { name: 'Juan Dela Cruz', amount: 5000 }
    ],
    campaigns: [
      { name: 'Scholarship Fund 2025', amount: 15000, percentage: 100 }
    ],
    generatedAt: '2024-02-01T09:00:00Z'
  }
]

export const onlineDonationsMock: OnlineDonation[] = [
  {
    id: 'ONL-001',
    amount: 2500,
    currency: 'PHP',
    donorInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+639123456789'
    },
    paymentMethod: 'gcash',
    campaign: 'Scholarship Fund 2025',
    isRecurring: false,
    status: 'completed',
    createdAt: '2024-01-25T16:45:00Z'
  }
]
