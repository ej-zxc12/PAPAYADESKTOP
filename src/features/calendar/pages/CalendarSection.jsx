import React, { useEffect, useMemo, useState } from 'react'
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, startOfMonth, startOfWeek, subMonths, isSameMonth, isToday } from 'date-fns'
import { FiChevronLeft, FiChevronRight, FiPlus, FiTrash2, FiX, FiCalendar, FiClock, FiUser, FiMapPin } from 'react-icons/fi'
import { calendarEventService } from '../../../core/services/calendarEventService'
import { parseQuickAdd } from '../utils/quickAdd'

const CATEGORIES = [
  { label: 'Academic', color: 'bg-[#7EB88A]', dot: 'bg-[#7EB88A]' },
  { label: 'Social', color: 'bg-[#F0C000]', dot: 'bg-[#F0C000]' },
  { label: 'Board', color: 'bg-[#9CA89F]', dot: 'bg-[#9CA89F]' },
  { label: 'Holiday', color: 'bg-[#D97070]', dot: 'bg-[#D97070]' },
]

function toDate(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export default function CalendarSection() {
  const [view, setView] = useState('Month')
  const [quickAdd, setQuickAdd] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [cursorMonth, setCursorMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDay, setSelectedDay] = useState(() => new Date())

  // Mock data for bottom cards
  const nextEvent = { title: 'Faculty Orientation', time: 'In 2 hrs' }
  const coordinator = { name: 'Sarah Jenkins', role: 'Principal' }
  const venue = { name: 'Conference Center A' }

  // Add custom styles for proper calendar layout
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .calendar-container {
        font-family: 'Inter', sans-serif;
      }
      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border-top: 1px solid #E2E8F0;
        border-left: 1px solid #E2E8F0;
      }
      .calendar-day-header {
        padding: 12px;
        text-align: center;
        font-size: 11px;
        font-weight: 600;
        color: #5C6560;
        text-transform: uppercase;
        border-right: 1px solid #E8EAE8;
        background-color: #FAFAFA;
      }
      .calendar-cell {
        min-height: 120px;
        padding: 8px;
        border-right: 1px solid #E8EAE8;
        border-bottom: 1px solid #E8EAE8;
        background-color: white;
        transition: background-color 0.2s;
      }
      .calendar-cell:hover {
        background-color: #FAFAFA;
      }
      .calendar-cell.outside-month {
        background-color: #FAFAFA;
        color: #9CA89F;
      }
      .event-badge {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 500;
        color: white;
        margin-bottom: 2px;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Modal form state
  const [modalTitle, setModalTitle] = useState('')
  const [modalDescription, setModalDescription] = useState('')
  const [modalStartDate, setModalStartDate] = useState('')
  const [modalStartTime, setModalStartTime] = useState('')
  const [modalEndDate, setModalEndDate] = useState('')
  const [modalEndTime, setModalEndTime] = useState('')
  const [modalTimezone, setModalTimezone] = useState('Asia/Manila')

  useEffect(() => {
    let unsub
    setIsLoading(true)
    setLoadError('')

    try {
      unsub = calendarEventService.subscribeUpcoming({
        onData: (rows) => {
          setEvents(Array.isArray(rows) ? rows : [])
          setIsLoading(false)
        },
        onError: (e) => {
          setEvents([])
          setIsLoading(false)
          setLoadError(e?.message || 'Failed to load events.')
        },
        max: 500,
      })
    } catch (e) {
      setIsLoading(false)
      setLoadError(e?.message || 'Failed to load events.')
    }

    return () => {
      if (typeof unsub === 'function') unsub()
    }
  }, [])

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(cursorMonth)
    const monthEnd = endOfMonth(cursorMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days = []
    let d = calendarStart
    while (d <= calendarEnd) {
      days.push(d)
      d = addDays(d, 1)
    }
    return days
  }, [cursorMonth])

  const eventsByDay = useMemo(() => {
    const map = new Map()
    events.forEach((ev) => {
      const startAt = toDate(ev.startAt)
      if (!startAt) return
      const key = format(startAt, 'yyyy-MM-dd')
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(ev)
    })
    return map
  }, [events])

  const selectedKey = useMemo(() => format(selectedDay, 'yyyy-MM-dd'), [selectedDay])
  const selectedEvents = useMemo(() => {
    const rows = eventsByDay.get(selectedKey) || []
    return rows.slice().sort((a, b) => {
      const da = toDate(a.startAt)?.getTime() || 0
      const db = toDate(b.startAt)?.getTime() || 0
      return da - db
    })
  }, [eventsByDay, selectedKey])

  const handleQuickAdd = async () => {
    const parsed = parseQuickAdd(quickAdd)
    if (!parsed.ok) {
      setError(parsed.error)
      return
    }

    setIsAdding(true)
    setError('')

    try {
      await calendarEventService.addEvent(parsed.value)
      setQuickAdd('')
    } catch (e) {
      setError(e?.message || 'Failed to add event.')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm('Delete this event?')
    if (!confirmed) return

    try {
      await calendarEventService.removeEvent(eventId)
    } catch (e) {
      window.alert(e?.message || 'Failed to delete event.')
    }
  }

  const openModal = () => {
    // Pre-fill with selected day
    const today = new Date()
    const dayToUse = selectedDay || today
    setModalStartDate(format(dayToUse, 'yyyy-MM-dd'))
    setModalStartTime('09:00')
    setModalEndDate(format(dayToUse, 'yyyy-MM-dd'))
    setModalEndTime('10:00')
    setModalTitle('')
    setModalDescription('')
    setModalTimezone('Asia/Manila')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setError('')
  }

  const handleModalSubmit = async (e) => {
    e.preventDefault()
    if (!modalTitle.trim()) {
      setError('Event title is required')
      return
    }

    const startDateTime = new Date(`${modalStartDate}T${modalStartTime}`)
    const endDateTime = new Date(`${modalEndDate}T${modalEndTime}`)

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setError('Invalid date or time')
      return
    }

    setIsAdding(true)
    setError('')

    try {
      await calendarEventService.addEvent({
        title: modalTitle.trim(),
        description: modalDescription.trim(),
        startAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
        timezone: modalTimezone,
      })
      closeModal()
    } catch (e) {
      setError(e?.message || 'Failed to add event.')
    } finally {
      setIsAdding(false)
    }
  }

  const EventModal = () => {
    if (!showModal) return null

    // Auto-focus the title input when modal opens
    React.useEffect(() => {
      const timer = setTimeout(() => {
        const titleInput = document.getElementById('event-title-input')
        if (titleInput) {
          titleInput.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }, [showModal])

    // Handle Escape key to close modal
    React.useEffect(() => {
      const handleEscape = (e) => {
        if (e.key === 'Escape' && showModal) {
          closeModal()
        }
      }
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [showModal])

    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeModal()
          }
        }}
      >
        <div 
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-200/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#FAFAFA] border-b border-[#E8EAE8] p-5 text-[#1A1F1B] sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FiCalendar className="h-5 w-5 text-[#F0C000]" />
                  Add New Event
                </h3>
                <p className="text-xs text-[#5C6560] mt-1">Schedule your event with details</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-[#5C6560] hover:text-[#1A1F1B] hover:bg-[#FAFAFA] transition-colors"
                aria-label="Close modal"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleModalSubmit} className="p-6 space-y-5">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1F1B] mb-2 flex items-center gap-1">
                Event Title <span className="text-[#D97070]">*</span>
              </label>
              <input
                id="event-title-input"
                type="text"
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                className="w-full rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000]/20 focus:border-[#F0C000] transition-all"
                placeholder="Enter event title"
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1F1B] mb-2">
                Description
              </label>
              <textarea
                value={modalDescription}
                onChange={(e) => setModalDescription(e.target.value)}
                className="w-full rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000]/20 focus:border-[#F0C000] transition-all resize-none"
                placeholder="Add event description (optional)"
                rows={3}
              />
            </div>

            {/* Date & Time Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#1A1F1B] flex items-center gap-2 pb-2 border-b border-[#E8EAE8]">
                <FiCalendar className="h-4 w-4 text-[#F0C000]" />
                Date & Time
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date & Time */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#5C6560] mb-1">
                      Start Date <span className="text-[#D97070]">*</span>
                    </label>
                    <input
                      type="date"
                      value={modalStartDate}
                      onChange={(e) => setModalStartDate(e.target.value)}
                      className="w-full rounded-lg border border-[#E8EAE8] bg-[#FAFAFA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000]/20 focus:border-[#F0C000] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5C6560] mb-1">
                      Start Time <span className="text-[#D97070]">*</span>
                    </label>
                    <input
                      type="time"
                      value={modalStartTime}
                      onChange={(e) => setModalStartTime(e.target.value)}
                      className="w-full rounded-lg border border-[#E8EAE8] bg-[#FAFAFA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000]/20 focus:border-[#F0C000] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#5C6560] mb-1">
                      End Date <span className="text-[#D97070]">*</span>
                    </label>
                    <input
                      type="date"
                      value={modalEndDate}
                      onChange={(e) => setModalEndDate(e.target.value)}
                      className="w-full rounded-lg border border-[#E8EAE8] bg-[#FAFAFA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000]/20 focus:border-[#F0C000] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5C6560] mb-1">
                      End Time <span className="text-[#D97070]">*</span>
                    </label>
                    <input
                      type="time"
                      value={modalEndTime}
                      onChange={(e) => setModalEndTime(e.target.value)}
                      className="w-full rounded-lg border border-[#E8EAE8] bg-[#FAFAFA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000]/20 focus:border-[#F0C000] transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1F1B] mb-2">
                Timezone
              </label>
              <select
                value={modalTimezone}
                onChange={(e) => setModalTimezone(e.target.value)}
                className="w-full rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000]/20 focus:border-[#F0C000] transition-all"
              >
                <option value="Asia/Manila">🇵🇭 Philippines (Asia/Manila)</option>
                <option value="UTC">🌍 UTC</option>
                <option value="America/New_York">🇺🇸 Eastern Time</option>
                <option value="America/Chicago">🇺🇸 Central Time</option>
                <option value="America/Denver">🇺🇸 Mountain Time</option>
                <option value="America/Los_Angeles">🇺🇸 Pacific Time</option>
                <option value="Europe/London">🇬🇧 London</option>
                <option value="Europe/Paris">🇫🇷 Paris</option>
                <option value="Asia/Tokyo">🇯🇵 Tokyo</option>
                <option value="Asia/Shanghai">🇨🇳 Shanghai</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-[#D97070]/5 border border-[#D97070]/10 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <div className="text-[#D97070] mt-0.5">
                    <FiX className="h-4 w-4" />
                  </div>
                  <div className="text-sm text-[#D97070]">{error}</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-[#E8EAE8]">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl border border-[#E8EAE8] bg-white px-6 py-3 text-sm font-bold text-[#5C6560] hover:bg-[#FAFAFA] transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAdding}
                className="flex-1 rounded-xl bg-[#F0C000] px-6 py-3 text-sm font-bold text-white hover:bg-[#B8920A] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#F0C000]/10 active:scale-95"
              >
                {isAdding ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Adding Event…
                  </span>
                ) : (
                  'Add Event'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-container p-6 bg-[#F5F6F5] min-h-screen max-w-full">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[#1A1F1B]">{format(cursorMonth, 'MMMM yyyy')}</h1>
          <div className="flex items-center bg-white border border-[#E8EAE8] rounded-lg p-1">
            <button 
              onClick={() => setCursorMonth(prev => subMonths(prev, 1))}
              className="p-1.5 hover:bg-[#FAFAFA] rounded transition-colors text-[#5C6560]"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                setCursorMonth(startOfMonth(new Date()))
                setSelectedDay(new Date())
              }}
              className="px-3 py-1 text-sm font-medium hover:bg-[#FAFAFA] rounded transition-colors text-[#1A1F1B]"
            >
              Today
            </button>
            <button 
              onClick={() => setCursorMonth(prev => addMonths(prev, 1))}
              className="p-1.5 hover:bg-[#FAFAFA] rounded transition-colors text-[#5C6560]"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-[#E8EAE8] rounded-lg p-1 shadow-sm">
            {['Month', 'Week', 'Day'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  view === v 
                    ? 'bg-[#F0C000] text-white shadow-sm' 
                    : 'text-[#5C6560] hover:text-[#1A1F1B] hover:bg-[#FAFAFA]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 bg-[#F0C000] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-[#B8920A] transition-all shadow-md shadow-[#F0C000]/10 active:scale-95"
          >
            <FiPlus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6">
        {CATEGORIES.map((cat) => (
          <div key={cat.label} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${cat.dot}`} />
            <span className="text-xs font-medium text-[#5C6560]">{cat.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8EAE8] mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <div className="grid grid-cols-7 bg-[#FAFAFA]">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                <div key={day} className="calendar-day-header border-b border-r border-[#E8EAE8] last:border-r-0">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 border-collapse">
              {monthDays.map((date) => {
                const dateKey = format(date, 'yyyy-MM-dd')
                const dayEvents = eventsByDay.get(dateKey) || []
                const isSelected = isSameDay(date, selectedDay)
                const isCurrMonth = isSameMonth(date, cursorMonth)
                const isTodayDate = isToday(date)

                return (
                  <div 
                    key={dateKey} 
                    onClick={() => setSelectedDay(date)}
                    className={`calendar-cell border-b border-r border-[#E8EAE8] last:border-r-0 ${!isCurrMonth ? 'outside-month' : ''} ${isSelected ? 'bg-[#FFFAE8]' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                        isTodayDate ? 'bg-[#F0C000] text-white' : 'text-[#1A1F1B]'
                      }`}>
                        {format(date, 'd')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event) => {
                        const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
                        return (
                          <div key={event.id} className={`event-badge ${cat.color}`}>
                            <FiClock className="w-2.5 h-2.5" />
                            {event.title}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E8EAE8] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F0F8F1] rounded-full flex items-center justify-center text-[#7EB88A]">
            <FiClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Next Event</p>
            <p className="text-sm font-bold text-[#1A1F1B]">{nextEvent.title} ({nextEvent.time})</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8EAE8] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FFFAE8] rounded-full flex items-center justify-center text-[#F0C000]">
            <FiUser className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Coordinator</p>
            <p className="text-sm font-bold text-[#1A1F1B]">{coordinator.name} ({coordinator.role})</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8EAE8] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FAFAFA] rounded-full flex items-center justify-center text-[#5C6560]">
            <FiMapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Primary Venue</p>
            <p className="text-sm font-bold text-[#1A1F1B]">{venue.name}</p>
          </div>
        </div>
      </div>
      
      <EventModal />
      </div>
    </div>
  )
}
