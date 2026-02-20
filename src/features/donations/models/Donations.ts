export interface Donation {
  id: string
  donorId?: string
  campaignId?: string
  partnerId?: string
  amount: number
  currency: string
  country?: string
  method: 'Credit Card' | 'Bank Transfer' | 'GCash' | 'PayMaya' | 'Cash' | 'Other'
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded'
  date: string
  reference?: string
  gateway?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DonationReport {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  totalAmount: number
  currency: string
  donationCount: number
  averageDonation: number
  topDonors: {
    name: string
    amount: number
  }[]
  campaigns: {
    name: string
    amount: number
    percentage: number
  }[]
  generatedAt: string
}

export interface OnlineDonation {
  id: string
  amount: number
  currency: string
  donorInfo: {
    name: string
    email: string
    phone?: string
    address?: string
  }
  paymentMethod: 'credit-card' | 'bank-transfer' | 'gcash' | 'paymaya'
  campaign?: string
  isRecurring: boolean
  frequency?: 'monthly' | 'quarterly' | 'yearly'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
}
