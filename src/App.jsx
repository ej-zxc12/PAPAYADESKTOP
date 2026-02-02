import React, { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  FiHome,
  FiUsers,
  FiGift,
  FiBriefcase,
  FiUser,
  FiMail,
  FiSettings,
  FiLogOut,
  FiBell,
  FiSearch,
} from 'react-icons/fi'
import papayaLogo from './assets/logo.jpg'

const initialDonors = [
  { id: 'DR-001', name: 'Juan Dela Cruz', email: 'juan@example.com' },
  { id: 'DR-002', name: 'Maria Santos', email: 'maria@example.com' },
  { id: 'DR-003', name: 'ABC Foundation', email: 'contact@abcfoundation.org' },
  { id: 'DR-004', name: 'Anonymous', email: '-' },
  { id: 'DR-005', name: 'John Smith', email: 'john.smith@example.com' },
  { id: 'DR-006', name: 'Anna de Vries', email: 'anna.devries@example.nl' },
]

const initialCampaigns = [
  { id: 'CP-001', name: 'Scholarship Fund 2025', targetAmount: 500000, status: 'Active' },
  { id: 'CP-002', name: 'Medical Assistance', targetAmount: 250000, status: 'Completed' },
  { id: 'CP-003', name: 'School Building', targetAmount: 1000000, status: 'Active' },
]

const initialPartnerOrganizations = [
  {
    id: 'PT-001',
    name: 'ABC Foundation',
    contact: 'Juan Reyes',
    type: 'Cash',
    status: 'Active',
  },
  {
    id: 'PT-002',
    name: 'XYZ Corporation',
    contact: 'Ana Lim',
    type: 'Sponsorship',
    status: 'Active',
  },
  {
    id: 'PT-003',
    name: 'HealthCare PH',
    contact: 'Dr. Robles',
    type: 'In-kind',
    status: 'Inactive',
  },
]

const initialDonations = [
  {
    id: 'DN-001',
    donorId: 'DR-001',
    donorName: 'Juan Dela Cruz',
    campaignId: 'CP-001',
    campaignName: 'Scholarship Fund 2025',
    partnerId: 'PT-001',
    amount: 5000,
    currency: 'PHP',
    country: 'Philippines',
    method: 'Credit Card',
    status: 'Completed',
    date: '2025-01-12',
    reference: 'REF-20250112-0001',
    gateway: 'Stripe',
  },
  {
    id: 'DN-002',
    donorId: 'DR-004',
    donorName: 'Anonymous',
    campaignId: 'CP-002',
    campaignName: 'Medical Assistance',
    partnerId: 'PT-002',
    amount: 2500,
    currency: 'PHP',
    country: 'Philippines',
    method: 'GCash',
    status: 'Pending',
    date: '2025-01-15',
    reference: 'REF-20250115-0002',
    gateway: 'Xendit',
  },
  {
    id: 'DN-003',
    donorId: 'DR-002',
    donorName: 'Maria Santos',
    campaignId: 'CP-003',
    campaignName: 'School Building',
    partnerId: 'PT-003',
    amount: 12000,
    currency: 'PHP',
    country: 'Philippines',
    method: 'Bank Transfer',
    status: 'Failed',
    date: '2025-01-18',
    reference: 'REF-20250118-0003',
    gateway: 'PayMongo',
  },
  {
    id: 'DN-004',
    donorId: 'DR-001',
    donorName: 'Juan Dela Cruz',
    campaignId: 'CP-001',
    campaignName: 'Scholarship Fund 2025',
    partnerId: 'PT-001',
    amount: 8000,
    currency: 'PHP',
    country: 'Philippines',
    method: 'Credit Card',
    status: 'Completed',
    date: '2025-02-05',
    reference: 'REF-20250205-0004',
    gateway: 'Stripe',
  },
  {
    id: 'DN-005',
    donorId: 'DR-002',
    donorName: 'Maria Santos',
    campaignId: 'CP-002',
    campaignName: 'Medical Assistance',
    partnerId: 'PT-002',
    amount: 6000,
    currency: 'PHP',
    country: 'Philippines',
    method: 'GCash',
    status: 'Completed',
    date: '2025-02-10',
    reference: 'REF-20250210-0005',
    gateway: 'Xendit',
  },
  {
    id: 'DN-006',
    donorId: 'DR-003',
    donorName: 'ABC Foundation',
    campaignId: 'CP-003',
    campaignName: 'School Building',
    partnerId: 'PT-003',
    amount: 50000,
    currency: 'PHP',
    country: 'Philippines',
    method: 'Bank Transfer',
    status: 'Completed',
    date: '2025-03-02',
    reference: 'REF-20250302-0006',
    gateway: 'Bank',
  },
  {
    id: 'DN-007',
    donorId: 'DR-005',
    donorName: 'John Smith',
    campaignId: 'CP-001',
    campaignName: 'Scholarship Fund 2025',
    partnerId: 'PT-001',
    amount: 200,
    currency: 'USD',
    country: 'United States',
    method: 'Credit Card',
    status: 'Completed',
    date: '2025-03-10',
    reference: 'REF-20250310-0007',
    gateway: 'Stripe',
  },
  {
    id: 'DN-008',
    donorId: 'DR-006',
    donorName: 'Anna de Vries',
    campaignId: 'CP-003',
    campaignName: 'School Building',
    partnerId: 'PT-003',
    amount: 150,
    currency: 'EUR',
    country: 'Netherlands',
    method: 'Bank Transfer',
    status: 'Completed',
    date: '2025-03-15',
    reference: 'REF-20250315-0008',
    gateway: 'Bank',
  },
]

const initialMessages = [
  {
    id: 'MS-001',
    fromName: 'Juan Dela Cruz',
    fromEmail: 'juan@example.com',
    subject: 'Question about scholarship requirements',
    body: 'Hi, I would like to ask about the requirements for the scholarship program this year.',
    receivedAt: '2025-01-20T09:15:00',
    read: false,
  },
  {
    id: 'MS-002',
    fromName: 'Maria Santos',
    fromEmail: 'maria@example.com',
    subject: 'Donation receipt request',
    body: 'Good day, may I request an official receipt for my latest donation?',
    receivedAt: '2025-01-22T14:30:00',
    read: true,
  },
  {
    id: 'MS-003',
    fromName: 'Website Visitor',
    fromEmail: 'visitor@example.com',
    subject: 'Inquiry about partnership',
    body: 'Hello, we are interested in partnering with Papaya Academy for a CSR initiative.',
    receivedAt: '2025-01-25T11:05:00',
    read: false,
  },
]

const initialNotifications = [
  {
    id: 'NT-001',
    type: 'Donation',
    message: 'New donation received for Scholarship Fund 2025 (₱5,000).',
    time: '2 min ago',
    createdAt: '2025-01-26T10:30:00',
    read: false,
    entityType: 'donation',
    entityId: 'DN-001',
  },
  {
    id: 'NT-002',
    type: 'Failed Payment',
    message: 'Payment attempt failed for Medical Assistance campaign.',
    time: '10 min ago',
    createdAt: '2025-01-26T10:20:00',
    read: false,
    entityType: 'donation',
    entityId: 'DN-003',
  },
  {
    id: 'NT-003',
    type: 'Campaign',
    message: 'Medical Assistance campaign has reached its target.',
    time: '1 hr ago',
    createdAt: '2025-01-26T09:30:00',
    read: true,
    entityType: 'campaign',
    entityId: 'CP-002',
  },
]

const initialSettings = {
  organizationName: 'Papaya Academy, Inc.',
  address: '',
  currency: 'PHP',
  maxDonationPerTransaction: '',
  gatewayApiKey: '',
  webhookUrl: '',
  requireTwoFactor: false,
  notifyOnFailedLogin: true,
}

const chartDataByYear = {
  '2025': [
    { month: 'Jan', donations: 18000, disbursements: 9000 },
    { month: 'Feb', donations: 22000, disbursements: 14000 },
    { month: 'Mar', donations: 19500, disbursements: 15000 },
    { month: 'Apr', donations: 24500, disbursements: 18000 },
    { month: 'May', donations: 21000, disbursements: 16500 },
    { month: 'Jun', donations: 26000, disbursements: 19000 },
    { month: 'Jul', donations: 23000, disbursements: 17500 },
  ],
  '2024': [
    { month: 'Jan', donations: 15000, disbursements: 8000 },
    { month: 'Feb', donations: 17000, disbursements: 9000 },
    { month: 'Mar', donations: 16000, disbursements: 9500 },
    { month: 'Apr', donations: 19000, disbursements: 11000 },
    { month: 'May', donations: 18500, disbursements: 10500 },
    { month: 'Jun', donations: 20000, disbursements: 12000 },
    { month: 'Jul', donations: 21000, disbursements: 13000 },
  ],
}

const partners = [
  { name: 'Google', label: 'Technology company' },
  { name: 'Microsoft', label: 'Technology company' },
  { name: 'Amazon', label: 'Technology company' },
  { name: 'Kickstarter', label: 'Funding platform' },
  { name: 'Zapier', label: 'Technology company' },
  { name: 'Patreon', label: 'Business tools' },
  { name: 'Framer', label: 'Design tool' },
  { name: 'Autodesk', label: 'Software company' },
]

const conversations = [
  { name: 'Albert Flores', message: 'Fringilla sit morbi tincidunt augue.', time: '2 m ago' },
  { name: 'Ronald Richards', message: 'Curabitur in tempus imperdiet nulla.', time: '16 m ago' },
  { name: 'Dianne Russell', message: 'Sed velit ut tortor pretium.', time: '1 h ago' },
  { name: 'Cameron Williamson', message: 'Magna in arcu cursus euismod.', time: '1 h ago' },
  { name: 'Annette Black', message: 'Duis at volutpat leo euismod.', time: '2 h ago' },
]

const navItems = [
  { icon: FiHome, label: 'Dashboard', key: 'dashboard' },
  { icon: FiGift, label: 'Donations', key: 'donations' },
  { icon: FiBriefcase, label: 'Donation Campaigns', key: 'campaigns' },
  { icon: FiUsers, label: 'Donors', key: 'donors' },
  { icon: FiUsers, label: 'Reports', key: 'reports' },
  { icon: FiUsers, label: 'Corporate / Institutional Partners', key: 'partners' },
  { icon: FiMail, label: 'Messages / Inquiries', key: 'messages' },
  { icon: FiBell, label: 'Notifications', key: 'notifications' },
  { icon: FiSettings, label: 'Settings', key: 'settings' },
  { icon: FiLogOut, label: 'Logout', key: 'logout' },
]

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState('2025')
  const [activePage, setActivePage] = useState('dashboard')

  const [donations, setDonations] = useState(initialDonations)
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [partners, setPartners] = useState(initialPartnerOrganizations)
  const [donors] = useState(initialDonors)
  const [messages, setMessages] = useState(initialMessages)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [settings, setSettings] = useState(initialSettings)

  const [selectedDonationId, setSelectedDonationId] = useState(null)
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)
  const [selectedDonorId, setSelectedDonorId] = useState(null)
  const [selectedPartnerId, setSelectedPartnerId] = useState(null)
  const [selectedMessageId, setSelectedMessageId] = useState(null)

  const [isSavingSettings, setIsSavingSettings] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('papaya-settings')
      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings((prev) => ({ ...prev, ...parsed }))
      }
    } catch {
    }
  }, [])

  const addNotification = ({ type, message, entityType, entityId }) => {
    const now = new Date()
    const id = `NT-${String(notifications.length + 1).padStart(3, '0')}`
    const time = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })

    setNotifications((prev) => [
      {
        id,
        type,
        message,
        time,
        createdAt: now.toISOString(),
        read: false,
        entityType,
        entityId,
      },
      ...prev,
    ])
  }

  const handleLogin = (event) => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      const isValid = email === 'admin@papaya.com' && password === 'admin123'

      if (isValid) {
        setIsLoggedIn(true)
        setIsLoading(false)
        try {
          window.sessionStorage.setItem('papaya-auth', 'logged-in')
        } catch {
        }
        setActivePage('dashboard')
        setSelectedDonationId(null)
        setSelectedCampaignId(null)
        setSelectedDonorId(null)
        setSelectedPartnerId(null)
        setSelectedMessageId(null)
      } else {
        setError('Invalid email or password.')
        setIsLoading(false)
      }
    }, 800)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setEmail('')
    setPassword('')
    setError('')
    setIsLoading(false)
    setActivePage('dashboard')
    setSelectedDonationId(null)
    setSelectedCampaignId(null)
    setSelectedDonorId(null)
    setSelectedPartnerId(null)
    setSelectedMessageId(null)
    try {
      window.sessionStorage.removeItem('papaya-auth')
    } catch {
    }
  }

  const confirmAndLogout = () => {
    const confirmed = window.confirm('Are you sure you want to log out?')
    if (confirmed) {
      handleLogout()
    }
  }

  const chartData = buildChartData(donations, selectedYear)

  const totalDonationsYear = chartData.reduce((sum, entry) => sum + entry.donations, 0)

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'short' })
  const currentMonthData =
    chartData.find((entry) => entry.month === currentMonthName) || chartData[chartData.length - 1] || null
  const totalDonationsMonth = currentMonthData ? currentMonthData.donations : 0

  const donorsWithStats = buildDonorStats(donors, donations)
  const activeCampaignCount = campaigns.filter((campaign) => campaign.status === 'Active').length
  const registeredDonorsCount = donorsWithStats.length

  const unreadNotificationsCount = notifications.filter((notification) => !notification.read).length

  const donorsById = donorsWithStats.reduce((index, donor) => {
    index[donor.id] = donor
    return index
  }, {})

  const campaignStats = buildCampaignStats(campaigns, donations)

  const pageTitleMap = {
    dashboard: 'Dashboard',
    donations: 'Donations',
    campaigns: 'Donation Campaigns',
    donors: 'Donors',
    reports: 'Reports',
    partners: 'Corporate / Institutional Partners',
    messages: 'Messages / Inquiries',
    notifications: 'Notifications',
    settings: 'Settings',
  }

  const pageSubtitleMap = {
    dashboard: 'Overview of your donations and donors',
    donations: 'Manage individual donations and payments',
    campaigns: 'Manage donation campaigns and targets',
    donors: 'Manage registered donors and giving history',
    reports: 'View summaries and export donation reports',
    partners: 'Manage corporate and institutional partners',
    messages: 'View and respond to donor inquiries and messages',
    notifications: 'Review donation and campaign notifications',
    settings: 'Configure payment gateways and organization info',
  }

  const headerTitle = pageTitleMap[activePage]
  const headerSubtitle = pageSubtitleMap[activePage]

  const handleSelectDonation = (donationId) => {
    setSelectedDonationId(donationId)
    setActivePage('donations')
  }

  const handleSelectCampaign = (campaignId) => {
    setSelectedCampaignId(campaignId)
    setActivePage('campaigns')
  }

  const handleSelectDonor = (donorId) => {
    setSelectedDonorId(donorId)
    setActivePage('donors')
  }

  const handleSelectPartner = (partnerId) => {
    setSelectedPartnerId(partnerId)
    setActivePage('partners')
  }

  const handleSelectMessage = (messageId) => {
    setSelectedMessageId(messageId)
    setActivePage('messages')
  }

  const handleToggleMessageRead = (messageId) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? {
              ...message,
              read: !message.read,
            }
          : message,
      ),
    )
  }

  const handleOpenNotification = (notification) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id
          ? {
              ...n,
              read: true,
            }
          : n,
      ),
    )

    if (notification.entityType === 'donation' && notification.entityId) {
      handleSelectDonation(notification.entityId)
    } else if (notification.entityType === 'campaign' && notification.entityId) {
      handleSelectCampaign(notification.entityId)
    }
  }

  const handleNotificationsButtonClick = () => {
    setActivePage('notifications')
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-900">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <div className="flex flex-col items-center gap-3 mb-4">
            <img
              src={papayaLogo}
              alt="Papaya Academy, Inc. logo"
              className="h-[120px] w-[120px] rounded-full object-cover bg-white p-1 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
            />
            <div className="text-center">
              <div className="text-xl font-semibold tracking-tight text-slate-900">Papaya Academy, Inc.</div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 rounded-2xl bg-[#1B3E2A] text-white text-sm font-medium py-2.5 hover:bg-[#23513A] transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={!email || !password || isLoading}
            >
              {isLoading && (
                <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isLoading ? 'Signing in…' : 'Sign in'}</span>
            </button>
            {error && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-3 py-2 mt-1">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900">
      <aside className="w-64 bg-[#1B3E2A] text-slate-100 flex flex-col py-6 px-4">
        <div className="flex items-center gap-2 px-3 mb-8">
          <img
            src={papayaLogo}
            alt="Papaya Academy, Inc. logo"
            className="h-9 w-9 rounded-full object-cover bg-white p-[2px] shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
          />
          <div className="text-xl font-semibold tracking-tight">Papaya Academy Inc.</div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                ${
                  activePage === item.key
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
                }`}
              onClick={() => {
                if (item.key === 'logout') {
                  confirmAndLogout()
                } else {
                  setActivePage(item.key)
                }
              }}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-6 px-3">
          <div className="rounded-2xl bg-white/5 px-4 py-3 text-xs text-slate-100/80">
            <div className="font-semibold text-white mb-1">Papaya Academy Inc. 2025</div>
            <p className="text-slate-100/70">
              Track your donations, alumni, and partners in a single dashboard.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col px-6 py-5 gap-6 overflow-hidden">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{headerTitle}</h1>
            <p className="text-sm text-slate-500">{headerSubtitle}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search here..."
                className="pl-9 pr-3 py-2 rounded-full bg-white border border-slate-200 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <button
              className="relative h-9 w-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
              title={`Donations notifications`}
              onClick={handleNotificationsButtonClick}
            >
              <FiBell className="h-4 w-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#F2C94C] px-1 text-[10px] font-medium text-[#1B3E2A]">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#1B3E2A] to-[#28573F] text-sm font-semibold text-white flex items-center justify-center">
              D
            </div>
          </div>
        </header>

        <div className="flex-1 flex gap-6 overflow-hidden">
          <section className="flex-1 flex flex-col gap-6 overflow-hidden">
            {activePage === 'dashboard' && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <SummaryCard
                    title="Total Donations (This Year)"
                    value={formatCurrency(totalDonationsYear)}
                    subtitle={`This year (${selectedYear}) · This month: ${formatCurrency(totalDonationsMonth)}`}
                    tone="green"
                    onClick={() => setActivePage('donations')}
                  />
                  <SummaryCard
                    title="Active Donation Campaigns"
                    value={String(activeCampaignCount)}
                    subtitle="Ongoing campaigns"
                    tone="amber"
                    onClick={() => setActivePage('campaigns')}
                  />
                  <SummaryCard
                    title="Registered Donors"
                    value={registeredDonorsCount.toLocaleString('en-PH')}
                    subtitle="Total donors"
                    tone="sky"
                    onClick={() => setActivePage('donors')}
                  />
                </div>

                <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">Statistics</h2>
                      <p className="text-xs text-slate-500">Monthly donations vs disbursements</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <LegendDot color="bg-[#1B3E2A]" label="Donations Received" />
                      <LegendDot color="bg-[#F2C94C]" label="Disbursements / Expenses" />
                      <select
                        className="ml-4 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                        value={selectedYear}
                        onChange={(event) => setSelectedYear(event.target.value)}
                      >
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 min-h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="donations" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1B3E2A" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#1B3E2A" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="disbursements" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F2C94C" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#F2C94C" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '0.75rem',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 10px 40px rgba(15, 23, 42, 0.25)',
                            padding: '0.5rem 0.75rem',
                          }}
                          labelStyle={{ fontSize: 12, color: '#6b7280' }}
                          labelFormatter={(label) => `Month: ${label}`}
                          formatter={(value, name) => [
                            formatCurrency(value),
                            name === 'donations' ? 'Donations Received' : 'Disbursements / Expenses',
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="donations"
                          stroke="#1B3E2A"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#donations)"
                        />
                        <Area
                          type="monotone"
                          dataKey="disbursements"
                          stroke="#F2C94C"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#disbursements)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-slate-900">Top Corporate Partners</h2>
                    <button className="text-xs text-[#1B3E2A] font-medium hover:text-[#163021]">
                      View all
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {partners.map((partner) => (
                      <div
                        key={partner.name}
                        className="rounded-2xl border border-slate-100 px-4 py-3 bg-slate-50/60 hover:bg-slate-50 transition"
                      >
                        <div className="h-8 w-8 rounded-xl bg-white shadow flex items-center justify-center text-[10px] font-semibold text-slate-700 mb-2">
                          {partner.name[0]}
                        </div>
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {partner.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{partner.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activePage === 'donations' && (
              <DonationsSection
                donations={donations}
                selectedDonationId={selectedDonationId}
                onSelectDonation={handleSelectDonation}
                searchQuery={searchQuery}
                baseCurrency={settings.currency}
              />
            )}
            {activePage === 'campaigns' && (
              <CampaignsSection
                campaigns={campaignStats}
                selectedCampaignId={selectedCampaignId}
                onSelectCampaign={handleSelectCampaign}
                onEditCampaign={(campaignId, newTargetAmount) => {
                  const campaign = campaignStats.find((c) => c.id === campaignId)
                  if (!campaign) return
                  const currentTarget = campaign.targetAmount || 0
                  const parsed =
                    typeof newTargetAmount === 'number'
                      ? newTargetAmount
                      : Number(String(newTargetAmount || '').replace(/[^0-9.]/g, ''))
                  if (Number.isNaN(parsed) || parsed <= 0) {
                    window.alert('Please enter a valid amount.')
                    return
                  }

                  const willReachGoal = campaign.collected >= parsed && campaign.collected < currentTarget

                  setCampaigns((prev) =>
                    prev.map((c) =>
                      c.id === campaignId
                        ? {
                            ...c,
                            targetAmount: parsed,
                          }
                        : c,
                    ),
                  )

                  if (willReachGoal) {
                    addNotification({
                      type: 'Campaign',
                      message: `${campaign.name} has reached its updated target.`,
                      entityType: 'campaign',
                      entityId: campaignId,
                    })
                  }
                }}
                onArchiveCampaign={(campaignId) => {
                  setCampaigns((prev) =>
                    prev.map((campaign) =>
                      campaign.id === campaignId
                        ? {
                            ...campaign,
                            status: 'Archived',
                          }
                        : campaign,
                    ),
                  )
                }}
                onAddCampaign={() => {
                  const name = window.prompt('Campaign name:')
                  if (!name) return
                  const targetInput = window.prompt('Target amount (PHP):', '100000')
                  if (!targetInput) return
                  const parsed = Number(targetInput.replace(/[^0-9.]/g, ''))
                  if (Number.isNaN(parsed) || parsed <= 0) {
                    window.alert('Please enter a valid amount.')
                    return
                  }
                  const id = `CP-${String(campaigns.length + 1).padStart(3, '0')}`
                  setCampaigns((prev) => [
                    ...prev,
                    {
                      id,
                      name,
                      targetAmount: parsed,
                      status: 'Active',
                    },
                  ])
                }}
              />
            )}
            {activePage === 'donors' && (
              <DonorsSection
                donors={donorsWithStats}
                selectedDonorId={selectedDonorId}
                onSelectDonor={handleSelectDonor}
                searchQuery={searchQuery}
              />
            )}
            {activePage === 'reports' && <ReportsSection donations={donations} campaigns={campaigns} />}
            {activePage === 'partners' && (
              <PartnersSection
                partners={partners}
                selectedPartnerId={selectedPartnerId}
                onSelectPartner={handleSelectPartner}
                onAddPartner={() => {
                  const name = window.prompt('Organization name:')
                  if (!name) return
                  const contact = window.prompt('Contact person (optional):') || ''
                  const type = window.prompt('Contribution type (e.g., Cash, Sponsorship, In-kind):') || 'Cash'
                  const status = window.prompt('Status (Active / Inactive):', 'Active') || 'Active'
                  const id = `PT-${String(partners.length + 1).padStart(3, '0')}`
                  setPartners((prev) => [
                    ...prev,
                    {
                      id,
                      name,
                      contact,
                      type,
                      status: status === 'Inactive' ? 'Inactive' : 'Active',
                    },
                  ])
                }}
              />
            )}
            {activePage === 'messages' && (
              <ContactsSection
                messages={messages}
                selectedMessageId={selectedMessageId}
                onSelectMessage={handleSelectMessage}
                onToggleMessageRead={handleToggleMessageRead}
              />
            )}
            {activePage === 'notifications' && (
              <NotificationsSection
                notifications={notifications}
                onOpenNotification={handleOpenNotification}
              />
            )}
            {activePage === 'settings' && (
              <SettingsSection
                settings={settings}
                isSaving={isSavingSettings}
                onChange={(field, value) => {
                  setSettings((prev) => ({
                    ...prev,
                    [field]: value,
                  }))
                }}
                onSave={() => {
                  setIsSavingSettings(true)
                  setTimeout(() => {
                    try {
                      window.localStorage.setItem('papaya-settings', JSON.stringify(settings))
                    } catch {
                    }
                    setIsSavingSettings(false)
                  }, 600)
                }}
              />
            )}
          </section>

          {activePage === 'dashboard' && (
            <aside className="w-80 flex flex-col gap-4">
              <div className="bg-white rounded-3xl shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#1B3E2A] to-[#28573F] flex items-center justify-center text-lg font-semibold text-white">
                    D
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">Devon Lane</div>
                    <div className="text-xs text-slate-500">devonlane@gmail.com</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <ProfileRow
                    icon={FiUser}
                    label="View Profile"
                    onClick={() => {
                      window.alert('Admin: Devon Lane (admin@papaya.com)')
                    }}
                  />
                  <ProfileRow icon={FiSettings} label="Settings" onClick={() => setActivePage('settings')} />
                  <ProfileRow icon={FiLogOut} label="Log out" highlight onClick={confirmAndLogout} />
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-slate-900">Conversations</h2>
                  <span className="text-xs text-slate-400">Today</span>
                </div>
                <div className="space-y-3 overflow-y-auto pr-1">
                  {conversations.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-start gap-3 rounded-2xl px-2 py-2.5 hover:bg-slate-50 transition"
                    >
                      <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-[#1B3E2A] to-[#28573F] flex items-center justify-center text-xs font-semibold text-white">
                        {c.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-slate-400 whitespace-nowrap">
                            {c.time}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 truncate">{c.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  )
}

function SummaryCard({ title, value, subtitle, tone, onClick }) {
  const toneClasses = {
    green: 'bg-[#1B3E2A] text-white',
    amber: 'bg-[#F2C94C] text-[#1B3E2A]',
    sky: 'bg-slate-200 text-slate-800',
  }[tone]

  return (
    <div className="bg-white rounded-3xl shadow-sm p-4 flex items-center gap-3" onClick={onClick}>
      <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-sm font-semibold ${toneClasses}`}>
        {title[0]}
      </div>
      <div>
        <div className="text-xs text-slate-500">{title}</div>
        <div className="text-lg font-semibold text-slate-900">{value}</div>
        <div className="text-[11px] text-slate-400">{subtitle}</div>
      </div>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  )
}

function ProfileRow({ icon: Icon, label, highlight = false, onClick }) {
  return (
    <button
      className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition ${
        highlight
          ? 'text-rose-500 hover:bg-rose-50'
          : 'text-slate-600 hover:bg-slate-50'
      }`}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )
}

function DonationsSection({ donations, selectedDonationId, onSelectDonation, searchQuery, baseCurrency }) {
  const [statusFilter, setStatusFilter] = useState('All')
  const [methodFilter, setMethodFilter] = useState('All')

  const normalizedSearch = searchQuery.trim().toLowerCase()

  const filteredDonations = donations
    .filter((donation) => {
      if (!normalizedSearch) return true
      const haystack = `${donation.id} ${donation.donorName || ''} ${donation.campaignName || ''}`.toLowerCase()
      return haystack.includes(normalizedSearch)
    })
    .filter((donation) => (statusFilter === 'All' ? true : donation.status === statusFilter))
    .filter((donation) => (methodFilter === 'All' ? true : donation.method === methodFilter))
    .slice()
    .sort((a, b) => {
      const aDate = parseDateOrNull(a.date)
      const bDate = parseDateOrNull(b.date)
      if (!aDate || !bDate) return 0
      return bDate.getTime() - aDate.getTime()
    })

  const selectedDonation = filteredDonations.find((donation) => donation.id === selectedDonationId) || null

  const selectedDonationRegion = selectedDonation
    ? selectedDonation.country === 'Philippines' || selectedDonation.currency === 'PHP'
      ? 'Local'
      : 'International'
    : null

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Donations</h2>
          <p className="text-xs text-slate-500">Recent donations and payment status</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <select
            className="rounded-2xl border border-slate-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <select
            className="rounded-2xl border border-slate-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
            value={methodFilter}
            onChange={(event) => setMethodFilter(event.target.value)}
          >
            <option value="All">All methods</option>
            <option value="Credit Card">Credit Card</option>
            <option value="GCash">GCash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="min-w-full text-xs text-left text-slate-600">
          <thead className="text-[11px] uppercase text-slate-400">
            <tr>
              <th className="px-2 py-2 font-medium">Donation ID</th>
              <th className="px-2 py-2 font-medium">Donor Name</th>
              <th className="px-2 py-2 font-medium">Campaign</th>
              <th className="px-2 py-2 font-medium">Amount</th>
              <th className="px-2 py-2 font-medium">Payment Method</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Date</th>
              <th className="px-2 py-2 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="align-middle">
            {filteredDonations.length === 0 && (
              <tr className="border-t border-slate-100">
                <td colSpan={8} className="px-2 py-4 text-center text-slate-400 text-xs">
                  No donations found.
                </td>
              </tr>
            )}
            {filteredDonations.map((donation) => (
              <tr
                key={donation.id}
                className={`border-t border-slate-100 ${
                  selectedDonationId === donation.id ? 'bg-slate-50' : ''
                }`}
              >
                <td className="px-2 py-2 whitespace-nowrap text-slate-500">{donation.id}</td>
                <td className="px-2 py-2 whitespace-nowrap text-slate-700">{donation.donorName}</td>
                <td className="px-2 py-2 whitespace-nowrap">{donation.campaignName}</td>
                <td className="px-2 py-2 whitespace-nowrap font-medium text-slate-800">
                  {formatCurrency(donation.amount, donation.currency || baseCurrency || 'PHP')}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">{donation.method}</td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      donation.status === 'Completed'
                        ? 'bg-[#1B3E2A]/10 text-[#1B3E2A]'
                        : donation.status === 'Pending'
                        ? 'bg-[#F2C94C]/20 text-[#8A6A12]'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {donation.status}
                  </span>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-slate-500">{donation.date}</td>
                <td className="px-2 py-2 whitespace-nowrap text-right">
                  <button
                    className="text-[11px] font-medium text-[#1B3E2A] hover:text-[#163021]"
                    onClick={() => onSelectDonation(donation.id)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDonation && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 text-xs"
          onClick={() => onSelectDonation(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-sm p-5 w-full max-w-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-medium text-slate-500">Donation details</div>
                <div className="text-sm font-semibold text-slate-900">{selectedDonation.id}</div>
              </div>
              <button
                type="button"
                className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
                onClick={() => onSelectDonation(null)}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <div>
                <div className="text-[11px] text-slate-500">Donor</div>
                <div className="text-xs font-medium text-slate-800">{selectedDonation.donorName}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Campaign</div>
                <div className="text-xs font-medium text-slate-800">{selectedDonation.campaignName}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Amount</div>
                <div className="text-xs font-medium text-slate-800">
                  {formatCurrency(selectedDonation.amount, selectedDonation.currency || baseCurrency || 'PHP')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <div>
                <div className="text-[11px] text-slate-500">Payment method</div>
                <div className="text-xs text-slate-700">{selectedDonation.method}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Gateway</div>
                <div className="text-xs text-slate-700">{selectedDonation.gateway}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Status</div>
                <div className="text-xs text-slate-700">{selectedDonation.status}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <div>
                <div className="text-[11px] text-slate-500">Transaction ref.</div>
                <div className="text-xs text-slate-700">{selectedDonation.reference}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Timestamp</div>
                <div className="text-xs text-slate-700">{selectedDonation.date}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Origin</div>
                <div className="text-xs text-slate-700">
                  {selectedDonationRegion}{' '}
                  {selectedDonation.country ? `· ${selectedDonation.country}` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CampaignsSection({ campaigns, selectedCampaignId, onSelectCampaign, onEditCampaign, onArchiveCampaign }) {
  const selectedCampaign = campaigns.find((campaign) => campaign.id === selectedCampaignId) || null
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [editingTarget, setEditingTarget] = useState('')

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Donation Campaigns</h2>
          <p className="text-xs text-slate-500">Manage active and archived campaigns</p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="min-w-full text-xs text-left text-slate-600">
          <thead className="text-[11px] uppercase text-slate-400">
            <tr>
              <th className="px-2 py-2 font-medium">Campaign</th>
              <th className="px-2 py-2 font-medium">Target Amount</th>
              <th className="px-2 py-2 font-medium">Total Collected</th>
              <th className="px-2 py-2 font-medium">Progress</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="align-middle">
            {campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className={`border-t border-slate-100 ${
                  selectedCampaignId === campaign.id ? 'bg-slate-50' : ''
                }`}
              >
                <td
                  className="px-2 py-2 whitespace-nowrap text-slate-700 cursor-pointer"
                  onClick={() => onSelectCampaign(campaign.id)}
                >
                  {campaign.name}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  {formatCurrency(campaign.targetAmount)}
                </td>
                <td className="px-2 py-2 whitespace-nowrap font-medium text-slate-800">
                  {formatCurrency(campaign.collected)}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-slate-600">
                  {campaign.progressPercent}% funded
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      campaign.status === 'Active'
                        ? 'bg-[#1B3E2A]/10 text-[#1B3E2A]'
                        : campaign.status === 'Completed'
                        ? 'bg-[#F2C94C]/20 text-[#8A6A12]'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-right space-x-2">
                  <button
                    className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
                    onClick={() => {
                      setEditingCampaign(campaign)
                      setEditingTarget(String(campaign.targetAmount || 0))
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-[11px] font-medium text-rose-500 hover:text-rose-600"
                    onClick={() => onArchiveCampaign(campaign.id)}
                  >
                    Archive
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCampaign && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 text-xs"
          onClick={() => onSelectCampaign(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-sm p-5 w-full max-w-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[11px] font-medium text-slate-500">Campaign details</div>
                <div className="text-sm font-semibold text-slate-900">{selectedCampaign.name}</div>
              </div>
              <button
                type="button"
                className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
                onClick={() => onSelectCampaign(null)}
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-1">
              <div>
                <div className="text-[11px] text-slate-500">Target amount</div>
                <div className="text-xs font-medium text-slate-800">
                  {formatCurrency(selectedCampaign.targetAmount)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Total collected</div>
                <div className="text-xs font-medium text-slate-800">
                  {formatCurrency(selectedCampaign.collected)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Progress</div>
                <div className="text-xs text-slate-700">{selectedCampaign.progressPercent}% funded</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-[11px] font-medium text-slate-500 mb-1">Donations for this campaign</div>
              {selectedCampaign.donations.length === 0 ? (
                <div className="text-xs text-slate-400">No donations linked to this campaign yet.</div>
              ) : (
                <div className="overflow-x-auto -mx-1">
                  <table className="min-w-full text-[11px] text-left text-slate-600">
                    <thead className="uppercase text-slate-400">
                      <tr>
                        <th className="px-1 py-1 font-medium">Donation ID</th>
                        <th className="px-1 py-1 font-medium">Donor</th>
                        <th className="px-1 py-1 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCampaign.donations.map((donation) => (
                        <tr key={donation.id} className="border-t border-slate-100">
                          <td className="px-1 py-1 whitespace-nowrap text-slate-500">{donation.id}</td>
                          <td className="px-1 py-1 whitespace-nowrap text-slate-700">{donation.donorName}</td>
                          <td className="px-1 py-1 whitespace-nowrap font-medium text-slate-800">
                            {formatCurrency(donation.amount, donation.currency || 'PHP')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editingCampaign && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 text-xs"
          onClick={() => setEditingCampaign(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-sm p-5 w-full max-w-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-medium text-slate-500">Edit campaign</div>
                <div className="text-sm font-semibold text-slate-900">{editingCampaign.name}</div>
              </div>
              <button
                type="button"
                className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
                onClick={() => setEditingCampaign(null)}
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Target amount (PHP)</div>
                <input
                  type="number"
                  className="w-full rounded-2xl border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                  value={editingTarget}
                  onChange={(event) => setEditingTarget(event.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                className="rounded-2xl border border-slate-200 px-3 py-1 text-slate-600 hover:bg-slate-50"
                onClick={() => setEditingCampaign(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-2xl border border-[#1B3E2A] bg-[#1B3E2A] px-3 py-1 text-white hover:bg-[#163021]"
                onClick={() => {
                  const parsed = Number(String(editingTarget).replace(/[^0-9.]/g, ''))
                  if (Number.isNaN(parsed) || parsed <= 0) {
                    window.alert('Please enter a valid amount.')
                    return
                  }
                  onEditCampaign(editingCampaign.id, parsed)
                  setEditingCampaign(null)
                }}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DonorsSection({ donors, selectedDonorId, onSelectDonor, searchQuery }) {
  const normalizedSearch = searchQuery.trim().toLowerCase()

  const filteredDonors = donors
    .filter((donor) => {
      if (!normalizedSearch) return true
      const haystack = `${donor.name} ${donor.email}`.toLowerCase()
      return haystack.includes(normalizedSearch)
    })
    .slice()
    .sort((a, b) => b.total - a.total)

  const selectedDonor = filteredDonors.find((donor) => donor.id === selectedDonorId) || null

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Donors</h2>
          <p className="text-xs text-slate-500">Registered donors and giving history</p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="min-w-full text-xs text-left text-slate-600">
          <thead className="text-[11px] uppercase text-slate-400">
            <tr>
              <th className="px-2 py-2 font-medium">Donor</th>
              <th className="px-2 py-2 font-medium">Email</th>
              <th className="px-2 py-2 font-medium">Total Donations</th>
              <th className="px-2 py-2 font-medium">Last Donation</th>
              <th className="px-2 py-2 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="align-middle">
            {filteredDonors.length === 0 && (
              <tr className="border-t border-slate-100">
                <td colSpan={5} className="px-2 py-4 text-center text-slate-400 text-xs">
                  No donors found.
                </td>
              </tr>
            )}
            {filteredDonors.map((donor) => (
              <tr
                key={donor.id}
                className={`border-t border-slate-100 ${selectedDonorId === donor.id ? 'bg-slate-50' : ''}`}
              >
                <td className="px-2 py-2 whitespace-nowrap text-slate-700">{donor.name}</td>
                <td className="px-2 py-2 whitespace-nowrap text-slate-500">{donor.email}</td>
                <td className="px-1 py-1 whitespace-nowrap font-medium text-slate-800">
                  {formatCurrency(donor.total, donor.currency || 'PHP')}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-slate-500">{donor.lastDonation}</td>
                <td className="px-2 py-2 whitespace-nowrap text-right">
                  <button
                    className="text-[11px] font-medium text-[#1B3E2A] hover:text-[#163021]"
                    onClick={() => onSelectDonor(donor.id)}
                  >
                    View history
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDonor && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 text-xs"
          onClick={() => onSelectDonor(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-sm p-5 w-full max-w-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-[11px] font-medium text-slate-500">Donor profile</div>
                <div className="text-sm font-semibold text-slate-900">{selectedDonor.name}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500">Total donated</div>
                <div className="text-xs font-medium text-slate-800">{formatCurrency(selectedDonor.total)}</div>
                <button
                  type="button"
                  className="mt-1 text-[11px] font-medium text-slate-500 hover:text-slate-700"
                  onClick={() => onSelectDonor(null)}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div>
                <div className="text-[11px] text-slate-500">Email</div>
                <div className="text-xs text-slate-700">{selectedDonor.email}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Last donation</div>
                <div className="text-xs text-slate-700">{selectedDonor.lastDonation}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Campaigns supported</div>
                <div className="text-xs text-slate-700">{selectedDonor.campaignsSupported}</div>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 mb-1">Donation history</div>
              {selectedDonor.donations.length === 0 ? (
                <div className="text-xs text-slate-400">No donations recorded for this donor.</div>
              ) : (
                <div className="overflow-x-auto -mx-1">
                  <table className="min-w-full text-[11px] text-left text-slate-600">
                    <thead className="uppercase text-slate-400">
                      <tr>
                        <th className="px-1 py-1 font-medium">Donation ID</th>
                        <th className="px-1 py-1 font-medium">Campaign</th>
                        <th className="px-1 py-1 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDonor.donations.map((donation) => (
                        <tr key={donation.id} className="border-t border-slate-100">
                          <td className="px-1 py-1 whitespace-nowrap text-slate-500">{donation.id}</td>
                          <td className="px-1 py-1 whitespace-nowrap text-slate-700">{donation.campaignName}</td>
                          <td className="px-1 py-1 whitespace-nowrap font-medium text-slate-800">
                            {formatCurrency(donation.amount, donation.currency || 'PHP')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ReportsSection({ donations, campaigns }) {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [campaignFilter, setCampaignFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')

  const filteredDonations = donations.filter((donation) => {
    const date = parseDateOrNull(donation.date)
    if (!date) return false

    if (fromDate) {
      const from = parseDateOrNull(fromDate)
      if (from && date < from) return false
    }

    if (toDate) {
      const to = parseDateOrNull(toDate)
      if (to && date > to) return false
    }

    if (campaignFilter !== 'all' && donation.campaignId !== campaignFilter) {
      return false
    }

    if (methodFilter !== 'all' && donation.method !== methodFilter) {
      return false
    }

    return true
  })

  const referenceDate = filteredDonations.reduce((latest, donation) => {
    const date = parseDateOrNull(donation.date)
    if (!date) return latest
    if (!latest) return date
    return date > latest ? date : latest
  }, null)

  let dailyTotal = 0
  let monthlyTotal = 0
  let yearlyTotal = 0

  if (referenceDate) {
    const refDay = referenceDate.getDate()
    const refMonth = referenceDate.getMonth()
    const refYear = referenceDate.getFullYear()

    filteredDonations.forEach((donation) => {
      const date = parseDateOrNull(donation.date)
      if (!date) return
      const amount = typeof donation.amount === 'number' ? donation.amount : 0

      if (date.getFullYear() === refYear) {
        yearlyTotal += amount
        if (date.getMonth() === refMonth) {
          monthlyTotal += amount
          if (date.getDate() === refDay) {
            dailyTotal += amount
          }
        }
      }
    })
  }

  const summaries = [
    { id: 'daily', label: 'Daily summary', amount: dailyTotal },
    { id: 'monthly', label: 'Monthly summary', amount: monthlyTotal },
    { id: 'yearly', label: 'Yearly summary', amount: yearlyTotal },
  ]

  const exportReport = (type) => {
    const header = ['Donation ID', 'Donor', 'Campaign', 'Amount', 'Method', 'Status', 'Date']
    const rows = filteredDonations.map((donation) => [
      donation.id,
      donation.donorName,
      donation.campaignName,
      donation.amount,
      donation.method,
      donation.status,
      donation.date,
    ])

    const csv = [header, ...rows]
      .map((columns) =>
        columns
          .map((value) => {
            if (value == null) return ''
            const asString = String(value)
            if (asString.includes(',') || asString.includes('"')) {
              return '"' + asString.replace(/"/g, '""') + '"'
            }
            return asString
          })
          .join(','),
      )
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const extension = type === 'pdf' ? 'pdf' : type === 'excel' ? 'xlsx' : 'csv'
    link.download = `donation-report.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Reports</h2>
          <p className="text-xs text-slate-500">Filter and export donation summaries</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-slate-500">Date range</div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
            <span className="text-[11px] text-slate-400">to</span>
            <input
              type="date"
              className="w-full rounded-2xl border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-slate-500">Campaign</div>
          <select
            className="w-full rounded-2xl border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
            value={campaignFilter}
            onChange={(event) => setCampaignFilter(event.target.value)}
          >
            <option value="all">All campaigns</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-slate-500">Payment method</div>
          <select
            className="w-full rounded-2xl border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
            value={methodFilter}
            onChange={(event) => setMethodFilter(event.target.value)}
          >
            <option value="all">All methods</option>
            <option value="Credit Card">Credit Card</option>
            <option value="GCash">GCash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-xs">
        {summaries.map((summary) => (
          <div key={summary.id} className="rounded-2xl border border-slate-100 px-4 py-3 bg-slate-50/60">
            <div className="text-[11px] text-slate-500 mb-1">{summary.label}</div>
            <div className="text-sm font-semibold text-slate-900">
              {formatCurrency(summary.amount)}
            </div>
          </div>
        ))}
      </div>

      {filteredDonations.length === 0 && (
        <div className="text-[11px] text-slate-400 mt-1">No donations match the selected filters.</div>
      )}

      <div className="flex items-center justify-end gap-2 text-xs mt-2">
        <button
          className="rounded-2xl border border-slate-200 px-3 py-1 text-slate-600 hover:bg-slate-50"
          onClick={() => exportReport('csv')}
        >
          Export CSV
        </button>
        <button
          className="rounded-2xl border border-slate-200 px-3 py-1 text-slate-600 hover:bg-slate-50"
          onClick={() => exportReport('excel')}
        >
          Export Excel
        </button>
        <button
          className="rounded-2xl border border-[#1B3E2A] bg-[#1B3E2A] px-3 py-1 text-white hover:bg-[#163021]"
          onClick={() => exportReport('pdf')}
        >
          Export PDF
        </button>
      </div>
    </div>
  )
}

function ContactsSection({ messages, selectedMessageId, onSelectMessage, onToggleMessageRead }) {
  const sortedMessages = messages
    .slice()
    .sort((a, b) => {
      const aDate = parseDateOrNull(a.receivedAt)
      const bDate = parseDateOrNull(b.receivedAt)
      if (!aDate || !bDate) return 0
      return bDate.getTime() - aDate.getTime()
    })

  const selectedMessage = sortedMessages.find((message) => message.id === selectedMessageId) || null

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-2 flex-1">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Messages / Inquiries</h2>
          <p className="text-xs text-slate-500">Messages from donors and website visitors</p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 mb-2">
        <table className="min-w-full text-xs text-left text-slate-600">
          <thead className="text-[11px] uppercase text-slate-400">
            <tr>
              <th className="px-2 py-2 font-medium">From</th>
              <th className="px-2 py-2 font-medium">Subject</th>
              <th className="px-2 py-2 font-medium">Received</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="align-middle">
            {sortedMessages.length === 0 && (
              <tr className="border-t border-slate-100">
                <td colSpan={5} className="px-2 py-4 text-center text-slate-400 text-xs">
                  No messages available.
                </td>
              </tr>
            )}
            {sortedMessages.map((message) => {
              const date = parseDateOrNull(message.receivedAt)
              const formatted = date
                ? date.toLocaleString('en-PH', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : message.receivedAt

              return (
                <tr
                  key={message.id}
                  className={`border-t border-slate-100 ${
                    selectedMessageId === message.id ? 'bg-slate-50' : ''
                  }`}
                >
                  <td className="px-2 py-2 whitespace-nowrap text-slate-700">{message.fromName}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-slate-600 truncate max-w-[220px]">
                    {message.subject}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-slate-500">{formatted}</td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        message.read
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-[#1B3E2A]/10 text-[#1B3E2A]'
                      }`}
                    >
                      {message.read ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-right space-x-2">
                    <button
                      className="text-[11px] font-medium text-[#1B3E2A] hover:text-[#163021]"
                      onClick={() => onSelectMessage(message.id)}
                    >
                      Open
                    </button>
                    <button
                      className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
                      onClick={() => onToggleMessageRead(message.id)}
                    >
                      {message.read ? 'Mark unread' : 'Mark read'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedMessage && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-xs">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-[11px] font-medium text-slate-500">Message from</div>
              <div className="text-sm font-semibold text-slate-900">{selectedMessage.fromName}</div>
              <div className="text-[11px] text-slate-500">{selectedMessage.fromEmail}</div>
            </div>
          </div>
          <div className="mt-2 mb-1">
            <div className="text-[11px] text-slate-500">Subject</div>
            <div className="text-xs font-medium text-slate-800">{selectedMessage.subject}</div>
          </div>
          <div className="mt-1">
            <div className="text-[11px] text-slate-500 mb-0.5">Message</div>
            <div className="text-xs text-slate-700 whitespace-pre-wrap">{selectedMessage.body}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function PartnersSection({ partners, selectedPartnerId, onSelectPartner, onAddPartner }) {
  const [viewMode, setViewMode] = useState('list')

  const selectedPartner = partners.find((partner) => partner.id === selectedPartnerId) || null

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Corporate / Institutional Partners</h2>
          <p className="text-xs text-slate-500">Partner organizations and contribution type</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
            onClick={() => setViewMode('list')}
          >
            List
          </button>
          <button
            className="text-[11px] font-medium text-[#1B3E2A] hover:text-[#163021]"
            onClick={onAddPartner}
          >
            Add partner
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="min-w-full text-xs text-left text-slate-600">
          <thead className="text-[11px] uppercase text-slate-400">
            <tr>
              <th className="px-2 py-2 font-medium">Organization</th>
              <th className="px-2 py-2 font-medium">Contact Person</th>
              <th className="px-2 py-2 font-medium">Contribution Type</th>
              <th className="px-2 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="align-middle">
            {partners.length === 0 && (
              <tr className="border-t border-slate-100">
                <td colSpan={4} className="px-2 py-4 text-center text-slate-400 text-xs">
                  No partners added yet.
                </td>
              </tr>
            )}
            {partners.map((partner) => (
              <tr
                key={partner.id}
                className={`border-t border-slate-100 ${
                  selectedPartnerId === partner.id ? 'bg-slate-50' : ''
                }`}
                onClick={() => onSelectPartner(partner.id)}
              >
                <td className="px-2 py-2 whitespace-nowrap text-slate-700">{partner.name}</td>
                <td className="px-2 py-2 whitespace-nowrap text-slate-500">{partner.contact}</td>
                <td className="px-2 py-2 whitespace-nowrap text-slate-600">{partner.type}</td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      partner.status === 'Active'
                        ? 'bg-[#1B3E2A]/10 text-[#1B3E2A]'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {partner.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPartner && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-xs mt-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[11px] font-medium text-slate-500">Partner details</div>
              <div className="text-sm font-semibold text-slate-900">{selectedPartner.name}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div>
              <div className="text-[11px] text-slate-500">Contact</div>
              <div className="text-xs text-slate-700">{selectedPartner.contact}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Contribution type</div>
              <div className="text-xs text-slate-700">{selectedPartner.type}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Status</div>
              <div className="text-xs text-slate-700">{selectedPartner.status}</div>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 mb-1">Contribution history</div>
            <div className="text-xs text-slate-400">Link partner donations here when backend is available.</div>
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationsSection({ notifications, onOpenNotification }) {
  const sorted = notifications
    .slice()
    .sort((a, b) => {
      const aDate = parseDateOrNull(a.createdAt)
      const bDate = parseDateOrNull(b.createdAt)
      if (!aDate || !bDate) return 0
      return bDate.getTime() - aDate.getTime()
    })

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
          <p className="text-xs text-slate-500">System alerts for donations and campaigns</p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        {sorted.length === 0 && (
          <div className="text-[11px] text-slate-400">No notifications yet.</div>
        )}
        {sorted.map((notification) => (
          <button
            key={notification.id}
            className={`w-full flex items-start gap-3 rounded-2xl border border-slate-100 px-3 py-2 text-left ${
              notification.read ? 'bg-white' : 'bg-slate-50/60'
            }`}
            onClick={() => onOpenNotification(notification)}
          >
            <div className="h-7 w-7 rounded-xl bg-slate-900 text-[10px] font-semibold text-slate-100 flex items-center justify-center">
              {notification.type === 'Donation'
                ? 'DN'
                : notification.type === 'Failed Payment'
                ? 'FP'
                : 'CP'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <div className="text-[11px] font-medium text-slate-700 truncate">{notification.type}</div>
                <div className="text-[10px] text-slate-400 whitespace-nowrap">{notification.time}</div>
              </div>
              <div className="text-[11px] text-slate-500 truncate">{notification.message}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function SettingsSection({ settings, isSaving, onChange, onSave }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 flex-1 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Settings</h2>
          <p className="text-xs text-slate-500">Organization, payments, and security configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-[11px] font-medium text-slate-500">Organization information</div>
          <input
            type="text"
            placeholder="Organization name"
            className="w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
            value={settings.organizationName}
            onChange={(event) => onChange('organizationName', event.target.value)}
          />
          <input
            type="text"
            placeholder="Address"
            className="w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
            value={settings.address}
            onChange={(event) => onChange('address', event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-medium text-slate-500">Currency & limits</div>
          <select
            className="w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
            value={settings.currency}
            onChange={(event) => onChange('currency', event.target.value)}
          >
            <option value="PHP">PHP - Philippine Peso</option>
            <option value="USD">USD - US Dollar</option>
          </select>
          <input
            type="number"
            placeholder="Maximum donation per transaction"
            className="w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
            value={settings.maxDonationPerTransaction}
            onChange={(event) => onChange('maxDonationPerTransaction', event.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-[11px] font-medium text-slate-500">Payment gateways</div>
          <input
            type="text"
            placeholder="Stripe / Xendit / PayMongo API key"
            className="w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
            value={settings.gatewayApiKey}
            onChange={(event) => onChange('gatewayApiKey', event.target.value)}
          />
          <input
            type="text"
            placeholder="Webhook URL"
            className="w-full rounded-2xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
            value={settings.webhookUrl}
            onChange={(event) => onChange('webhookUrl', event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-medium text-slate-500">Security</div>
          <label className="flex items-center gap-2 text-[11px] text-slate-600">
            <input
              type="checkbox"
              className="rounded border-slate-300"
              checked={settings.requireTwoFactor}
              onChange={(event) => onChange('requireTwoFactor', event.target.checked)}
            />
            Require two-factor authentication for admins
          </label>
          <label className="flex items-center gap-2 text-[11px] text-slate-600">
            <input
              type="checkbox"
              className="rounded border-slate-300"
              checked={settings.notifyOnFailedLogin}
              onChange={(event) => onChange('notifyOnFailedLogin', event.target.checked)}
            />
            Notify on failed login attempts
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end mt-1">
        <button
          className="rounded-2xl bg-[#1B3E2A] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#163021] disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </div>
  )
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function buildChartData(donations, year) {
  const base = MONTH_LABELS.map((label) => ({ month: label, donations: 0, disbursements: 0 }))

  donations.forEach((donation) => {
    const date = parseDateOrNull(donation.date)
    if (!date) return
    const donationYear = String(date.getFullYear())
    if (donationYear !== String(year)) return

    const monthIndex = date.getMonth()
    const monthLabel = MONTH_LABELS[monthIndex]
    const bucket = base.find((entry) => entry.month === monthLabel)
    if (!bucket) return

    const amount = typeof donation.amount === 'number' ? donation.amount : 0
    bucket.donations += amount
    bucket.disbursements += Math.round(amount * 0.6)
  })

  return base
}

function buildCampaignStats(campaigns, donations) {
  return campaigns.map((campaign) => {
    const targetAmount =
      typeof campaign.targetAmount === 'number'
        ? campaign.targetAmount
        : typeof campaign.target === 'number'
        ? campaign.target
        : 0

    const campaignDonations = donations.filter((donation) => donation.campaignId === campaign.id && donation.status === 'Completed')
    const collected = campaignDonations.reduce(
      (sum, donation) => sum + (typeof donation.amount === 'number' ? donation.amount : 0),
      0,
    )

    let status = campaign.status || 'Active'
    if (status !== 'Archived') {
      status = collected >= targetAmount && targetAmount > 0 ? 'Completed' : 'Active'
    }

    const progressPercent =
      targetAmount > 0 ? Math.min(100, Math.round((collected / targetAmount) * 100)) : 0

    return {
      ...campaign,
      targetAmount,
      collected,
      status,
      progressPercent,
      donations: campaignDonations,
    }
  })
}

function buildDonorStats(donors, donations) {
  return donors.map((donor) => {
    const donorDonations = donations.filter((donation) => donation.donorId === donor.id)
    const total = donorDonations.reduce((sum, donation) => sum + (typeof donation.amount === 'number' ? donation.amount : 0), 0)
    const lastDonation = donorDonations.reduce((latest, donation) => {
      if (!donation.date) return latest
      if (!latest) return donation.date
      return donation.date > latest ? donation.date : latest
    }, null)
    const campaignsSupported = Array.from(
      new Set(
        donorDonations
          .map((donation) => donation.campaignName)
          .filter(Boolean),
      ),
    ).length

    return {
      ...donor,
      total,
      lastDonation: lastDonation || '-',
      campaignsSupported,
      donations: donorDonations,
    }
  })
}

function parseDateOrNull(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function formatCurrency(amount, currencyCode = 'PHP') {
  if (typeof amount !== 'number') {
    return amount
  }

  // Fallback to PHP if an unsupported or empty currency code is passed
  const safeCurrency = currencyCode || 'PHP'

  try {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 2,
    }).format(amount)
  }
}

export default App
