import React, { useEffect, useMemo, useState } from 'react'
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import { FiChevronLeft, FiChevronRight, FiPlus, FiTrash2, FiX, FiCalendar } from 'react-icons/fi'
import { calendarEventService } from '../../../core/services/calendarEventService'
import { parseQuickAdd } from '../utils/quickAdd'

function toDate(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export default function CalendarSection() {
  const [quickAdd, setQuickAdd] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [cursorMonth, setCursorMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDay, setSelectedDay] = useState(() => new Date())

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
    const start = startOfWeek(startOfMonth(cursorMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(cursorMonth), { weekStartsOn: 0 })

    const days = []
    let d = start
    while (d <= end) {
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
          <div className="bg-gradient-to-r from-[#1B3E2A] to-[#2A5F3F] p-5 text-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FiCalendar className="h-5 w-5" />
                  Add New Event
                </h3>
                <p className="text-xs text-white/80 mt-1">Schedule your event with details</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
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
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                Event Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="event-title-input"
                type="text"
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent transition-all hover:border-slate-400"
                placeholder="Enter event title"
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={modalDescription}
                onChange={(e) => setModalDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent transition-all hover:border-slate-400 resize-none"
                placeholder="Add event description (optional)"
                rows={3}
              />
            </div>

            {/* Date & Time Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-200">
                <FiCalendar className="h-4 w-4 text-[#1B3E2A]" />
                Date & Time
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date & Time */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Start Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={modalStartDate}
                      onChange={(e) => setModalStartDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent transition-all hover:border-slate-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Start Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={modalStartTime}
                      onChange={(e) => setModalStartTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent transition-all hover:border-slate-400"
                      required
                    />
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      End Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={modalEndDate}
                      onChange={(e) => setModalEndDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent transition-all hover:border-slate-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      End Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={modalEndTime}
                      onChange={(e) => setModalEndTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent transition-all hover:border-slate-400"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Timezone
              </label>
              <select
                value={modalTimezone}
                onChange={(e) => setModalTimezone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent transition-all hover:border-slate-400"
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
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <div className="text-rose-500 mt-0.5">
                    <FiX className="h-4 w-4" />
                  </div>
                  <div className="text-sm text-rose-700">{error}</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAdding}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#1B3E2A] to-[#2A5F3F] px-6 py-3 text-sm font-semibold text-white hover:from-[#163021] hover:to-[#1F4A32] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
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
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 min-h-0">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Calendar</h2>
          <p className="text-xs text-slate-500">Quick add events, view schedule, and track auto-posting.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <input
            type="text"
            value={quickAdd}
            onChange={(e) => setQuickAdd(e.target.value)}
            placeholder='Quick add: "team meeting tomorrow 3pm"'
            className="flex-1 min-w-[240px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
            disabled={isAdding}
          />
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1B3E2A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#163021] disabled:opacity-60 transition-colors shadow-md"
            onClick={handleQuickAdd}
            disabled={isAdding}
          >
            <FiPlus className="h-4 w-4" />
            {isAdding ? 'Adding…' : 'Quick Add'}
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#1B3E2A] to-[#2A5F3F] px-6 py-3 text-sm font-semibold text-white hover:from-[#163021] hover:to-[#1F4A32] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={openModal}
          >
            <FiCalendar className="h-5 w-5" />
            Add Event with Details
          </button>
          <span className="text-xs text-slate-500 italic">For specific dates and times</span>
        </div>
        
        {error ? <div className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</div> : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-4 min-h-0">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => setCursorMonth((prev) => subMonths(prev, 1))}
              title="Previous month"
            >
              <FiChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <div className="text-sm font-semibold text-slate-900">{format(cursorMonth, 'MMMM yyyy')}</div>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => setCursorMonth((prev) => addMonths(prev, 1))}
              title="Next month"
            >
              Next
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>

          {isLoading ? <div className="text-[11px] text-slate-400">Loading events…</div> : null}
          {!isLoading && loadError ? <div className="text-[11px] text-rose-600">{loadError}</div> : null}

          <div className="grid grid-cols-7 gap-2 text-[11px] text-slate-500 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center font-semibold">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((d) => {
              const key = format(d, 'yyyy-MM-dd')
              const count = (eventsByDay.get(key) || []).length
              const isSelected = isSameDay(d, selectedDay)
              const isInMonth = d.getMonth() === cursorMonth.getMonth()

              return (
                <div
                  key={key}
                  className={`rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition min-h-[80px] p-3 cursor-pointer flex flex-col ${
                    isSelected ? 'ring-2 ring-[#1B3E2A] border-[#1B3E2A]' : ''
                  } ${isInMonth ? '' : 'opacity-60'}`}
                  onClick={() => setSelectedDay(d)}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs font-semibold text-slate-900">{format(d, 'd')}</div>
                      {count ? (
                        <div className="rounded-full bg-[#1B3E2A] text-white text-[10px] font-semibold px-1.5 py-0.5 flex-shrink-0">
                          {count}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-2 flex-1 text-left overflow-hidden">
                      {(eventsByDay.get(key) || [])
                        .slice(0, 2)
                        .map((ev) => ev.title)
                        .join(' · ')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 min-h-0">
          <div className="text-sm font-semibold text-slate-900 mb-1">{format(selectedDay, 'EEEE, MMM d')}</div>
          <div className="text-[11px] text-slate-500 mb-3">{selectedEvents.length} event(s)</div>

          <div className="space-y-2 overflow-y-auto max-h-[55vh] pr-1">
            {selectedEvents.map((ev) => {
              const startAt = toDate(ev.startAt)
              const timeLabel = startAt ? format(startAt, 'p') : ''

              return (
                <div key={ev.id} className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{ev.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {timeLabel}
                        {ev.timezone ? ` • ${ev.timezone}` : ''}
                        {ev.rrule ? ' • recurring' : ''}
                      </div>
                      {ev.status === 'posted' ? (
                        <div className="mt-1 inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          Posted
                        </div>
                      ) : (
                        <div className="mt-1 inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          Scheduled
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                      onClick={() => handleDelete(ev.id)}
                      title="Delete event"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}

            {selectedEvents.length === 0 ? (
              <div className="text-[11px] text-slate-400">No events for this day.</div>
            ) : null}
          </div>
        </div>
      </div>
      
      <EventModal />
    </div>
  )
}
