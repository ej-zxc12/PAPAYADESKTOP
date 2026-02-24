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
  FiFileText,
  FiImage,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi'
import papayaLogo from './shared/assets/logo.jpg'
import siteContent from './core/config/siteContent.json'
import NewsManager from './features/news/pages/NewsManager.jsx'
import { uiText } from './core/constants/uiText'
import { sf10StudentsMock, sf10RecordsMock } from './features/sf10/models/sf10Content'
import { alumniMock } from './features/alumni/models/alumniContent'
import SF10Section, { SF10View } from './features/sf10/pages/SF10Section.jsx'
import AlumniSection from './features/alumni/pages/AlumniSection.jsx'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { getFirebaseAuth } from './core/services/firebase'
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { getFirebaseStorage } from './core/services/firebase'
import { orgChartService } from './core/services/orgChartService'

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

const initialOrgChart = {
  id: 'ORG-ROOT',
  name: 'Papaya Academy, Inc.',
  title: 'Organization',
  children: [
    { id: 'ORG-CEO', name: 'Devon Lane', title: 'Executive Director', children: [] },
    { id: 'ORG-PROG', name: 'Programs', title: 'Programs Dept.', children: [] },
    { id: 'ORG-FUND', name: 'Fundraising', title: 'Fundraising Dept.', children: [] },
  ],
}

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

// Sidebar structure is now rendered inline within the component with nested groups

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState('2025')
  const [activePage, setActivePage] = useState('dashboard')
  const [selectedSf10StudentId, setSelectedSf10StudentId] = useState(null)
  const [selectedStatTab, setSelectedStatTab] = useState('donations')

  // Sidebar dropdown state.
  // Important UX: keep all groups collapsed by default, and only toggle on the parent group button click.
  const [openGroups, setOpenGroups] = useState({ website: false, about: false, donations: false })

  // Sidebar toggle helpers (kept near state to keep behavior predictable).
  const toggleWebsiteGroup = () => {
    setOpenGroups((p) => {
      const nextWebsite = !p.website
      return {
        ...p,
        website: nextWebsite,
        // Nested group should not remain open when the parent collapses.
        about: nextWebsite ? p.about : false,
      }
    })
  }

  const toggleAboutGroup = () => {
    setOpenGroups((p) => {
      if (!p.website) return p
      return { ...p, about: !p.about }
    })
  }

  const toggleDonationsGroup = () => {
    setOpenGroups((p) => ({ ...p, donations: !p.donations }))
  }

  const [donations, setDonations] = useState(initialDonations)
  const [campaigns, setCampaigns] = useState(
    Array.isArray(siteContent?.programs) && siteContent.programs.length > 0
      ? siteContent.programs
      : initialCampaigns,
  )
  const [partners, setPartners] = useState(
    Array.isArray(siteContent?.partners) && siteContent.partners.length > 0
      ? siteContent.partners
      : initialPartnerOrganizations,
  )
  const [donors] = useState(initialDonors)
  const [messages, setMessages] = useState(initialMessages)
  const [orgChart, setOrgChart] = useState(initialOrgChart)
  const [settings, setSettings] = useState({
    ...initialSettings,
    organizationName: siteContent?.organizationName || initialSettings.organizationName,
  })

  const [selectedDonationId, setSelectedDonationId] = useState(null)
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)
  const [selectedDonorId, setSelectedDonorId] = useState(null)
  const [selectedPartnerId, setSelectedPartnerId] = useState(null)
  const [selectedMessageId, setSelectedMessageId] = useState(null)
  const [sf10Students, setSf10Students] = useState(sf10StudentsMock)
  const [sf10Records, setSf10Records] = useState(sf10RecordsMock)

  const [isSavingSettings, setIsSavingSettings] = useState(false)


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

  useEffect(() => {
    let unsubscribe
    try {
      const auth = getFirebaseAuth()
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setIsLoggedIn(false)
          setError('')
          return
        }

        try {
          const tokenResult = await user.getIdTokenResult()
          const isAdmin = Boolean(tokenResult?.claims?.admin)
          if (!isAdmin) {
            await firebaseSignOut(auth)
            setIsLoggedIn(false)
            setError('This desktop app is for admin accounts only.')
            return
          }

          setIsLoggedIn(true)
          setError('')
        } catch (e) {
          try {
            await firebaseSignOut(auth)
          } catch {
          }
          setIsLoggedIn(false)
          setError(e?.message || 'Unable to verify admin access.')
        }
      })
    } catch (e) {
      setError(e?.message || 'Firebase is not configured.')
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [])

  // Optional: fetch site content from remote URL if provided (keeps desktop in sync with website)
  useEffect(() => {
    const url = import.meta?.env?.VITE_SITE_CONTENT_URL
    if (!url) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(url, { headers: { 'cache-control': 'no-cache' } })
        if (!res.ok) return
        const data = await res.json()
        if (cancelled || !data) return
        if (Array.isArray(data.programs) && data.programs.length) {
          setCampaigns(data.programs)
        }
        if (Array.isArray(data.partners) && data.partners.length) {
          setPartners(data.partners)
        }
        if (data.organizationName) {
          setSettings((prev) => ({ ...prev, organizationName: data.organizationName }))
        }
      } catch {
        // silent fallback to local content
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const url = import.meta?.env?.VITE_ORG_CHART_URL
    if (!url) return
    let cancelled = false
    let intervalId
    const fetchOrg = async () => {
      try {
        const res = await fetch(url, { headers: { 'cache-control': 'no-cache' } })
        if (!res.ok) return
        const data = await res.json()
        if (cancelled || !data) return
        setOrgChart(data)
      } catch {
      }
    }
    fetchOrg()
    intervalId = setInterval(fetchOrg, 5000)
    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    setIsLoading(true)
    try {
      const auth = getFirebaseAuth()
      await signInWithEmailAndPassword(auth, email, password)
      setActivePage('dashboard')
      setSelectedDonationId(null)
      setSelectedCampaignId(null)
      setSelectedDonorId(null)
      setSelectedPartnerId(null)
      setSelectedMessageId(null)
    } catch (e) {
      setError(e?.message || 'Login failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setError('')
    setIsLoading(true)
    try {
      const auth = getFirebaseAuth()
      await firebaseSignOut(auth)
      setEmail('')
      setPassword('')
      setActivePage('dashboard')
      setSelectedDonationId(null)
      setSelectedCampaignId(null)
      setSelectedDonorId(null)
      setSelectedPartnerId(null)
      setSelectedMessageId(null)
    } catch (e) {
      setError(e?.message || 'Logout failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmAndLogout = () => {
    const confirmed = window.confirm('Are you sure you want to log out?')
    if (confirmed) {
      handleLogout()
    }
  }

  const donationsChartData = buildChartData(donations, selectedYear)
  const trafficChartData = buildTrafficData(selectedYear)
  const inquiriesChartData = buildInquiriesChartData(messages, selectedYear)
  const engagementChartData = buildEngagementChartData(donations, selectedYear)
  const currentChartData =
    selectedStatTab === 'donations'
      ? donationsChartData
      : selectedStatTab === 'traffic'
      ? trafficChartData
      : selectedStatTab === 'inquiries'
      ? inquiriesChartData
      : engagementChartData

  const totalDonationsYear = donationsChartData.reduce((sum, entry) => sum + entry.donations, 0)

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'short' })
  const currentMonthData =
    donationsChartData.find((entry) => entry.month === currentMonthName) ||
    donationsChartData[donationsChartData.length - 1] ||
    null
  const totalDonationsMonth = currentMonthData ? currentMonthData.donations : 0

  const donorsWithStats = buildDonorStats(donors, donations)
  const activeCampaignCount = campaigns.filter((campaign) => campaign.status === 'Active').length
  const registeredDonorsCount = donorsWithStats.length

  const sf10ByStudentId = sf10Records.reduce((index, record) => {
    index[String(record.studentId)] = record
    return index
  }, {})

  const selectedSf10Student = sf10Students.find((s) => String(s.id) === String(selectedSf10StudentId)) || null
  const selectedSf10Record = selectedSf10StudentId ? sf10ByStudentId[String(selectedSf10StudentId)] || null : null

  const donorsById = donorsWithStats.reduce((index, donor) => {
    index[donor.id] = donor
    return index
  }, {})

  const campaignStats = buildCampaignStats(campaigns, donations)

  const pageTitleMap = {
    dashboard: 'Dashboard',
    donations: 'Online Donations',
    donations_reports: 'Donation Reports',
    campaigns: 'Programs',
    donors: 'Donors',
    reports: 'Donation Reports',
    partners: 'About Us — Partners & Sponsors',
    news: 'News & Updates',
    messages: 'Messages / Website Inquiries',
    orgchart: 'About Us — Organizational Chart',
    sf10: uiText.sf10.title,
    alumni: uiText.alumni.title,
    settings: 'Settings',
    website_home: 'Website Content — Home Page',
    website_about_story: 'About Us — Our Story',
    website_about_mission: 'About Us — Mission & Vision',
    media: 'Media Library',
  }

  const pageSubtitleMap = {
    dashboard: 'Overview of website and content performance',
    donations: 'Manage individual donations and payments',
    donations_reports: 'View summaries and export donation reports',
    campaigns: 'Manage programs and targets',
    donors: 'Manage registered donors and giving history',
    reports: 'View summaries and export donation reports',
    partners: 'Manage partner organizations displayed on the website',
    news: 'Create and manage website news articles',
    messages: 'Display messages submitted via website contact forms',
    orgchart: 'Organization structure (real-time sync if configured)',
    sf10: uiText.sf10.subtitle,
    alumni: uiText.alumni.subtitle,
    settings: 'Configure payment gateways and organization info',
    website_home: 'Manage homepage content synced to the website',
    website_about_story: 'Edit About Us — Our Story section',
    website_about_mission: 'Edit About Us — Mission & Vision section',
    media: 'Manage images and files for the website',
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

  const handleViewSf10 = (studentId) => {
    setSelectedSf10StudentId(studentId)
    setActivePage('sf10')
  }

  const handleBackToSf10List = () => {
    setSelectedSf10StudentId(null)
    setActivePage('sf10')
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

  const handleOrgChartButtonClick = () => {
    setActivePage('orgchart')
  }

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const closeNotifications = () => setIsNotificationsOpen(false)

  useEffect(() => {
    if (!isNotificationsOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeNotifications()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isNotificationsOpen])

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
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900">
      {/* Sidebar is fixed to 100vh (Tailwind h-screen) and uses a scrollable nav region to keep lower items reachable. */}
      <aside className="w-64 shrink-0 sticky top-0 h-screen overflow-hidden bg-[#1B3E2A] text-slate-100 flex flex-col py-6 px-4">
        <div className="flex items-center gap-2 px-3 mb-8">
          <img
            src={papayaLogo}
            alt="Papaya Academy, Inc. logo"
            className="h-9 w-9 rounded-full object-cover bg-white p-[2px] shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
          />
          <div className="text-xl font-semibold tracking-tight">Papaya Academy, Inc.</div>
        </div>

        {/* Scroll container: flex child must have min-h-0 for overflow-y to work reliably in Electron/Chromium. */}
        <nav className="sidebar-scroll flex-1 min-h-0 overflow-y-auto space-y-1 pr-1">
          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activePage === 'dashboard' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
            }`}
            onClick={() => setActivePage('dashboard')}
          >
            <FiHome className="h-4 w-4 shrink-0" />
            <span className="truncate">Dashboard</span>
          </button>

          <div>
            <button
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-100/80 hover:bg-white/5 hover:text-white"
              onClick={toggleWebsiteGroup}
            >
              <div className="flex items-center gap-3">
                <FiFileText className="h-4 w-4 shrink-0" />
                <span className="truncate">Website Content</span>
              </div>
              {openGroups.website ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
            </button>
            {openGroups.website && (
              <div className="mt-1 space-y-1">
                <button
                  className={`w-full flex items-center gap-3 pl-10 pr-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    activePage === 'website_home' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={() => setActivePage('website_home')}
                >
                  <FiHome className="h-4 w-4 shrink-0" />
                  <span className="truncate">Home Page</span>
                </button>

                <div>
                  <button
                    className="w-full flex items-center justify-between gap-3 pl-6 pr-3 py-2.5 rounded-xl text-sm font-medium text-slate-100/80 hover:bg-white/5 hover:text-white"
                    onClick={toggleAboutGroup}
                  >
                    <div className="flex items-center gap-3 pl-4">
                      <FiUsers className="h-4 w-4 shrink-0" />
                      <span className="truncate">About Us</span>
                    </div>
                    {openGroups.about ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
                  </button>
                  {openGroups.about && (
                    <div className="mt-1 space-y-1">
                      <button
                        className={`w-full flex items-center gap-3 pl-14 pr-3 py-2.5 rounded-xl text-sm font-medium transition ${
                          activePage === 'website_about_story' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
                        }`}
                        onClick={() => setActivePage('website_about_story')}
                      >
                        <FiFileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">Our Story</span>
                      </button>
                      <button
                        className={`w-full flex items-center gap-3 pl-14 pr-3 py-2.5 rounded-xl text-sm font-medium transition ${
                          activePage === 'website_about_mission' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
                        }`}
                        onClick={() => setActivePage('website_about_mission')}
                      >
                        <FiFileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">Mission & Vision</span>
                      </button>
                      <button
                        className={`w-full flex items-center gap-3 pl-14 pr-3 py-2.5 rounded-xl text-sm font-medium transition ${
                          activePage === 'orgchart' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
                        }`}
                        onClick={() => setActivePage('orgchart')}
                      >
                        <FiUsers className="h-4 w-4 shrink-0" />
                        <span className="truncate">Organizational Chart</span>
                      </button>
                      <button
                        className={`w-full flex items-center gap-3 pl-14 pr-3 py-2.5 rounded-xl text-sm font-medium transition ${
                          activePage === 'partners' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
                        }`}
                        onClick={() => setActivePage('partners')}
                      >
                        <FiUsers className="h-4 w-4 shrink-0" />
                        <span className="truncate">Partners & Sponsors</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activePage === 'campaigns' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
            }`}
            onClick={() => setActivePage('campaigns')}
          >
            <FiBriefcase className="h-4 w-4 shrink-0" />
            <span className="truncate">Programs</span>
          </button>

          <div>
            <button
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-100/80 hover:bg-white/5 hover:text-white"
              onClick={toggleDonationsGroup}
            >
              <div className="flex items-center gap-3">
                <FiGift className="h-4 w-4 shrink-0" />
                <span className="truncate">Donations</span>
              </div>
              {openGroups.donations ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
            </button>
            {openGroups.donations && (
              <div className="mt-1 space-y-1">
                <button
                  className={`w-full flex items-center gap-3 pl-10 pr-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    activePage === 'donations' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={() => setActivePage('donations')}
                >
                  <FiGift className="h-4 w-4 shrink-0" />
                  <span className="truncate">Online Donations</span>
                </button>
                <button
                  className={`w-full flex items-center gap-3 pl-10 pr-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    activePage === 'donations_reports' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={() => setActivePage('donations_reports')}
                >
                  <FiFileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">Donation Reports</span>
                </button>
              </div>
            )}
          </div>

          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activePage === 'news' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
            }`}
            onClick={() => setActivePage('news')}
          >
            <FiFileText className="h-4 w-4 shrink-0" />
            <span className="truncate">News & Updates</span>
          </button>

          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activePage === 'sf10' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
            }`}
            onClick={() => {
              setSelectedSf10StudentId(null)
              setActivePage('sf10')
            }}
          >
            <FiFileText className="h-4 w-4 shrink-0" />
            <span className="truncate">{uiText.nav.sf10}</span>
          </button>

          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activePage === 'alumni' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
            }`}
            onClick={() => setActivePage('alumni')}
          >
            <FiUsers className="h-4 w-4 shrink-0" />
            <span className="truncate">{uiText.nav.alumni}</span>
          </button>

          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activePage === 'messages' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
            }`}
            onClick={() => setActivePage('messages')}
          >
            <FiMail className="h-4 w-4 shrink-0" />
            <span className="truncate">Messages / Website Inquiries</span>
          </button>

          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activePage === 'media' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
            }`}
            onClick={() => setActivePage('media')}
          >
            <FiImage className="h-4 w-4 shrink-0" />
            <span className="truncate">Media Library</span>
          </button>

          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activePage === 'settings' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
            }`}
            onClick={() => setActivePage('settings')}
          >
            <FiSettings className="h-4 w-4 shrink-0" />
            <span className="truncate">Settings</span>
          </button>

          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-100/80 hover:bg-white/5 hover:text-white`}
            onClick={confirmAndLogout}
          >
            <FiLogOut className="h-4 w-4 shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        </nav>

        <div className="mt-6 px-3">
          <div className="rounded-2xl bg-white/5 px-4 py-3 text-xs text-slate-100/80">
            <div className="font-semibold text-white mb-1">Papaya Academy, Inc. 2025</div>
            <p className="text-slate-100/70">
              Track your donations, alumni, and partners in a single dashboard.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col px-6 py-5 gap-6 overflow-y-auto min-h-0">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{headerTitle}</h1>
            <p className="text-sm text-slate-500">{headerSubtitle}</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="relative h-9 w-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
              title="Notifications"
              onClick={() => setIsNotificationsOpen(true)}
              type="button"
            >
              <FiBell className="h-4 w-4" />
              {messages.some((m) => !m.read) && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center">
                  {messages.filter((m) => !m.read).length}
                </span>
              )}
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#1B3E2A] to-[#28573F] text-sm font-semibold text-white flex items-center justify-center">
              D
            </div>
          </div>
        </header>

        <div
          className={`fixed inset-0 z-[60] ${isNotificationsOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          aria-hidden={!isNotificationsOpen}
        >
          <div
            className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ${
              isNotificationsOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeNotifications}
          />

          <aside
            className={`absolute right-0 top-0 h-full w-[420px] max-w-[92vw] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)] transition-transform duration-200 ease-out flex flex-col ${
              isNotificationsOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Notifications panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold text-slate-900">Notifications</div>
                <div className="text-xs text-slate-500">{messages.filter((m) => !m.read).length} unread</div>
              </div>
              <button
                type="button"
                className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
                onClick={closeNotifications}
                aria-label="Close notifications"
                title="Close"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-slate-500">No notifications yet.</div>
              )}

              <div className="divide-y divide-slate-100">
                {messages.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="w-full text-left px-5 py-4 hover:bg-slate-50 transition flex items-start gap-3"
                    onClick={() => {
                      setMessages((prev) => prev.map((msg) => (String(msg.id) === String(m.id) ? { ...msg, read: true } : msg)))
                    }}
                  >
                    <div className="pt-1">
                      <div className={`h-2.5 w-2.5 rounded-full ${m.read ? 'bg-slate-200' : 'bg-emerald-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{m.name || 'Inquiry'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{m.message || m.subject || 'New message received.'}</div>
                      {m.time && <div className="text-[11px] text-slate-400 mt-1">{m.time}</div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-200 bg-white">
              <button
                type="button"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMessages((prev) => prev.map((m) => ({ ...m, read: true })))}
              >
                Mark all as read
              </button>
            </div>
          </aside>
        </div>

        <div className="flex-1 flex gap-6 min-h-0">
          <section className="flex-1 flex flex-col gap-6 min-h-0">
            {activePage === 'dashboard' && (
              <>
                <div className="grid grid-cols-4 gap-4">
                  <SummaryCard
                    title="Website Visitors (Monthly)"
                    value={String(
                      (trafficChartData.find((e) => e.month === currentMonthName)?.visitors || 0).toLocaleString('en-PH')
                    )}
                    subtitle={`This month (${selectedYear})`}
                    tone="green"
                    onClick={() => setActivePage('dashboard')}
                  />
                  <SummaryCard
                    title="Active Published Programs"
                    value={String(activeCampaignCount)}
                    subtitle="Live on website"
                    tone="amber"
                    onClick={() => setActivePage('campaigns')}
                  />
                  <SummaryCard
                    title="Pending Website Inquiries"
                    value={String(messages.filter((m) => !m.read).length)}
                    subtitle="Unread messages"
                    tone="sky"
                    onClick={() => setActivePage('messages')}
                  />
                  <SummaryCard
                    title="Draft Website Content"
                    value={String(0)}
                    subtitle="Unpublished items"
                    tone="sky"
                    onClick={() => setActivePage('news')}
                  />
                </div>

                <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">Statistics</h2>
                      <p className="text-xs text-slate-500">
                        {selectedStatTab === 'donations' && 'Monthly donations vs disbursements'}
                        {selectedStatTab === 'traffic' && 'Monthly website visitors'}
                        {selectedStatTab === 'inquiries' && 'Monthly inquiry submissions'}
                        {selectedStatTab === 'engagement' && 'Program engagement by donations (count)'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {selectedStatTab === 'donations' && (
                        <>
                          <LegendDot color="bg-[#1B3E2A]" label="Donations Received" />
                          <LegendDot color="bg-[#F2C94C]" label="Disbursements / Expenses" />
                        </>
                      )}
                      {selectedStatTab === 'traffic' && <LegendDot color="bg-[#1B3E2A]" label="Visitors" />}
                      {selectedStatTab === 'inquiries' && <LegendDot color="bg-[#1B3E2A]" label="Inquiries" />}
                      {selectedStatTab === 'engagement' && <LegendDot color="bg-[#1B3E2A]" label="Engagement" />}
                      <div className="ml-2 inline-flex items-center rounded-full bg-slate-50 border border-slate-200 p-0.5">
                        <button
                          className={`px-2 py-1 rounded-full ${selectedStatTab === 'donations' ? 'bg-white text-slate-700 border border-slate-200' : 'text-slate-500'}`}
                          onClick={() => setSelectedStatTab('donations')}
                        >
                          Donations
                        </button>
                        <button
                          className={`px-2 py-1 rounded-full ${selectedStatTab === 'traffic' ? 'bg-white text-slate-700 border border-slate-200' : 'text-slate-500'}`}
                          onClick={() => setSelectedStatTab('traffic')}
                        >
                          Website Traffic
                        </button>
                        <button
                          className={`px-2 py-1 rounded-full ${selectedStatTab === 'inquiries' ? 'bg-white text-slate-700 border border-slate-200' : 'text-slate-500'}`}
                          onClick={() => setSelectedStatTab('inquiries')}
                        >
                          Inquiries
                        </button>
                        <button
                          className={`px-2 py-1 rounded-full ${selectedStatTab === 'engagement' ? 'bg-white text-slate-700 border border-slate-200' : 'text-slate-500'}`}
                          onClick={() => setSelectedStatTab('engagement')}
                        >
                          Engagement
                        </button>
                      </div>
                      <select
                        className="ml-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
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
                      <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="donations" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1B3E2A" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#1B3E2A" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="disbursements" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F2C94C" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#F2C94C" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="visitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1B3E2A" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#1B3E2A" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="uniqueVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6EE7B7" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="inquiries" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1B3E2A" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#1B3E2A" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="engagement" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1B3E2A" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#1B3E2A" stopOpacity={0} />
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
                            selectedStatTab === 'donations'
                              ? formatCurrency(value)
                              : typeof value === 'number'
                              ? value.toLocaleString('en-PH')
                              : value,
                            selectedStatTab === 'donations'
                              ? name === 'donations'
                                ? 'Donations Received'
                                : 'Disbursements / Expenses'
                              : selectedStatTab === 'traffic'
                              ? name === 'visitors'
                                ? 'Visitors'
                                : 'Unique Visitors'
                              : selectedStatTab === 'inquiries'
                              ? 'Inquiries'
                              : 'Engagement',
                          ]}
                        />
                        {selectedStatTab === 'donations' && (
                          <>
                            <Area type="monotone" dataKey="donations" stroke="#1B3E2A" strokeWidth={2.5} fillOpacity={1} fill="url(#donations)" />
                            <Area type="monotone" dataKey="disbursements" stroke="#F2C94C" strokeWidth={2.5} fillOpacity={1} fill="url(#disbursements)" />
                          </>
                        )}
                        {selectedStatTab === 'traffic' && (
                          <>
                            <Area type="monotone" dataKey="visitors" stroke="#1B3E2A" strokeWidth={2.5} fillOpacity={1} fill="url(#visitors)" />
                            <Area type="monotone" dataKey="uniqueVisitors" stroke="#6EE7B7" strokeWidth={2.5} fillOpacity={1} fill="url(#uniqueVisitors)" />
                          </>
                        )}
                        {selectedStatTab === 'inquiries' && (
                          <Area type="monotone" dataKey="inquiries" stroke="#1B3E2A" strokeWidth={2.5} fillOpacity={1} fill="url(#inquiries)" />
                        )}
                        {selectedStatTab === 'engagement' && (
                          <Area type="monotone" dataKey="engagement" stroke="#1B3E2A" strokeWidth={2.5} fillOpacity={1} fill="url(#engagement)" />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-slate-900">Top Partners & Sponsors</h2>
                  </div>
                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-white text-left text-slate-500 border-b border-slate-200">
                            <th className="py-3 px-4 font-medium whitespace-nowrap">Organization</th>
                            <th className="py-3 px-4 font-medium whitespace-nowrap">Contribution Type</th>
                            <th className="py-3 px-4 font-medium whitespace-nowrap">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {partners.slice(0, 6).map((partner) => (
                            <tr key={partner.id || partner.name} className="bg-white">
                              <td className="py-3 px-4 whitespace-nowrap text-slate-900">{partner.name}</td>
                              <td className="py-3 px-4 whitespace-nowrap text-slate-700">{partner.type || partner.label}</td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    partner.status === 'Active'
                                      ? 'bg-[#1B3E2A]/10 text-[#1B3E2A]'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {partner.status || 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activePage === 'donations' && (
              <DonationsSection
                donations={donations}
                selectedDonationId={selectedDonationId}
                onSelectDonation={handleSelectDonation}
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
                  const name = window.prompt('Program name:')
                  if (!name) return
                  const targetInput = window.prompt('Target amount:', '100000')
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
              />
            )}
            {(activePage === 'reports' || activePage === 'donations_reports') && (
              <ReportsSection donations={donations} campaigns={campaigns} />
            )}
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
            {activePage === 'news' && <NewsManager />}
            {activePage === 'messages' && (
              <ContactsSection
                messages={messages}
                selectedMessageId={selectedMessageId}
                onSelectMessage={handleSelectMessage}
                onToggleMessageRead={handleToggleMessageRead}
              />
            )}
            {activePage === 'orgchart' && <OrgChartHtmlSection />}
            {activePage === 'sf10' && (
              <>
                {!selectedSf10StudentId && (
                  <SF10Section
                    students={sf10Students}
                    sf10ByStudentId={sf10ByStudentId}
                    onViewSf10={handleViewSf10}
                    onAddStudent={() => window.alert(uiText.sf10.placeholders.add)}
                    onEditSf10={() => window.alert(uiText.sf10.placeholders.edit)}
                    onRemoveStudent={(studentId) => {
                      const confirmed = window.confirm(uiText.sf10.placeholders.remove)
                      if (!confirmed) return
                      setSf10Students((prev) => prev.filter((s) => String(s.id) !== String(studentId)))
                      setSf10Records((prev) => prev.filter((r) => String(r.studentId) !== String(studentId)))
                    }}
                  />
                )}
                {selectedSf10StudentId && (
                  <SF10View
                    student={selectedSf10Student}
                    record={selectedSf10Record}
                    onBack={handleBackToSf10List}
                  />
                )}
              </>
            )}
            {activePage === 'alumni' && <AlumniSection alumni={alumniMock} />}
            {activePage === 'website_home' && <WebsiteHomeSection />}
            {activePage === 'website_about_story' && <StaticContentSection title="Our Story" />}
            {activePage === 'website_about_mission' && <MissionVisionValuesSection />}
            {activePage === 'media' && <MediaLibrarySection />}
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

function WebsiteHomeSection() {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 flex-1 text-xs">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Home Page</h2>
        <p className="text-xs text-slate-500">Manage homepage content synced to the website</p>
      </div>
      <div className="text-xs text-slate-500">This is a placeholder for homepage content management.</div>
    </div>
  )
}

function StaticContentSection({ title }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 flex-1 text-xs">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">Edit content for the About Us section</p>
      </div>
      <div className="text-xs text-slate-500">This is a placeholder for rich text editing and publishing.</div>
    </div>
  )
}

function MissionVisionValuesSection() {
  // Local mock data (frontend-only).
  const [items, setItems] = useState([
    {
      id: 'mvv-1',
      type: 'Mission',
      title: 'Our Mission',
      content: 'To provide quality learning experiences that nurture character, competence, and compassion in every learner.',
    },
    {
      id: 'mvv-2',
      type: 'Vision',
      title: 'Our Vision',
      content: 'A future-ready community of learners empowered to lead with integrity and serve with love.',
    },
    {
      id: 'mvv-3',
      type: 'Values',
      title: 'Our Values',
      content: 'Faith\nExcellence\nRespect\nService\nInnovation',
    },
  ])

  const [modal, setModal] = useState(null)
  const [formType, setFormType] = useState('Mission')
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')

  const buildId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

  const openAdd = () => {
    setModal({ mode: 'add', id: null })
    setFormType('Mission')
    setFormTitle('')
    setFormContent('')
  }

  const openEdit = (item) => {
    setModal({ mode: 'edit', id: item.id })
    setFormType(item.type)
    setFormTitle(item.title || '')
    setFormContent(item.content || '')
  }

  const handleRemove = (item) => {
    const label = item.title ? item.title : `${item.type} Content`
    const ok = window.confirm(`Remove "${label}"? This cannot be undone.`)
    if (!ok) return
    setItems((prev) => prev.filter((e) => e.id !== item.id))
  }

  const handleSave = () => {
    const nextType = String(formType || '').trim()
    const nextTitle = String(formTitle || '').trim()
    const nextContent = String(formContent || '').trim()

    if (!nextType) {
      window.alert('Please select a Type.')
      return
    }

    if (!nextContent) {
      window.alert('Please enter Content.')
      return
    }

    if (modal?.mode === 'add') {
      const newItem = { id: buildId(), type: nextType, title: nextTitle, content: nextContent }
      setItems((prev) => [newItem, ...prev])
      setModal(null)
      return
    }

    if (modal?.mode === 'edit') {
      setItems((prev) =>
        prev.map((e) => (e.id === modal.id ? { ...e, type: nextType, title: nextTitle, content: nextContent } : e)),
      )
      setModal(null)
    }
  }

  const missionItems = items.filter((e) => e.type === 'Mission')
  const visionItems = items.filter((e) => e.type === 'Vision')
  const valuesItems = items.filter((e) => e.type === 'Values')

  const ContentCard = ({ item }) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              {item.title ? item.title : `${item.type} Content`}
            </h3>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600">
              {item.type}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => openEdit(item)}
          >
            <FiEdit2 className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
            onClick={() => handleRemove(item)}
          >
            <FiTrash2 className="h-4 w-4" />
            Remove
          </button>
        </div>
      </div>
      <div className="mt-3 whitespace-pre-wrap text-xs text-slate-600 leading-relaxed">{item.content}</div>
    </div>
  )

  const CardStack = ({ list, emptyLabel }) => (
    <div className="flex flex-col gap-4">
      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-xs text-slate-500">
          {emptyLabel}
        </div>
      ) : (
        list.map((item) => <ContentCard key={item.id} item={item} />)
      )}
    </div>
  )

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 flex-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Mission, Vision & Values</h2>
          <p className="text-xs text-slate-500">Manage the About Us content shown on the website</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-[#1B3E2A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#163021]"
          onClick={openAdd}
        >
          <FiPlus className="h-4 w-4" />
          Add New
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <div className="text-sm font-semibold text-slate-900 mb-3">Mission</div>
          <CardStack list={missionItems} emptyLabel="No Mission content yet." />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-semibold text-slate-900 mb-3">Vision</div>
            <CardStack list={visionItems} emptyLabel="No Vision content yet." />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 mb-3">Values</div>
            <CardStack list={valuesItems} emptyLabel="No Values content yet." />
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-3xl shadow-sm p-5 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-medium text-slate-500">
                  {modal.mode === 'add' ? 'Add content' : 'Edit content'}
                </div>
                <div className="text-sm font-semibold text-slate-900">Mission / Vision / Values</div>
              </div>
              <button
                type="button"
                className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
                onClick={() => setModal(null)}
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <div className="text-[11px] text-slate-500 mb-1">Type</div>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                >
                  <option value="Mission">Mission</option>
                  <option value="Vision">Vision</option>
                  <option value="Values">Values</option>
                </select>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-1">Title (optional)</div>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-1">Content</div>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={8}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-2xl bg-[#1B3E2A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163021]"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MediaLibrarySection() {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 flex-1 text-xs">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Media Library</h2>
        <p className="text-xs text-slate-500">Manage images and files for the website</p>
      </div>
      <div className="text-xs text-slate-500">This is a placeholder for uploading and organizing media.</div>
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

function DonationsSection({ donations, selectedDonationId, onSelectDonation, baseCurrency }) {
  const [statusFilter, setStatusFilter] = useState('All')
  const [methodFilter, setMethodFilter] = useState('All')

  const filteredDonations = donations
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

      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-white text-left text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 font-medium whitespace-nowrap">Donation ID</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Donor Name</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Program</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Amount</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Payment Method</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Status</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Date</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {filteredDonations.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 px-4 text-center text-slate-500">
                  No donations found.
                </td>
              </tr>
            )}
            {filteredDonations.map((donation) => (
              <tr
                key={donation.id}
                className={selectedDonationId === donation.id ? 'bg-slate-50' : 'bg-white'}
              >
                <td className="py-3 px-4 whitespace-nowrap text-slate-600">{donation.id}</td>
                <td className="py-3 px-4 whitespace-nowrap text-slate-900">{donation.donorName}</td>
                <td className="py-3 px-4 whitespace-nowrap text-slate-700">{donation.campaignName}</td>
                <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                  {formatCurrency(donation.amount, donation.currency || baseCurrency || 'PHP')}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-slate-700">{donation.method}</td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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
                <td className="py-3 px-4 whitespace-nowrap text-slate-600">{donation.date}</td>
                <td className="py-3 px-4 whitespace-nowrap text-right">
                  <button
                    className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
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
                <div className="text-[11px] text-slate-500">Program</div>
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
          <h2 className="text-base font-semibold text-slate-900">Programs</h2>
          <p className="text-xs text-slate-500">Manage active and archived programs</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-white text-left text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 font-medium whitespace-nowrap">Program</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Target Amount</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Total Collected</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Progress</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Status</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className={selectedCampaignId === campaign.id ? 'bg-slate-50' : 'bg-white'}
              >
                <td
                  className="py-3 px-4 whitespace-nowrap text-slate-900 cursor-pointer"
                  onClick={() => onSelectCampaign(campaign.id)}
                >
                  {campaign.name}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                  {formatCurrency(campaign.targetAmount)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                  {formatCurrency(campaign.collected)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                  {campaign.progressPercent}% funded
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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
                <td className="py-3 px-4 whitespace-nowrap text-right">
                  <button
                    className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 mr-2"
                    onClick={() => {
                      setEditingCampaign(campaign)
                      setEditingTarget(String(campaign.targetAmount || 0))
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
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
                <div className="text-[11px] font-medium text-slate-500">Program details</div>
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
              <div className="text-[11px] font-medium text-slate-500 mb-1">Donations for this program</div>
              {selectedCampaign.donations.length === 0 ? (
                <div className="text-xs text-slate-400">No donations linked to this program yet.</div>
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
                <div className="text-[11px] font-medium text-slate-500">Edit program</div>
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
                <div className="text-[11px] text-slate-500 mb-0.5">Target amount</div>
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

function DonorsSection({ donors, selectedDonorId, onSelectDonor }) {
  const filteredDonors = donors
    .filter((donor) => {
      return Boolean(donor)
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

      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-white text-left text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 font-medium whitespace-nowrap">Donor</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Email</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Total Donations</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Last Donation</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {filteredDonors.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 px-4 text-center text-slate-500">
                  No donors found.
                </td>
              </tr>
            )}
            {filteredDonors.map((donor) => (
              <tr
                key={donor.id}
                className={selectedDonorId === donor.id ? 'bg-slate-50' : 'bg-white'}
              >
                <td className="py-3 px-4 whitespace-nowrap text-slate-900">{donor.name}</td>
                <td className="py-3 px-4 whitespace-nowrap text-slate-700">{donor.email}</td>
                <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                  {formatCurrency(donor.total, donor.currency || 'PHP')}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-slate-600">{donor.lastDonation}</td>
                <td className="py-3 px-4 whitespace-nowrap text-right">
                  <button
                    className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
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
                <div className="text-[11px] text-slate-500">Programs supported</div>
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
                        <th className="px-1 py-1 font-medium">Program</th>
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
    const header = ['Donation ID', 'Donor', 'Program', 'Amount', 'Method', 'Status', 'Date']
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
          <div className="text-[11px] font-medium text-slate-500">Program</div>
          <select
            className="w-full rounded-2xl border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
            value={campaignFilter}
            onChange={(event) => setCampaignFilter(event.target.value)}
          >
            <option value="all">All programs</option>
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

      <div className="rounded-2xl border border-slate-200 overflow-hidden mb-2">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-white text-left text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 font-medium whitespace-nowrap">From</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Subject</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Received</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Status</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {sortedMessages.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 px-4 text-center text-slate-500">
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
                  className={selectedMessageId === message.id ? 'bg-slate-50' : 'bg-white'}
                >
                  <td className="py-3 px-4 whitespace-nowrap text-slate-900">{message.fromName}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-700 truncate max-w-[260px]">
                    {message.subject}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-600">{formatted}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        message.read
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-[#1B3E2A]/10 text-[#1B3E2A]'
                      }`}
                    >
                      {message.read ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    <button
                      className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 mr-2"
                      onClick={() => onSelectMessage(message.id)}
                    >
                      Open
                    </button>
                    <button
                      className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
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
          <h2 className="text-base font-semibold text-slate-900">Partners & Sponsors</h2>
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
            className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
            onClick={onAddPartner}
          >
            Add partner
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-white text-left text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 font-medium whitespace-nowrap">Organization</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Contact Person</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Contribution Type</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {partners.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 px-4 text-center text-slate-500">
                  No partners added yet.
                </td>
              </tr>
            )}
            {partners.map((partner) => (
              <tr
                key={partner.id}
                className={selectedPartnerId === partner.id ? 'bg-slate-50 cursor-pointer' : 'bg-white cursor-pointer'}
                onClick={() => onSelectPartner(partner.id)}
              >
                <td className="py-3 px-4 whitespace-nowrap text-slate-900">{partner.name}</td>
                <td className="py-3 px-4 whitespace-nowrap text-slate-700">{partner.contact}</td>
                <td className="py-3 px-4 whitespace-nowrap text-slate-700">{partner.type}</td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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

function OrgChartSection({ orgChart }) {
  const [expanded, setExpanded] = useState(new Set())

  useEffect(() => {
    const ids = new Set()
    const walk = (node) => {
      if (!node) return
      ids.add(node.id)
      if (Array.isArray(node.children)) node.children.forEach(walk)
    }
    walk(orgChart)
    setExpanded(ids)
  }, [orgChart])

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const OrgNode = ({ node, level = 0 }) => {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0
    const isOpen = expanded.has(node.id)
    return (
      <div className="ml-0">
        <div className="flex items-center gap-2 py-1">
          {hasChildren ? (
            <button
              className="h-5 w-5 rounded border border-slate-200 text-[10px] text-slate-600 hover:bg-slate-50"
              onClick={() => toggle(node.id)}
              title={isOpen ? 'Collapse' : 'Expand'}
            >
              {isOpen ? '−' : '+'}
            </button>
          ) : (
            <span className="h-5 w-5" />
          )}
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-1">
            <div className="text-sm font-semibold text-slate-900">{node.name}</div>
            {node.title ? (
              <div className="text-[11px] text-slate-500">{node.title}</div>
            ) : null}
          </div>
        </div>
        {hasChildren && isOpen && (
          <div className="ml-6 border-l border-slate-200 pl-4">
            {node.children.map((child) => (
              <OrgNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Organizational Chart</h2>
          <p className="text-xs text-slate-500">Live organization structure</p>
        </div>
      </div>

      {!orgChart ? (
        <div className="text-[11px] text-slate-400">No organization data available.</div>
      ) : (
        <div className="text-xs">
          <OrgNode node={orgChart} />
        </div>
      )}
    </div>
  )
}

function OrgChartHtmlSection() {
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [memberModal, setMemberModal] = useState(null)
  const [formName, setFormName] = useState('')
  const [formPosition, setFormPosition] = useState('')
  const [formDepartment, setFormDepartment] = useState('')
  const [formReportsTo, setFormReportsTo] = useState('')
  const [formOrder, setFormOrder] = useState('')
  const [formImageFile, setFormImageFile] = useState(null)
  const [formImagePreviewUrl, setFormImagePreviewUrl] = useState('')
  const [formPreviousImagePath, setFormPreviousImagePath] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const DEPARTMENTS = {
    schoolOrg: 'School Organization',
    gradeAdvisers: 'Grade Advisers',
    nonAcademic: 'Non-Academic Staff',
    boardPh: 'Kalinga at Pag-Ibig Foundation (PH) Board',
    boardPapaya: 'Papaya Academy Inc. Board',
    boardNl: 'Stitching Kalinga (NL) Board',
  }

  const parseGradeFromPosition = (text) => {
    const match = String(text || '').match(/Grade\s+(\d+)/i)
    const grade = match ? Number(match[1]) : NaN
    if (!Number.isFinite(grade)) return null
    if (grade < 1 || grade > 6) return null
    return grade
  }

  const refresh = async () => {
    setIsLoading(true)
    setError('')

    try {
      const [loadedMeta, loadedMembers] = await Promise.all([
        orgChartService.getMeta(),
        orgChartService.getMembers(),
      ])
      setMetaTitle(loadedMeta?.title || '')
      setMetaDescription(loadedMeta?.description || '')
      setMembers(Array.isArray(loadedMembers) ? loadedMembers : [])
    } catch (e) {
      setError(e?.message || 'Unable to load organizational chart.')
      setMembers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await refresh()
      } finally {
        if (!cancelled) {
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const openAddModal = () => {
    setMemberModal({ mode: 'add', id: null })
    setFormName('')
    setFormPosition('')
    setFormDepartment(DEPARTMENTS.gradeAdvisers)
    setFormReportsTo('')
    setFormOrder('')
    setFormImageFile(null)
    setFormImagePreviewUrl('')
    setFormPreviousImagePath('')
    setIsSaving(false)
  }

  const openEditModal = (member) => {
    setMemberModal({ mode: 'edit', id: member.id })
    setFormName(member.name || '')
    setFormPosition(member.position || '')
    setFormDepartment(member.department || DEPARTMENTS.gradeAdvisers)
    setFormReportsTo(member.reportsTo || '')
    setFormOrder(member.order === 0 || member.order ? String(member.order) : '')
    setFormImageFile(null)
    setFormImagePreviewUrl(member.imageUrl || '')
    setFormPreviousImagePath(member.imagePath || '')
    setIsSaving(false)
  }

  const handleImageChange = (event) => {
    const file = event.target.files && event.target.files[0]
    setFormImageFile(file || null)
    if (file) {
      const url = URL.createObjectURL(file)
      setFormImagePreviewUrl(url)
    }
  }

  const uploadMemberImage = async ({ memberId, file }) => {
    const storage = getFirebaseStorage()
    const safeName = String(file?.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `orgchartMembers/${String(memberId)}/${Date.now()}-${safeName}`
    const objectRef = storageRef(storage, path)
    await uploadBytes(objectRef, file)
    const url = await getDownloadURL(objectRef)
    return { url, path }
  }

  const handleSave = async () => {
    if (!memberModal || isSaving) return

    const trimmedName = String(formName || '').trim()
    const trimmedPosition = String(formPosition || '').trim()
    if (!trimmedName || !trimmedPosition) {
      window.alert('Please enter both Name and Position.')
      return
    }

    const orderNumber = Number(formOrder)
    const order = Number.isFinite(orderNumber) ? orderNumber : Date.now()

    setIsSaving(true)
    try {
      let memberId = memberModal.id
      let currentImageUrl = memberModal.mode === 'edit' ? formImagePreviewUrl : ''
      let currentImagePath = memberModal.mode === 'edit' ? formPreviousImagePath : ''

      if (memberModal.mode === 'add') {
        const created = await orgChartService.addMember({
          name: trimmedName,
          position: trimmedPosition,
          department: String(formDepartment || '').trim(),
          reportsTo: String(formReportsTo || '').trim(),
          order,
        })
        memberId = created.id
      }

      if (formImageFile) {
        const uploaded = await uploadMemberImage({ memberId, file: formImageFile })
        currentImageUrl = uploaded.url
        currentImagePath = uploaded.path

        if (formPreviousImagePath) {
          try {
            const storage = getFirebaseStorage()
            await deleteObject(storageRef(storage, formPreviousImagePath))
          } catch {
          }
        }
      }

      await orgChartService.updateMember({
        id: memberId,
        name: trimmedName,
        position: trimmedPosition,
        department: String(formDepartment || '').trim(),
        reportsTo: String(formReportsTo || '').trim(),
        order,
        imageUrl: currentImageUrl || '',
        imagePath: currentImagePath || '',
      })

      setMemberModal(null)
      await refresh()
    } catch (e) {
      window.alert(e?.message || 'Unable to save member.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = async (member) => {
    if (!member?.id) return
    const confirmed = window.confirm('Remove this member?')
    if (!confirmed) return

    try {
      await orgChartService.removeMember(member.id)
    } catch (e) {
      window.alert(e?.message || 'Unable to remove member.')
      return
    }

    if (member.imagePath) {
      try {
        const storage = getFirebaseStorage()
        await deleteObject(storageRef(storage, member.imagePath))
      } catch {
      }
    }

    await refresh()
  }

  const Avatar = ({ label = '?', size = 'md' }) => {
    const sizeClass = size === 'lg' ? 'h-24 w-24 text-2xl' : size === 'sm' ? 'h-14 w-14 text-sm' : 'h-[72px] w-[72px] text-lg'
    return (
      <div
        className={`rounded-full bg-white ring-2 ring-[#1B3E2A]/70 shadow-sm flex items-center justify-center ${sizeClass}`}
      >
        <div className="h-[calc(100%-10px)] w-[calc(100%-10px)] rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center">
          {String(label || '?').slice(0, 1).toUpperCase()}
        </div>
      </div>
    )
  }

  const StaffCard = ({ member, avatarSize = 'md' }) => (
    <div className="group flex flex-col items-center">
      <div className="mb-3">
        {member.imageUrl ? (
          <img
            src={member.imageUrl}
            alt={member.name}
            className={`rounded-full object-cover bg-white ring-2 ring-[#1B3E2A]/70 shadow-sm ${
              avatarSize === 'lg'
                ? 'h-24 w-24'
                : avatarSize === 'sm'
                ? 'h-14 w-14'
                : 'h-[72px] w-[72px]'
            }`}
          />
        ) : (
          <Avatar label={member.name} size={avatarSize} />
        )}
      </div>

      <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="px-4 pb-4 pt-4 flex flex-col items-center text-center gap-3">
          <div className="w-full">
            <div className="text-sm font-semibold text-slate-900 leading-snug">{member.name}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{member.position}</div>
          </div>

          <div className="w-full flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => openEditModal(member)}
              title="Edit staff"
            >
              <FiEdit2 className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
              onClick={() => handleRemove(member)}
              title="Remove staff"
            >
              <FiTrash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const SectionShell = ({ title, subtitle, columnsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', children }) => (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-[#1B3E2A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#163021]"
          onClick={openAddModal}
        >
          <FiPlus className="h-4 w-4" />
          Add
        </button>
      </div>

      <div className={`grid ${columnsClass} gap-6`}>{children}</div>
    </div>
  )

  const byDept = (dept) => members.filter((m) => String(m.department || '') === String(dept || ''))
  const schoolOrg = byDept(DEPARTMENTS.schoolOrg)
  const gradeAdvisers = byDept(DEPARTMENTS.gradeAdvisers)
  const nonAcademic = byDept(DEPARTMENTS.nonAcademic)
  const boardPh = byDept(DEPARTMENTS.boardPh)
  const boardPapaya = byDept(DEPARTMENTS.boardPapaya)
  const boardNl = byDept(DEPARTMENTS.boardNl)

  const schoolPrincipal = schoolOrg.filter((m) => String(m.position || '').toLowerCase().includes('principal'))
  const otherSchoolOrg = schoolOrg.filter((m) => !String(m.position || '').toLowerCase().includes('principal'))

  return (
    <div className="flex flex-col gap-5 flex-1">
      <div className="bg-white rounded-3xl shadow-sm p-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{metaTitle || 'Organizational Chart'}</h2>
          <p className="text-xs text-slate-500">{metaDescription || 'Manage the org chart that the website displays'}</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-[#1B3E2A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#163021]"
          onClick={openAddModal}
        >
          <FiPlus className="h-4 w-4" />
          Add
        </button>
      </div>

      {isLoading ? <div className="text-[11px] text-slate-400">Loading…</div> : null}
      {!isLoading && error ? <div className="text-[11px] text-rose-600">{error}</div> : null}

      {!isLoading && !error && members.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-5 text-[11px] text-slate-400">No org chart members yet.</div>
      ) : null}

      {!isLoading && !error && members.length > 0 ? (
        <>
          <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Papaya Academy — School Organization</h2>
                <p className="text-xs text-slate-500">Org chart sections powered by Firestore</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-[#1B3E2A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#163021]"
                onClick={openAddModal}
              >
                <FiPlus className="h-4 w-4" />
                Add
              </button>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                {schoolPrincipal.map((m) => (
                  <StaffCard key={m.id} member={m} avatarSize="lg" />
                ))}
              </div>
            </div>

            {otherSchoolOrg.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {otherSchoolOrg.map((m) => (
                  <StaffCard key={m.id} member={m} />
                ))}
              </div>
            ) : null}

            <div className="pt-1">
              <div className="text-sm font-semibold text-[#1B3E2A] text-center">Grade Advisers</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gradeAdvisers.map((m) => (
                <StaffCard key={m.id} member={m} />
              ))}
            </div>

            <div className="pt-2">
              <div className="text-sm font-semibold text-[#1B3E2A] text-center mb-4">Non-Academic Staff</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nonAcademic.map((m) => (
                  <StaffCard key={m.id} member={m} />
                ))}
              </div>
            </div>
          </div>

          <SectionShell
            title={DEPARTMENTS.boardPh}
            subtitle="Board composition"
            columnsClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {boardPh.map((m) => (
              <StaffCard key={m.id} member={m} avatarSize="sm" />
            ))}
          </SectionShell>

          <SectionShell
            title={DEPARTMENTS.boardPapaya}
            subtitle="Board composition"
            columnsClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {boardPapaya.map((m) => (
              <StaffCard key={m.id} member={m} avatarSize="sm" />
            ))}
          </SectionShell>

          <SectionShell
            title={DEPARTMENTS.boardNl}
            subtitle="Board composition"
            columnsClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {boardNl.map((m) => (
              <StaffCard key={m.id} member={m} avatarSize="sm" />
            ))}
          </SectionShell>
        </>
      ) : null}

      {memberModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onClick={() => setMemberModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-sm p-5 w-full max-w-md"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-medium text-slate-500">
                  {memberModal.mode === 'add' ? 'Add member' : 'Edit member'}
                </div>
                <div className="text-sm font-semibold text-slate-900">Organizational Chart</div>
              </div>
              <button
                type="button"
                className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
                onClick={() => setMemberModal(null)}
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <div className="text-[11px] text-slate-500 mb-1">Department / Section</div>
                <select
                  value={formDepartment}
                  onChange={(event) => {
                    const nextDept = event.target.value
                    setFormDepartment(nextDept)

                    if (nextDept === DEPARTMENTS.gradeAdvisers) {
                      const currentGrade = parseGradeFromPosition(formPosition) || 1
                      setFormPosition(`Grade ${currentGrade} Adviser`)
                    }
                  }}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                >
                  <option value={DEPARTMENTS.schoolOrg}>{DEPARTMENTS.schoolOrg}</option>
                  <option value={DEPARTMENTS.gradeAdvisers}>{DEPARTMENTS.gradeAdvisers}</option>
                  <option value={DEPARTMENTS.nonAcademic}>{DEPARTMENTS.nonAcademic}</option>
                  <option value={DEPARTMENTS.boardPh}>{DEPARTMENTS.boardPh}</option>
                  <option value={DEPARTMENTS.boardPapaya}>{DEPARTMENTS.boardPapaya}</option>
                  <option value={DEPARTMENTS.boardNl}>{DEPARTMENTS.boardNl}</option>
                </select>
              </div>

              {formDepartment === DEPARTMENTS.gradeAdvisers ? (
                <div>
                  <div className="text-[11px] text-slate-500 mb-1">Grade</div>
                  <select
                    value={String(parseGradeFromPosition(formPosition) || 1)}
                    onChange={(event) => {
                      const grade = Number(event.target.value)
                      if (!Number.isFinite(grade)) return
                      setFormPosition(`Grade ${grade} Adviser`)
                    }}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                  >
                    <option value="1">Grade 1 Advisers</option>
                    <option value="2">Grade 2 Advisers</option>
                    <option value="3">Grade 3 Advisers</option>
                    <option value="4">Grade 4 Advisers</option>
                    <option value="5">Grade 5 Advisers</option>
                    <option value="6">Grade 6 Advisers</option>
                  </select>
                </div>
              ) : null}

              <div>
                <div className="text-[11px] text-slate-500 mb-1">Name</div>
                <input
                  type="text"
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-1">Position</div>
                <input
                  type="text"
                  value={formPosition}
                  onChange={(event) => setFormPosition(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                />
              </div>

              <div>
                <div className="text-[11px] text-slate-500 mb-1">Reports To</div>
                <input
                  type="text"
                  value={formReportsTo}
                  onChange={(event) => setFormReportsTo(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                />
              </div>

              <div>
                <div className="text-[11px] text-slate-500 mb-1">Order</div>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(event) => setFormOrder(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                />
              </div>

              <div>
                <div className="text-[11px] text-slate-500 mb-1">Image</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                />
                {formImagePreviewUrl ? (
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-2">
                    <img
                      src={formImagePreviewUrl}
                      alt="Member preview"
                      className="w-full max-h-56 object-contain rounded-xl bg-white"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMemberModal(null)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-2xl bg-[#1B3E2A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163021]"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
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

const trafficDataByYear = {
  '2025': [
    { month: 'Jan', visitors: 5400, uniqueVisitors: 3600 },
    { month: 'Feb', visitors: 6200, uniqueVisitors: 4200 },
    { month: 'Mar', visitors: 5800, uniqueVisitors: 3900 },
    { month: 'Apr', visitors: 6400, uniqueVisitors: 4300 },
    { month: 'May', visitors: 7000, uniqueVisitors: 4700 },
    { month: 'Jun', visitors: 6800, uniqueVisitors: 4600 },
    { month: 'Jul', visitors: 7200, uniqueVisitors: 4900 },
  ],
  '2024': [
    { month: 'Jan', visitors: 4200, uniqueVisitors: 2800 },
    { month: 'Feb', visitors: 4600, uniqueVisitors: 3100 },
    { month: 'Mar', visitors: 4800, uniqueVisitors: 3200 },
    { month: 'Apr', visitors: 5000, uniqueVisitors: 3300 },
    { month: 'May', visitors: 5200, uniqueVisitors: 3500 },
    { month: 'Jun', visitors: 5400, uniqueVisitors: 3600 },
    { month: 'Jul', visitors: 5600, uniqueVisitors: 3800 },
  ],
}

function buildTrafficData(year) {
  const data = trafficDataByYear[String(year)] || []
  const base = MONTH_LABELS.map((label) => ({ month: label, visitors: 0, uniqueVisitors: 0 }))
  data.forEach((entry) => {
    const bucket = base.find((b) => b.month === entry.month)
    if (bucket) {
      bucket.visitors = typeof entry.visitors === 'number' ? entry.visitors : 0
      bucket.uniqueVisitors = typeof entry.uniqueVisitors === 'number' ? entry.uniqueVisitors : 0
    }
  })
  return base
}

function buildInquiriesChartData(messages, year) {
  const base = MONTH_LABELS.map((label) => ({ month: label, inquiries: 0 }))
  messages.forEach((m) => {
    const date = parseDateOrNull(m.receivedAt)
    if (!date || String(date.getFullYear()) !== String(year)) return
    const monthLabel = MONTH_LABELS[date.getMonth()]
    const bucket = base.find((b) => b.month === monthLabel)
    if (bucket) bucket.inquiries += 1
  })
  return base
}

function buildEngagementChartData(donations, year) {
  const base = MONTH_LABELS.map((label) => ({ month: label, engagement: 0 }))
  donations.forEach((d) => {
    const date = parseDateOrNull(d.date)
    if (!date || String(date.getFullYear()) !== String(year)) return
    const monthLabel = MONTH_LABELS[date.getMonth()]
    const bucket = base.find((b) => b.month === monthLabel)
    if (bucket) bucket.engagement += 1
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
