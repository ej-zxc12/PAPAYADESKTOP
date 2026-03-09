import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  FiImage,
  FiCalendar,
  FiEdit2,
  FiGift,
  FiBriefcase,
  FiUser,
  FiUsers,
  FiMail,
  FiLogOut,
  FiBell,
  FiFileText,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiActivity,
  FiGlobe,
  FiShield,
  FiClock,
  FiSearch,
  FiEye,
  FiX,
  FiXCircle,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi'
import AutoExpandingSidebar from './components/AutoExpandingSidebar'
import TopBar from './components/TopBar'
import BottomBar from './components/BottomBar'
import papayaLogo from './shared/assets/logo.jpg?url'
import siteContent from './core/config/siteContent.json'
import NewsManager from './features/news/pages/NewsManager.jsx'
import CalendarSection from './features/calendar/pages/CalendarSection.jsx'
import { missionVisionService } from './core/services/missionVisionService'
import { calendarEventService } from './core/services/calendarEventService'
import { uiText } from './core/constants/uiText'
import { sf10StudentsMock, sf10RecordsMock } from './features/sf10/models/sf10Content'
import { alumniMock } from './features/alumni/models/alumniContent'
import SF10Section, { SF10View } from './features/sf10/pages/SF10Section.jsx'
import AlumniSection from './features/alumni/pages/AlumniSection.jsx'
import AppleScholarshipManager from './features/programs/pages/AppleScholarshipManager.jsx'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { getFirebaseAuth } from './core/services/firebase'
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { getFirebaseStorage } from './core/services/firebase'
import { orgChartService } from './core/services/orgChartService'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    try {
      console.error(error)
    } catch {
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-900 p-6">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 space-y-3">
            <div className="text-lg font-semibold">Something crashed after login</div>
            <div className="text-sm text-slate-700">Copy this error and send it here:</div>
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-2xl p-3 overflow-auto max-h-[50vh]">{String(this.state.error?.stack || this.state.error?.message || this.state.error)}</pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

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

function toSafeDate(value) {
  if (!value) return null
  try {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value
    }
    if (typeof value === 'object' && typeof value.toDate === 'function') {
      const d = value.toDate()
      return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null
    }
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

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
  const [openGroups, setOpenGroups] = useState({ website: false, about: false, programs: false, donations: false })

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

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

  const toggleProgramsGroup = () => {
    setOpenGroups((p) => ({ ...p, programs: !p.programs }))
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
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)

  // Fetch events from Firebase
  useEffect(() => {
    // Only fetch events when logged in
    if (!isLoggedIn) {
      setEvents([])
      return
    }
    
    let unsubscribe
    
    const fetchEvents = async () => {
      try {
        // Try to subscribe to real-time events
        unsubscribe = calendarEventService.subscribeUpcoming({
          onData: (rows) => {
            // Sort events: upcoming first (sorted by date), then past events at bottom
            const now = new Date()
            const sorted = (rows || []).sort((a, b) => {
              const aDate = a.nextRunAt ? new Date(a.nextRunAt) : new Date(0)
              const bDate = b.nextRunAt ? new Date(b.nextRunAt) : new Date(0)
              const aIsPast = aDate < now
              const bIsPast = bDate < now
              
              // If both are upcoming or both are past, sort by date
              if (aIsPast === bIsPast) {
                return aDate - bDate
              }
              // Upcoming events come first
              return aIsPast ? 1 : -1
            })
            setEvents(sorted)
          },
          onError: (err) => {
            console.error('Failed to load events:', err)
            setEvents([])
          },
          max: 50,
        })
      } catch (e) {
        console.error('Error subscribing to events:', e)
        setEvents([])
      }
    }
    
    fetchEvents()
    
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [isLoggedIn])

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
      unsubscribe = onAuthStateChanged(auth, (user) => {
        ;(async () => {
          try {
            if (!user) {
              setIsLoggedIn(false)
              setError('')
              return
            }

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
        })()
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
    programs_apple_scholarship: 'Programs — Apple Scholarship',
    programs_pineapple_project: 'Programs — Pineapple Project',
    donors: 'Donors',
    reports: 'Donation Reports',
    partners: 'About Us — Partners & Sponsors',
    news: 'News & Updates',
    messages: 'Messages / Website Inquiries',
    orgchart: 'About Us — Organizational Chart',
    sf10: uiText.sf10.title,
    alumni: uiText.alumni.title,
    calendar: 'Calendar',
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
    programs_apple_scholarship: 'View Apple Scholarship details and updates',
    programs_pineapple_project: 'View Pineapple Project details and updates',
    donors: 'Manage registered donors and giving history',
    reports: 'View summaries and export donation reports',
    partners: 'Manage partner organizations displayed on the website',
    news: 'Create and manage website news articles',
    messages: 'Display messages submitted via website contact forms',
    orgchart: 'Organization structure (real-time sync if configured)',
    sf10: uiText.sf10.subtitle,
    alumni: uiText.alumni.subtitle,
    calendar: 'Create events using quick-add and auto-post when due',
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
              alt="Papaya Academy logo"
              className="h-[120px] w-[120px] rounded-full object-cover bg-white p-1 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
            />
            <div className="text-center">
              <div className="text-xl font-semibold tracking-tight text-slate-900">Papaya Academy</div>
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
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden bg-[#F5F6F5] text-[#1A1F1B]">
        {/* New Auto-Expanding Sidebar */}
        <AutoExpandingSidebar
          activePage={activePage}
          setActivePage={setActivePage}
          openGroups={openGroups}
          setOpenGroups={setOpenGroups}
          onLogout={confirmAndLogout}
          onExpandedChange={setIsSidebarExpanded}
        />

        <TopBar 
          title={headerTitle}
          subtitle={headerSubtitle}
          isSidebarExpanded={isSidebarExpanded}
          onNotificationClick={() => setIsNotificationsOpen(true)}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 flex flex-col overflow-y-auto min-h-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] mt-[70px] mb-[40px] ${
            isSidebarExpanded ? 'ml-[280px]' : 'ml-[70px]'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', transitionDuration: '0.3s' }}
        >
          <div className="flex-1 flex flex-col w-full mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex-1 flex gap-6 min-h-0">
              <section className="flex-1 flex flex-col gap-6 min-h-0">
                {activePage === 'dashboard' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <SummaryCard
                        title="Website Visitors (Monthly)"
                        value={String(
                          (trafficChartData.find((e) => e.month === currentMonthName)?.visitors || 0).toLocaleString('en-PH')
                        )}
                        subtitle={`This month (${selectedYear})`}
                        tone="yellow"
                      />
                      <SummaryCard
                        title="Active Published Programs"
                        value="2"
                        subtitle="Live on website"
                        tone="sage"
                      />
                      <SummaryCard
                        title="Pending Website Inquiries"
                        value="2"
                        subtitle="Unread messages"
                        tone="yellow"
                      />
                      <SummaryCard
                        title="Draft Website Content"
                        value="0"
                        subtitle="Unpublished items"
                        tone="default"
                      />
                    </div>

                    <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm p-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div>
                          <h2 className="text-lg font-bold text-[#1A1F1B]">Statistics</h2>
                          <p className="text-sm text-[#5C6560]">Monthly donations vs disbursements</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[#5C6560]">
                          {selectedStatTab === 'donations' && (
                            <>
                              <LegendDot color="bg-[#F0C000]" label="Donations Received" />
                              <LegendDot color="bg-[#7EB88A]" label="Disbursements / Expenses" />
                            </>
                          )}
                          {selectedStatTab === 'traffic' && <LegendDot color="bg-[#F0C000]" label="Visitors" />}
                          {selectedStatTab === 'inquiries' && <LegendDot color="bg-[#F0C000]" label="Inquiries" />}
                          {selectedStatTab === 'engagement' && <LegendDot color="bg-[#F0C000]" label="Engagement" />}
                          <div className="ml-2 inline-flex items-center rounded-full bg-[#FAFAFA] border border-[#E8EAE8] p-0.5">
                            <button
                              className={`px-2 py-1 rounded-full ${selectedStatTab === 'donations' ? 'bg-white text-[#1A1F1B] border border-[#E8EAE8]' : 'text-[#5C6560]'}`}
                              onClick={() => setSelectedStatTab('donations')}
                            >
                              Donations
                            </button>
                            <button
                              className={`px-2 py-1 rounded-full ${selectedStatTab === 'traffic' ? 'bg-white text-[#1A1F1B] border border-[#E8EAE8]' : 'text-[#5C6560]'}`}
                              onClick={() => setSelectedStatTab('traffic')}
                            >
                              Website Traffic
                            </button>
                            <button
                              className={`px-2 py-1 rounded-full ${selectedStatTab === 'inquiries' ? 'bg-white text-[#1A1F1B] border border-[#E8EAE8]' : 'text-[#5C6560]'}`}
                              onClick={() => setSelectedStatTab('inquiries')}
                            >
                              Inquiries
                            </button>
                            <button
                              className={`px-2 py-1 rounded-full ${selectedStatTab === 'engagement' ? 'bg-white text-[#1A1F1B] border border-[#E8EAE8]' : 'text-[#5C6560]'}`}
                              onClick={() => setSelectedStatTab('engagement')}
                            >
                              Engagement
                            </button>
                          </div>
                          <select
                            className="ml-2 rounded-full border border-[#E8EAE8] bg-white px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#F0C000]"
                            value={selectedYear}
                            onChange={(event) => setSelectedYear(event.target.value)}
                          >
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                          </select>
                        </div>
                      </div>

                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="donations" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F0C000" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#F0C000" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="disbursements" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7EB88A" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#7EB88A" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="visitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F0C000" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#F0C000" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="uniqueVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#A8CDB0" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#A8CDB0" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="inquiries" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F0C000" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#F0C000" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="engagement" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F0C000" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#F0C000" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8EAE8" vertical={false} />
                            <XAxis
                              dataKey="month"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: '#9CA89F', fontSize: 12 }}
                            />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9CA89F', fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                borderRadius: '0.75rem',
                                border: '1px solid #E8EAE8',
                                boxShadow: '0 10px 40px rgba(26, 31, 27, 0.1)',
                                padding: '0.5rem 0.75rem',
                              }}
                              labelStyle={{ fontSize: 12, color: '#5C6560' }}
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
                                <Area type="monotone" dataKey="donations" stroke="#F0C000" strokeWidth={2.5} fillOpacity={1} fill="url(#donations)" />
                                <Area type="monotone" dataKey="disbursements" stroke="#7EB88A" strokeWidth={2.5} fillOpacity={1} fill="url(#disbursements)" />
                              </>
                            )}
                            {selectedStatTab === 'traffic' && (
                              <>
                                <Area type="monotone" dataKey="visitors" stroke="#F0C000" strokeWidth={2.5} fillOpacity={1} fill="url(#visitors)" />
                                <Area type="monotone" dataKey="uniqueVisitors" stroke="#A8CDB0" strokeWidth={2.5} fillOpacity={1} fill="url(#uniqueVisitors)" />
                              </>
                            )}
                            {selectedStatTab === 'inquiries' && (
                              <Area type="monotone" dataKey="inquiries" stroke="#F0C000" strokeWidth={2.5} fillOpacity={1} fill="url(#inquiries)" />
                            )}
                            {selectedStatTab === 'engagement' && (
                              <Area type="monotone" dataKey="engagement" stroke="#F0C000" strokeWidth={2.5} fillOpacity={1} fill="url(#engagement)" />
                            )}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-[#1A1F1B]">Top Partners & Sponsors</h2>
                      </div>
                      <div className="overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="bg-[#FAFAFA] text-left text-[#5C6560] border-b border-[#E8EAE8]">
                                <th className="py-4 px-6 font-semibold whitespace-nowrap">Organization</th>
                                <th className="py-4 px-6 font-semibold whitespace-nowrap">Contribution Type</th>
                                <th className="py-4 px-6 font-semibold whitespace-nowrap">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8EAE8]">
                              {partners.slice(0, 6).map((partner) => (
                                <tr key={partner.id || partner.name} className="hover:bg-[#FAFAFA] transition-colors">
                                  <td className="py-4 px-6 whitespace-nowrap text-[#1A1F1B] font-medium">{partner.name}</td>
                                  <td className="py-4 px-6 whitespace-nowrap text-[#5C6560]">{partner.type || partner.label}</td>
                                  <td className="py-4 px-6 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                        partner.status === 'Active'
                                          ? 'bg-[#F0F8F1] text-[#4A8058] border border-[#7EB88A]/20'
                                          : 'bg-[#FAFAFA] text-[#9CA89F] border border-[#E8EAE8]'
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
                {activePage === 'calendar' && <CalendarSection />}
                {activePage === 'website_about_story' && <StaticContentSection title="Our Story" />}
                {activePage === 'website_about_mission' && <MissionVisionValuesSection />}
                {activePage === 'media' && <MediaLibrarySection />}
                {activePage === 'programs_apple_scholarship' && <AppleScholarshipManager />}
                {activePage === 'programs_pineapple_project' && <ProgramOverviewSection title="Pineapple Project" />}
              </section>

              {activePage === 'dashboard' && (
                <aside className="w-80 flex flex-col gap-6">
                  <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm p-6 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-[#1A1F1B]">Upcoming Events</h2>
                      <span className="text-xs font-medium text-[#9CA89F]">Today</span>
                    </div>
                    <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[400px]">
                      {events.length === 0 && (
                        <div className="text-center py-8 text-[#9CA89F]">
                          <FiCalendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No events found</p>
                        </div>
                      )}
                      {events.map((event) => {
                        const eventDate = toSafeDate(event?.nextRunAt)
                        const isPast = eventDate && eventDate < new Date()
                        const timeText = eventDate
                          ? eventDate.toLocaleString('en-PH', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })
                          : 'No date'
                        
                        return (
                          <div
                            key={event.id}
                            onClick={() => {
                              setSelectedEvent(event)
                              setShowEventModal(true)
                            }}
                            className={`flex items-start gap-3 rounded-2xl px-3 py-3 hover:bg-[#FAFAFA] transition-colors cursor-pointer group ${
                              isPast ? 'opacity-60' : ''
                            }`}
                          >
                            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 ${
                              isPast ? 'bg-[#E8EAE8] text-[#9CA89F]' : 'bg-[#F0F8F1] text-[#7EB88A]'
                            }`}>
                              <FiCalendar className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <div className="text-sm font-bold text-[#1A1F1B] truncate">{event.title}</div>
                                <div className={`text-[10px] font-medium whitespace-nowrap ml-2 ${
                                  isPast ? 'text-[#D97070]' : 'text-[#9CA89F]'
                                }`}>
                                  {isPast ? 'Done' : timeText}
                                </div>
                              </div>
                              <div className="text-xs text-[#5C6560] truncate">
                                {event.description || 'No description'}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </main>

        <BottomBar isSidebarExpanded={isSidebarExpanded} />

        <div
          className={`fixed inset-0 z-[60] ${isNotificationsOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          aria-hidden={!isNotificationsOpen}
        >
          <div
            className={`absolute inset-0 bg-[#1A1F1B]/40 transition-opacity duration-200 ${
              isNotificationsOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeNotifications}
          />

          <aside
            className={`absolute right-0 top-0 h-full w-[420px] max-w-[92vw] bg-white shadow-[0_30px_90px_rgba(26, 31, 27, 0.1)] transition-transform duration-200 ease-out flex flex-col ${
              isNotificationsOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Notifications panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[#E8EAE8] flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold text-[#1A1F1B]">Notifications</div>
                <div className="text-xs text-[#5C6560]">{messages.filter((m) => !m.read).length} unread</div>
              </div>
              <button
                type="button"
                className="h-9 w-9 rounded-full border border-[#E8EAE8] text-[#5C6560] hover:bg-[#FAFAFA]"
                onClick={closeNotifications}
                aria-label="Close notifications"
                title="Close"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-[#5C6560]">No notifications yet.</div>
              )}

              <div className="divide-y divide-[#E8EAE8]">
                {messages.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="w-full text-left px-5 py-4 hover:bg-[#FFFAE8] transition flex items-start gap-3"
                    onClick={() => {
                      setMessages((prev) =>
                        prev.map((msg) =>
                          String(msg.id) === String(m.id)
                            ? {
                                ...msg,
                                read: true,
                              }
                            : msg,
                        ),
                      )
                    }}
                  >
                    <div className="pt-1">
                      <div className={`h-2.5 w-2.5 rounded-full ${m.read ? 'bg-[#E8EAE8]' : 'bg-[#7EB88A]'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1A1F1B] truncate">{m.name || 'Inquiry'}</div>
                      <div className="text-xs text-[#5C6560] mt-0.5">
                        {m.message || m.subject || 'New message received.'}
                      </div>
                      {m.time && <div className="text-[11px] text-[#9CA89F] mt-1">{m.time}</div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-[#E8EAE8] bg-white">
              <button
                type="button"
                className="w-full rounded-2xl border border-[#E8EAE8] px-4 py-2.5 text-sm font-medium text-[#5C6560] hover:bg-[#FAFAFA]"
                onClick={() => setMessages((prev) => prev.map((m) => ({ ...m, read: true })))}
              >
                Mark all as read
              </button>
            </div>
          </aside>
        </div>

        {/* Event Detail Modal - At root level for proper overlay */}
        {showEventModal && selectedEvent && (
          (typeof document !== 'undefined' && document.body
            ? createPortal(
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
                  onClick={() => setShowEventModal(false)}
                >
                  <div
                    className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-[#1A1F1B]">Event Details</h3>
                      <button
                        onClick={() => setShowEventModal(false)}
                        className="p-2 hover:bg-[#FAFAFA] rounded-xl transition-colors"
                      >
                        <FiX className="h-5 w-5 text-[#5C6560]" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <p className="text-lg font-bold">{selectedEvent?.title || 'Untitled event'}</p>
                      <p className="text-sm text-gray-600">{selectedEvent?.description || 'No description'}</p>
                      <p className="text-sm text-gray-600">
                        {(() => {
                          const d = toSafeDate(selectedEvent?.nextRunAt)
                          if (!d) return 'No date set'
                          return d.toLocaleString('en-PH', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        })()}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowEventModal(false)}
                      className="w-full mt-6 rounded-xl bg-[#F0C000] px-6 py-3 text-sm font-bold text-white hover:bg-[#B8920A] transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>,
                document.body,
              )
            : null)
        )}
      </div>
    </ErrorBoundary>
  )
}

function StaticContentSection({ title }) {
  return (
    <div className="bg-white p-5 flex flex-col gap-4 flex-1 text-xs">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">Edit content for the About Us section</p>
      </div>
      <div className="text-xs text-slate-500">This is a placeholder for rich text editing and publishing.</div>
    </div>
  )
}

function ProgramOverviewSection({ title }) {
  return (
    <div className="bg-white p-5 flex flex-col gap-4 flex-1 text-xs">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">Program details and updates</p>
      </div>
      <div className="text-xs text-slate-500">This is a placeholder for program-specific content.</div>
    </div>
  )
}

function MissionVisionValuesSection() {
  const [content, setContent] = useState({
    mission: { title: 'Our Mission', content: '', image: '' },
    vision: { title: 'Our Vision', content: '', image: '' },
    values: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load content from Firebase
  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await missionVisionService.getContent()
        setContent(data)
      } catch (error) {
        console.error('Failed to load mission & vision:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadContent()
  }, [])

  const handleSaveMission = async (field, value) => {
    try {
      setIsSaving(true)
      const updated = {
        ...content,
        mission: { ...content.mission, [field]: value }
      }
      await missionVisionService.saveContent(updated)
      setContent(updated)
    } catch (error) {
      console.error('Failed to save mission:', error)
      alert('Failed to save mission content')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveVision = async (field, value) => {
    try {
      setIsSaving(true)
      const updated = {
        ...content,
        vision: { ...content.vision, [field]: value }
      }
      await missionVisionService.saveContent(updated)
      setContent(updated)
    } catch (error) {
      console.error('Failed to save vision:', error)
      alert('Failed to save vision content')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddValue = async () => {
    const newValue = {
      id: Date.now().toString(),
      title: '',
      description: '',
      icon: 'star'
    }
    try {
      setIsSaving(true)
      const updated = {
        ...content,
        values: [...content.values, newValue]
      }
      await missionVisionService.saveContent(updated)
      setContent(updated)
    } catch (error) {
      console.error('Failed to add value:', error)
      alert('Failed to add value')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateValue = async (index, field, value) => {
    try {
      setIsSaving(true)
      const updatedValues = [...content.values]
      updatedValues[index] = { ...updatedValues[index], [field]: value }
      const updated = { ...content, values: updatedValues }
      await missionVisionService.saveContent(updated)
      setContent(updated)
    } catch (error) {
      console.error('Failed to update value:', error)
      alert('Failed to update value')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveValue = async (index) => {
    if (!confirm('Remove this value?')) return
    try {
      setIsSaving(true)
      const updatedValues = content.values.filter((_, i) => i !== index)
      const updated = { ...content, values: updatedValues }
      await missionVisionService.saveContent(updated)
      setContent(updated)
    } catch (error) {
      console.error('Failed to remove value:', error)
      alert('Failed to remove value')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F0C000]"></div>
        <p className="mt-4 text-sm text-[#5C6560]">Loading mission & vision content...</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1F1B]">Mission, Vision & Core Values</h2>
          <p className="text-sm text-[#5C6560]">Shape the identity and guiding principles of Papaya Academy</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
          isSaving ? 'bg-[#FFFAE8] text-[#B8920A]' : 'bg-[#F0F8F1] text-[#4A8058]'
        }`}>
          {isSaving ? 'Saving changes...' : 'All changes saved'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission Card */}
        <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm overflow-hidden group hover:shadow-md transition-all">
          <div className="bg-[#FAFAFA] px-6 py-4 border-b border-[#E8EAE8] flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFFAE8] flex items-center justify-center text-[#F0C000]">
              <FiShield className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-[#1A1F1B]">Our Mission</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Mission Title</label>
              <input
                type="text"
                placeholder="Enter mission title..."
                className="w-full rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-4 py-2.5 text-sm font-semibold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all"
                value={content.mission.title}
                onChange={(e) => setContent(prev => ({ ...prev, mission: { ...prev.mission, title: e.target.value } }))} 
                onBlur={() => handleSaveMission('title', content.mission.title)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Mission Statement</label>
              <textarea
                placeholder="What is our primary purpose?"
                className="w-full rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-4 py-3 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all resize-none min-h-[120px]"
                value={content.mission.content}
                onChange={(e) => setContent(prev => ({ ...prev, mission: { ...prev.mission, content: e.target.value } }))} 
                onBlur={() => handleSaveMission('content', content.mission.content)}
              />
            </div>
          </div>
        </div>

        {/* Vision Card */}
        <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm overflow-hidden group hover:shadow-md transition-all">
          <div className="bg-[#FAFAFA] px-6 py-4 border-b border-[#E8EAE8] flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0F8F1] flex items-center justify-center text-[#7EB88A]">
              <FiGlobe className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-[#1A1F1B]">Our Vision</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Vision Title</label>
              <input
                type="text"
                placeholder="Enter vision title..."
                className="w-full rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-4 py-2.5 text-sm font-semibold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all"
                value={content.vision.title}
                onChange={(e) => setContent(prev => ({ ...prev, vision: { ...prev.vision, title: e.target.value } }))} 
                onBlur={() => handleSaveVision('title', content.vision.title)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Vision Statement</label>
              <textarea
                placeholder="Where do we see ourselves in the future?"
                className="w-full rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-4 py-3 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all resize-none min-h-[120px]"
                value={content.vision.content}
                onChange={(e) => setContent(prev => ({ ...prev, vision: { ...prev.vision, content: e.target.value } }))} 
                onBlur={() => handleSaveVision('content', content.vision.content)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm overflow-hidden">
        <div className="bg-[#FAFAFA] px-8 py-6 border-b border-[#E8EAE8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F6F5] flex items-center justify-center text-[#1A1F1B]">
              <FiActivity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#1A1F1B]">Core Values</h3>
              <p className="text-xs text-[#5C6560]">The fundamental beliefs that guide our actions</p>
            </div>
          </div>
          <button
            onClick={handleAddValue}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F0C000] text-white text-sm font-bold px-6 py-2.5 hover:bg-[#B8920A] shadow-md shadow-[#F0C000]/10 transition-all active:scale-95"
          >
            <FiPlus className="h-4 w-4" />
            <span>Add New Value</span>
          </button>
        </div>
        
        <div className="p-8">
          {content.values.length === 0 ? (
            <div className="text-center py-12 bg-[#FAFAFA] rounded-2xl border-2 border-dashed border-[#E8EAE8]">
              <FiActivity className="h-12 w-12 text-[#9CA89F] mx-auto mb-4 opacity-50" />
              <p className="text-sm text-[#5C6560] font-medium">No core values added yet.</p>
              <button 
                onClick={handleAddValue}
                className="mt-4 text-[#F0C000] text-sm font-bold hover:underline"
              >
                Add your first value
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.values.map((value, index) => (
                <div key={value.id || index} className="group rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] p-5 space-y-4 hover:bg-white hover:border-[#F0C000]/30 hover:shadow-md transition-all relative">
                  <button
                    onClick={() => handleRemoveValue(index)}
                    className="absolute top-4 right-4 p-2 text-[#9CA89F] hover:text-[#D97070] hover:bg-[#D97070]/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Remove Value"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Value Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Integrity, Compassion..."
                      className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-2 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] transition-all"
                      value={value.title}
                      onChange={(e) => {
                        const updated = [...content.values]
                        updated[index] = { ...updated[index], title: e.target.value }
                        setContent(prev => ({ ...prev, values: updated }))
                      }}
                      onBlur={() => handleUpdateValue(index, 'title', value.title)}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Description</label>
                    <textarea
                      placeholder="Describe what this value means to the academy..."
                      className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-3 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] transition-all resize-none"
                      rows={3}
                      value={value.description}
                      onChange={(e) => {
                        const updated = [...content.values]
                        updated[index] = { ...updated[index], description: e.target.value }
                        setContent(prev => ({ ...prev, values: updated }))
                      }}
                      onBlur={() => handleUpdateValue(index, 'description', value.description)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MediaLibrarySection() {
  return (
    <div className="bg-white p-5 flex flex-col gap-4 flex-1 text-xs">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Media Library</h2>
        <p className="text-xs text-slate-500">Manage images and files for the website</p>
      </div>
      <div className="text-xs text-slate-500">This is a placeholder for uploading and organizing media.</div>
    </div>
  )
}

function SummaryCard({ title, value, subtitle, tone = 'default' }) {
  const tones = {
    yellow: {
      bg: 'bg-white',
      border: 'border-[#E8EAE8]',
      text: 'text-[#1A1F1B]',
      iconBg: 'bg-[#FFFAE8]',
      iconText: 'text-[#F0C000]',
      shadow: 'shadow-sm hover:shadow-md',
    },
    sage: {
      bg: 'bg-white',
      border: 'border-[#E8EAE8]',
      text: 'text-[#1A1F1B]',
      iconBg: 'bg-[#F0F8F1]',
      iconText: 'text-[#7EB88A]',
      shadow: 'shadow-sm hover:shadow-md',
    },
    default: {
      bg: 'bg-white',
      border: 'border-[#E8EAE8]',
      text: 'text-[#1A1F1B]',
      iconBg: 'bg-[#FAFAFA]',
      iconText: 'text-[#5C6560]',
      shadow: 'shadow-sm hover:shadow-md',
    },
  }

  const t = tones[tone] || tones.default
  const firstLetter = (title || '?').charAt(0).toUpperCase()

  return (
    <div
      className={`group flex flex-col p-5 rounded-3xl border ${t.border} ${t.bg} ${t.shadow} transition-all duration-300 hover:-translate-y-1`}
    >
      <div className="flex items-center gap-4 mb-3">
        <div
          className={`h-10 w-10 rounded-2xl ${t.iconBg} ${t.iconText} flex items-center justify-center font-bold text-lg shadow-inner`}
        >
          {firstLetter}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-[#9CA89F] uppercase tracking-wider truncate">
            {title}
          </p>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className={`text-2xl font-bold ${t.text}`}>{value}</h3>
      </div>
      <p className="text-xs text-[#5C6560] mt-1">{subtitle}</p>
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
      className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
        highlight
          ? 'text-[#D97070] hover:bg-[#D97070]/5'
          : 'text-[#5C6560] hover:bg-[#FAFAFA] hover:text-[#1A1F1B]'
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
    <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm p-6 flex flex-col gap-6 flex-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FAFAFA] rounded-lg flex items-center justify-center text-[#F0C000]">
            <FiFileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1F1B]">Donations</h2>
            <p className="text-xs text-[#5C6560]">Recent donations and payment status</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-3 py-2 text-xs font-semibold text-[#5C6560] outline-none focus:ring-2 focus:ring-[#F0C000] transition-all"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <select
            className="rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-3 py-2 text-xs font-semibold text-[#5C6560] outline-none focus:ring-2 focus:ring-[#F0C000] transition-all"
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

      <div className="bg-white rounded-2xl border border-[#E8EAE8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#FAFAFA] text-[#5C6560] font-semibold border-b border-[#E8EAE8]">
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Donation ID</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Donor Name</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Program</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Amount</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Payment Method</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Status</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Date</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAE8]">
            {filteredDonations.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#9CA89F] italic">
                  No donations found.
                </td>
              </tr>
            )}
            {filteredDonations.map((donation) => (
              <tr
                key={donation.id}
                className={`hover:bg-[#FAFAFA]/50 transition-colors group ${selectedDonationId === donation.id ? 'bg-[#FAFAFA]' : 'bg-white'}`}
              >
                <td className="py-4 px-6 text-[#5C6560] font-medium">{donation.id}</td>
                <td className="py-4 px-6 font-bold text-[#1A1F1B]">{donation.donorName}</td>
                <td className="py-4 px-6 text-[#5C6560]">{donation.campaignName}</td>
                <td className="py-4 px-6 font-bold text-[#1A1F1B]">
                  {formatCurrency(donation.amount, donation.currency || baseCurrency || 'PHP')}
                </td>
                <td className="py-4 px-6 text-[#5C6560]">{donation.method}</td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                      donation.status === 'Completed'
                        ? 'bg-[#F0F8F1] text-[#4A8058] border-[#D6EDD9]'
                        : donation.status === 'Pending'
                        ? 'bg-[#FFFAE8] text-[#B8920A] border-[#FEF3C0]'
                        : 'bg-[#D97070]/5 text-[#D97070] border-[#D97070]/20'
                    }`}
                  >
                    {donation.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-[#5C6560]">{donation.date}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end">
                    <button
                      className="p-2 text-[#9CA89F] hover:text-[#1A1F1B] hover:bg-[#FAFAFA] rounded-lg transition-all active:scale-95"
                      onClick={() => onSelectDonation(donation.id)}
                      title="View Details"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDonation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1F1B]/60 backdrop-blur-sm"
          onClick={() => onSelectDonation(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E8EAE8] animate-in fade-in zoom-in-95 duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E8EAE8] flex items-center justify-between bg-[#FAFAFA]">
              <div>
                <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Donation details</p>
                <h3 className="text-lg font-bold text-[#1A1F1B]">{selectedDonation.id}</h3>
              </div>
              <button
                type="button"
                className="p-2 text-[#9CA89F] hover:text-[#1A1F1B] rounded-full hover:bg-[#FAFAFA] transition-all"
                onClick={() => onSelectDonation(null)}
              >
                <FiXCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Donor</p>
                  <p className="text-sm font-bold text-[#1A1F1B]">{selectedDonation.donorName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Program</p>
                  <p className="text-sm font-bold text-[#1A1F1B]">{selectedDonation.campaignName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Amount</p>
                  <p className="text-sm font-bold text-[#F0C000]">
                    {formatCurrency(selectedDonation.amount, selectedDonation.currency || baseCurrency || 'PHP')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Payment method</p>
                  <p className="text-sm text-[#5C6560] font-medium">{selectedDonation.method}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Gateway</p>
                  <p className="text-sm text-[#5C6560] font-medium">{selectedDonation.gateway}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Status</p>
                  <p className="text-sm text-[#5C6560] font-medium">{selectedDonation.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Transaction ref.</p>
                  <p className="text-sm text-[#5C6560] font-medium truncate">{selectedDonation.reference}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Timestamp</p>
                  <p className="text-sm text-[#5C6560] font-medium">{selectedDonation.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Origin</p>
                  <p className="text-sm text-[#5C6560] font-medium">
                    {selectedDonationRegion}{' '}
                    {selectedDonation.country ? `· ${selectedDonation.country}` : ''}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectDonation(null)}
                  className="w-full px-6 py-2.5 rounded-xl border border-[#E8EAE8] text-sm font-bold text-[#5C6560] hover:bg-[#FAFAFA] transition-all"
                >
                  Close
                </button>
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
    <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm p-6 flex flex-col gap-6 flex-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FAFAFA] rounded-lg flex items-center justify-center text-[#F0C000]">
            <FiPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1F1B]">Programs</h2>
            <p className="text-xs text-[#5C6560]">Manage active and archived programs</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EAE8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#FAFAFA] text-[#5C6560] font-semibold border-b border-[#E8EAE8]">
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Program</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Target Amount</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Total Collected</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Progress</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Status</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAE8]">
            {campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className={`hover:bg-[#FAFAFA]/50 transition-colors group ${selectedCampaignId === campaign.id ? 'bg-[#FAFAFA]' : 'bg-white'}`}
              >
                <td
                  className="py-4 px-6 font-bold text-[#1A1F1B] cursor-pointer"
                  onClick={() => onSelectCampaign(campaign.id)}
                >
                  {campaign.name}
                </td>
                <td className="py-4 px-6 text-[#5C6560]">
                  {formatCurrency(campaign.targetAmount)}
                </td>
                <td className="py-4 px-6 font-bold text-[#1A1F1B]">
                  {formatCurrency(campaign.collected)}
                </td>
                <td className="py-4 px-6 text-[#5C6560]">
                  <div className="flex flex-col gap-1.5">
                    <div className="w-full bg-[#FAFAFA] rounded-full h-1.5 border border-[#E8EAE8]">
                      <div 
                        className="bg-[#F0C000] h-1.5 rounded-full shadow-sm transition-all duration-500" 
                        style={{ width: `${Math.min(100, campaign.progressPercent)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">{campaign.progressPercent}% funded</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                      campaign.status === 'Active'
                        ? 'bg-[#F0F8F1] text-[#4A8058] border-[#D6EDD9]'
                        : campaign.status === 'Completed'
                        ? 'bg-[#FFFAE8] text-[#B8920A] border-[#FEF3C0]'
                        : 'bg-[#FAFAFA] text-[#9CA89F] border-[#E8EAE8]'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 text-[#9CA89F] hover:text-[#1A1F1B] hover:bg-[#FAFAFA] rounded-lg transition-all active:scale-95"
                      onClick={() => {
                        setEditingCampaign(campaign)
                        setEditingTarget(String(campaign.targetAmount || 0))
                      }}
                      title="Edit"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-[#9CA89F] hover:text-[#D97070] hover:bg-[#D97070]/10 rounded-lg transition-all active:scale-95"
                      onClick={() => onArchiveCampaign(campaign.id)}
                      title="Archive"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCampaign && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1F1B]/60 backdrop-blur-sm"
          onClick={() => onSelectCampaign(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E8EAE8] animate-in fade-in zoom-in-95 duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E8EAE8] flex items-center justify-between bg-[#FAFAFA]">
              <div>
                <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Program details</p>
                <h3 className="text-lg font-bold text-[#1A1F1B]">{selectedCampaign.name}</h3>
              </div>
              <button
                type="button"
                className="p-2 text-[#9CA89F] hover:text-[#1A1F1B] rounded-full hover:bg-[#FAFAFA] transition-all"
                onClick={() => onSelectCampaign(null)}
              >
                <FiXCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Target Amount</p>
                  <p className="text-sm font-bold text-[#1A1F1B]">{formatCurrency(selectedCampaign.targetAmount)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Total Collected</p>
                  <p className="text-sm font-bold text-[#F0C000]">{formatCurrency(selectedCampaign.collected)}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-2">Funding Progress</p>
                <div className="space-y-2">
                  <div className="w-full bg-[#FAFAFA] rounded-full h-3 border border-[#E8EAE8]">
                    <div 
                      className="bg-[#F0C000] h-3 rounded-full shadow-sm transition-all duration-500" 
                      style={{ width: `${Math.min(100, selectedCampaign.progressPercent)}%` }}
                    />
                  </div>
                  <p className="text-xs font-bold text-[#5C6560] text-right">{selectedCampaign.progressPercent}% of goal reached</p>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectCampaign(null)}
                  className="w-full px-6 py-2.5 rounded-xl border border-[#E8EAE8] text-sm font-bold text-[#5C6560] hover:bg-[#FAFAFA] transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingCampaign && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#1A1F1B]/60 backdrop-blur-sm"
             onClick={() => setEditingCampaign(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#E8EAE8] animate-in fade-in zoom-in-95 duration-200"
               onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#E8EAE8] bg-[#FAFAFA] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1A1F1B]">Edit Target</h3>
              <button 
                onClick={() => setEditingCampaign(null)}
                className="p-2 text-[#9CA89F] hover:text-[#1A1F1B] rounded-full hover:bg-[#FAFAFA] transition-all"
              >
                <FiXCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Target Amount for {editingCampaign.name}</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-[#E8EAE8] px-4 py-2.5 text-sm font-bold text-[#1A1F1B] focus:ring-2 focus:ring-[#F0C000] focus:border-transparent outline-none transition-all"
                  value={editingTarget}
                  onChange={(e) => setEditingTarget(e.target.value)}
                  placeholder="e.g. 50000"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 px-6 py-2.5 rounded-xl border border-[#E8EAE8] text-sm font-bold text-[#5C6560] hover:bg-[#FAFAFA] transition-all"
                  onClick={() => setEditingCampaign(null)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-6 py-2.5 rounded-xl bg-[#F0C000] text-white text-sm font-bold hover:bg-[#B8920A] transition-all shadow-md shadow-[#F0C000]/10"
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
                  Save
                </button>
              </div>
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
    <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm p-6 flex flex-col gap-6 flex-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FAFAFA] rounded-lg flex items-center justify-center text-[#F0C000]">
            <FiUser className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1F1B]">Donors</h2>
            <p className="text-xs text-[#5C6560]">Managing {donors.length.toLocaleString()} total registered donors</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EAE8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#FAFAFA] text-[#5C6560] font-semibold border-b border-[#E8EAE8]">
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Donor</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Email</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Total Donations</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Last Donation</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAE8]">
            {filteredDonors.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#9CA89F] italic">
                  No donors found.
                </td>
              </tr>
            )}
            {filteredDonors.map((donor) => (
              <tr
                key={donor.id}
                className={`hover:bg-[#FAFAFA]/50 transition-colors group ${selectedDonorId === donor.id ? 'bg-[#FAFAFA]' : 'bg-white'}`}
              >
                <td className="py-4 px-6 font-bold text-[#1A1F1B]">{donor.name}</td>
                <td className="py-4 px-6 text-[#5C6560] font-medium">{donor.email}</td>
                <td className="py-4 px-6 font-bold text-[#1A1F1B]">
                  {formatCurrency(donor.total, donor.currency || 'PHP')}
                </td>
                <td className="py-4 px-6 text-[#5C6560]">{donor.lastDonation}</td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end">
                    <button
                      className="p-2 text-[#9CA89F] hover:text-[#1A1F1B] hover:bg-[#FAFAFA] rounded-lg transition-all active:scale-95"
                      onClick={() => onSelectDonor(donor.id)}
                      title="View History"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDonor && (
        <div className="bg-[#FAFAFA] rounded-2xl border border-[#E8EAE8] p-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#F0F8F1] flex items-center justify-center text-lg font-bold text-[#7EB88A] shadow-sm">
                {selectedDonor.name.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Donor profile</p>
                <h3 className="text-xl font-bold text-[#1A1F1B]">{selectedDonor.name}</h3>
                <p className="text-xs text-[#5C6560]">{selectedDonor.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Total Donated</p>
              <p className="text-lg font-bold text-[#F0C000]">{formatCurrency(selectedDonor.total)}</p>
              <button
                onClick={() => onSelectDonor(null)}
                className="mt-2 p-2 text-[#9CA89F] hover:text-[#1A1F1B] rounded-full hover:bg-white transition-all border border-transparent hover:border-[#E8EAE8]"
              >
                <FiXCircle className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-[#E8EAE8] p-4">
              <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Last Donation</p>
              <p className="text-sm font-semibold text-[#1A1F1B]">{selectedDonor.lastDonation}</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E8EAE8] p-4">
              <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Programs Supported</p>
              <p className="text-sm font-semibold text-[#1A1F1B]">{selectedDonor.campaignsSupported}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8EAE8]">
            <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-3">Donation history</p>
            {selectedDonor.donations.length === 0 ? (
              <div className="text-sm text-[#9CA89F] italic bg-white rounded-xl border border-[#E8EAE8] p-4 text-center">
                No donations recorded for this donor.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#E8EAE8] overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[#FAFAFA] text-[#5C6560] font-semibold border-b border-[#E8EAE8]">
                      <th className="py-3 px-4 uppercase tracking-wider text-[10px]">Donation ID</th>
                      <th className="py-3 px-4 uppercase tracking-wider text-[10px]">Program</th>
                      <th className="py-3 px-4 uppercase tracking-wider text-[10px] text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8EAE8]">
                    {selectedDonor.donations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-[#FAFAFA]/50 transition-colors">
                        <td className="py-3 px-4 text-[#5C6560] font-medium">{donation.id}</td>
                        <td className="py-3 px-4 text-[#1A1F1B] font-bold">{donation.campaignName}</td>
                        <td className="py-3 px-4 text-right text-[#1A1F1B] font-bold">
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
    { id: 'daily', label: 'Daily Summary', amount: dailyTotal, icon: FiActivity, color: '#7EB88A', bgColor: '#F0F8F1' },
    { id: 'monthly', label: 'Monthly Summary', amount: monthlyTotal, icon: FiClock, color: '#F0C000', bgColor: '#FFFAE8' },
    { id: 'yearly', label: 'Yearly Summary', amount: yearlyTotal, icon: FiGlobe, color: '#1A1F1B', bgColor: '#F5F6F5' },
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
    <div className="flex flex-col gap-6 w-full">
      {/* Filters Section */}
      <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm overflow-hidden">
        <div className="bg-[#FAFAFA] px-8 py-6 border-b border-[#E8EAE8] flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F5F6F5] flex items-center justify-center text-[#1A1F1B]">
            <FiSearch className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1F1B]">Filter Reports</h2>
            <p className="text-xs text-[#5C6560]">Customize your donation data view</p>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Date Range */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Date Range</label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    className="w-full rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-4 py-2.5 text-sm font-semibold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all"
                  />
                </div>
                <span className="text-[#9CA89F] font-bold">to</span>
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    className="w-full rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-4 py-2.5 text-sm font-semibold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Program Filter */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Program</label>
              <select
                className="w-full rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-4 py-2.5 text-sm font-semibold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all appearance-none cursor-pointer"
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

            {/* Payment Method Filter */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Payment Method</label>
              <select
                className="w-full rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-4 py-2.5 text-sm font-semibold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all appearance-none cursor-pointer"
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
        </div>
      </div>

      {/* Summaries Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaries.map((summary) => (
          <div key={summary.id} className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm p-8 group hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: summary.bgColor, color: summary.color }}>
                <summary.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">{summary.label}</div>
                <div className="text-2xl font-bold text-[#1A1F1B] mt-1">
                  {formatCurrency(summary.amount)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export Actions Section */}
      <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-2xl text-sm font-bold border transition-all ${
              filteredDonations.length > 0 
                ? 'bg-[#F0F8F1] text-[#4A8058] border-[#D6EDD9]' 
                : 'bg-[#FFFAE8] text-[#B8920A] border-[#F0C000]/20'
            }`}>
              {filteredDonations.length.toLocaleString()} Donations Found
            </div>
            {filteredDonations.length === 0 && (
              <p className="text-xs text-[#9CA89F] font-medium">No donations match the selected filters.</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-[#E8EAE8] bg-white px-6 py-2.5 text-sm font-bold text-[#5C6560] hover:bg-[#FAFAFA] transition-all active:scale-95 disabled:opacity-50"
              onClick={() => exportReport('csv')}
              disabled={filteredDonations.length === 0}
            >
              Export CSV
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-[#E8EAE8] bg-white px-6 py-2.5 text-sm font-bold text-[#5C6560] hover:bg-[#FAFAFA] transition-all active:scale-95 disabled:opacity-50"
              onClick={() => exportReport('excel')}
              disabled={filteredDonations.length === 0}
            >
              Export Excel
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-[#1A1F1B] px-8 py-2.5 text-sm font-bold text-white hover:bg-black shadow-lg shadow-black/10 transition-all active:scale-95 disabled:opacity-50"
              onClick={() => exportReport('pdf')}
              disabled={filteredDonations.length === 0}
            >
              Export PDF
            </button>
          </div>
        </div>
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
    <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm p-6 flex flex-col gap-6 flex-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FAFAFA] rounded-lg flex items-center justify-center text-[#F0C000]">
            <FiSearch className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1F1B]">Messages / Inquiries</h2>
            <p className="text-xs text-[#5C6560]">Managing {messages.length.toLocaleString()} website inquiries</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EAE8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#FAFAFA] text-[#5C6560] font-semibold border-b border-[#E8EAE8]">
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">From</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Subject</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Received</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Status</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAE8]">
            {sortedMessages.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#9CA89F] italic">
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
                  className={`hover:bg-[#FAFAFA]/50 transition-colors group ${selectedMessageId === message.id ? 'bg-[#FAFAFA]' : 'bg-white'}`}
                >
                  <td className="py-4 px-6 font-bold text-[#1A1F1B]">{message.fromName}</td>
                  <td className="py-4 px-6 text-[#5C6560] truncate max-w-[260px]">
                    {message.subject}
                  </td>
                  <td className="py-4 px-6 text-[#5C6560]">{formatted}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                        message.read
                          ? 'bg-[#FAFAFA] text-[#9CA89F] border-[#E8EAE8]'
                          : 'bg-[#F0F8F1] text-[#4A8058] border-[#D6EDD9]'
                      }`}
                    >
                      {message.read ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 text-[#9CA89F] hover:text-[#1A1F1B] hover:bg-[#FAFAFA] rounded-lg transition-all active:scale-95"
                        onClick={() => onSelectMessage(message.id)}
                        title="Open"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-all active:scale-95 border ${
                          message.read
                            ? 'bg-white border-[#E8EAE8] text-[#9CA89F] hover:text-[#1A1F1B] hover:bg-[#FAFAFA]'
                            : 'bg-[#1A1F1B] border-[#1A1F1B] text-white hover:bg-black shadow-sm'
                        }`}
                        onClick={() => onToggleMessageRead(message.id)}
                        title={message.read ? 'Mark unread' : 'Mark read'}
                      >
                        {message.read ? <FiAlertCircle className="h-4 w-4" /> : <FiCheckCircle className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMessage && (
        <div className="bg-[#FAFAFA] rounded-2xl border border-[#E8EAE8] p-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Message from</p>
              <h3 className="text-lg font-bold text-[#1A1F1B]">{selectedMessage.fromName}</h3>
              <p className="text-xs text-[#5C6560]">{selectedMessage.fromEmail}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Subject</p>
              <p className="text-sm font-semibold text-[#1A1F1B]">{selectedMessage.subject}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Received At</p>
              <p className="text-sm font-semibold text-[#1A1F1B]">{selectedMessage.receivedAt}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-[#E8EAE8]">
            <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-2">Message Body</p>
            <div className="text-sm text-[#1A1F1B] whitespace-pre-wrap leading-relaxed bg-white rounded-xl border border-[#E8EAE8] p-4">
              {selectedMessage.body}
            </div>
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
    <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm p-6 flex flex-col gap-6 flex-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FAFAFA] rounded-lg flex items-center justify-center text-[#F0C000]">
            <FiUser className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1F1B]">Partners & Sponsors</h2>
            <p className="text-xs text-[#5C6560]">Managing {partners.length.toLocaleString()} partner organizations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-full bg-[#FAFAFA] border border-[#E8EAE8] p-0.5">
            <button
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${viewMode === 'list' ? 'bg-white text-[#1A1F1B] border border-[#E8EAE8] shadow-sm' : 'text-[#5C6560] hover:text-[#1A1F1B]'}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-[#F0C000] text-white text-sm font-semibold px-6 py-2.5 hover:bg-[#B8920A] shadow-md shadow-[#F0C000]/10 transition-all active:scale-95"
            onClick={onAddPartner}
          >
            <FiPlus className="h-4 w-4" />
            <span>Add Partner</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EAE8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#FAFAFA] text-[#5C6560] font-semibold border-b border-[#E8EAE8]">
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Organization</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Contact Person</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Contribution Type</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Status</th>
                <th className="py-4 px-6 uppercase tracking-wider text-[11px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAE8]">
            {partners.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#9CA89F] italic">
                  No partners added yet.
                </td>
              </tr>
            )}
            {partners.map((partner) => (
              <tr
                key={partner.id}
                className={`hover:bg-[#FAFAFA]/50 transition-colors group cursor-pointer ${selectedPartnerId === partner.id ? 'bg-[#FAFAFA]' : 'bg-white'}`}
                onClick={() => onSelectPartner(partner.id)}
              >
                <td className="py-4 px-6 font-bold text-[#1A1F1B]">{partner.name}</td>
                <td className="py-4 px-6 text-[#5C6560] font-medium">{partner.contact}</td>
                <td className="py-4 px-6 text-[#5C6560]">{partner.type}</td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                      partner.status === 'Active'
                        ? 'bg-[#F0F8F1] text-[#4A8058] border-[#D6EDD9]'
                        : 'bg-[#FAFAFA] text-[#9CA89F] border-[#E8EAE8]'
                    }`}
                  >
                    {partner.status || 'Active'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end">
                    <button
                      className="p-2 text-[#9CA89F] hover:text-[#1A1F1B] hover:bg-[#FAFAFA] rounded-lg transition-all active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPartner(partner.id);
                      }}
                      title="View Details"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPartner && (
        <div className="bg-[#FAFAFA] rounded-2xl border border-[#E8EAE8] p-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Partner details</p>
              <h3 className="text-lg font-bold text-[#1A1F1B]">{selectedPartner.name}</h3>
            </div>
            <button
              onClick={() => onSelectPartner(null)}
              className="p-2 text-[#9CA89F] hover:text-[#1A1F1B] rounded-full hover:bg-white transition-all border border-transparent hover:border-[#E8EAE8]"
            >
              <FiXCircle className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Contact Person</p>
              <p className="text-sm font-semibold text-[#1A1F1B]">{selectedPartner.contact || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Contribution Type</p>
              <p className="text-sm font-semibold text-[#1A1F1B]">{selectedPartner.type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider mb-1">Status</p>
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${
                    selectedPartner.status === 'Active'
                      ? 'bg-[#F0F8F1] text-[#4A8058] border-[#D6EDD9]'
                      : 'bg-[#FAFAFA] text-[#9CA89F] border-[#E8EAE8]'
                  }`}
                >
                  {selectedPartner.status || 'Active'}
                </span>
              </div>
            </div>
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
