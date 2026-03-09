import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, startOfMonth, startOfWeek, subMonths, isSameMonth, isToday } from 'date-fns'
import { FiChevronLeft, FiChevronRight, FiPlus, FiTrash2, FiX, FiCalendar, FiClock, FiEdit2 } from 'react-icons/fi'
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
  const [editingEvent, setEditingEvent] = useState(null)

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
        align-items: flex-start;
        gap: 4px;
        white-space: normal;
        overflow: hidden;
        height: 28px;
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

  const handleAdd = async (e) => {
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

  const handleUpdate = async (e) => {
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
      await calendarEventService.updateEvent({
        id: editingEvent.id,
        patch: {
          title: modalTitle.trim(),
          description: modalDescription.trim(),
          startAt: startDateTime.toISOString(),
          endAt: endDateTime.toISOString(),
          timezone: modalTimezone,
          nextRunAt: startDateTime.toISOString(),
        }
      })
      closeModal()
    } catch (e) {
      setError(e?.message || 'Failed to update event.')
    } finally {
      setIsAdding(false)
    }
  }

  const openModal = () => {
    setEditingEvent(null)
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

  const openEditModal = (event) => {
    setEditingEvent(event)
    const startDate = toDate(event.startAt)
    const endDate = toDate(event.endAt)
    
    if (startDate) {
      setModalStartDate(format(startDate, 'yyyy-MM-dd'))
      setModalStartTime(format(startDate, 'HH:mm'))
    }
    if (endDate) {
      setModalEndDate(format(endDate, 'yyyy-MM-dd'))
      setModalEndTime(format(endDate, 'HH:mm'))
    }
    
    setModalTitle(event.title || '')
    setModalDescription(event.description || '')
    setModalTimezone(event.timezone || 'Asia/Manila')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingEvent(null)
    setError('')
  }

  const handleModalSubmit = editingEvent ? handleUpdate : handleAdd

  const handleDescriptionChange = useCallback((e) => {
    setModalDescription(e.target.value)
  }, [])

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
                          <div 
                            key={event.id} 
                            className={`event-badge ${cat.color} group flex items-center justify-between gap-1 cursor-pointer hover:opacity-90`}
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditModal(event)
                            }}
                          >
                            <div className="flex items-start gap-1 flex-1 min-w-0">
                              <FiClock className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
                              <div className="flex flex-col min-w-0 flex-1 leading-[12px]">
                                <span className="truncate text-xs font-medium h-[12px]">{event.title}</span>
                                <span className="truncate text-xs opacity-80 h-[12px]">{event.description || ''}</span>
                              </div>
                            </div>
                            <FiEdit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 flex-shrink-0" />
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

      <EventModal 
        key={showModal ? 'modal-open' : 'modal-closed'}
        showModal={showModal}
        editingEvent={editingEvent}
        modalTitle={modalTitle}
        modalDescription={modalDescription}
        modalStartDate={modalStartDate}
        modalStartTime={modalStartTime}
        modalEndDate={modalEndDate}
        modalEndTime={modalEndTime}
        modalTimezone={modalTimezone}
        error={error}
        isAdding={isAdding}
        onTitleChange={setModalTitle}
        onDescriptionChange={handleDescriptionChange}
        onStartDateChange={setModalStartDate}
        onStartTimeChange={setModalStartTime}
        onEndDateChange={setModalEndDate}
        onEndTimeChange={setModalEndTime}
        onTimezoneChange={setModalTimezone}
        onSubmit={handleModalSubmit}
        onClose={closeModal}
      />
      </div>
    </div>
  )
}

function EventModal({ 
  showModal, 
  editingEvent, 
  modalTitle, 
  modalDescription, 
  modalStartDate, 
  modalStartTime, 
  modalEndDate, 
  modalEndTime, 
  modalTimezone, 
  error, 
  isAdding, 
  onTitleChange, 
  onDescriptionChange, 
  onStartDateChange, 
  onStartTimeChange, 
  onEndDateChange, 
  onEndTimeChange, 
  onTimezoneChange, 
  onSubmit, 
  onClose 
}) {
  if (!showModal) return null

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-200/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#FAFAFA] border-b border-[#E8EAE8] p-5 text-[#1A1F1B] sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FiCalendar className="h-5 w-5 text-[#F0C000]" />
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <p className="text-xs text-[#5C6560] mt-1">
                {editingEvent ? 'Update your event details' : 'Schedule your event with details'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-[#5C6560] hover:text-[#1A1F1B] hover:bg-[#FAFAFA] transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#1A1F1B] mb-2">
              Event Title <span className="text-[#D97070]">*</span>
            </label>
            <input
              type="text"
              value={modalTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-4 py-3 text-sm"
              placeholder="Enter event title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1F1B] mb-2">
              Description
            </label>
            <textarea
              value={modalDescription}
              onChange={onDescriptionChange}
              className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-3 text-sm"
              placeholder="Add event description (optional)"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#1A1F1B] flex items-center gap-2 pb-2 border-b border-[#E8EAE8]">
              <FiCalendar className="h-4 w-4 text-[#F0C000]" />
              Date & Time
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#5C6560] mb-1">
                    Start Date <span className="text-[#D97070]">*</span>
                  </label>
                  <input
                    type="date"
                    value={modalStartDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="w-full rounded-lg border border-[#E8EAE8] bg-[#FAFAFA] px-3 py-2 text-sm"
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
                    onChange={(e) => onStartTimeChange(e.target.value)}
                    className="w-full rounded-lg border border-[#E8EAE8] bg-[#FAFAFA] px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#5C6560] mb-1">
                    End Date <span className="text-[#D97070]">*</span>
                  </label>
                  <input
                    type="date"
                    value={modalEndDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="w-full rounded-lg border border-[#E8EAE8] bg-[#FAFAFA] px-3 py-2 text-sm"
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
                    onChange={(e) => onEndTimeChange(e.target.value)}
                    className="w-full rounded-lg border border-[#E8EAE8] bg-[#FAFAFA] px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1F1B] mb-2">
              Timezone
            </label>
            <select
              value={modalTimezone}
              onChange={(e) => onTimezoneChange(e.target.value)}
              className="w-full rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-4 py-3 text-sm"
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

          <div className="flex gap-3 pt-4 border-t border-[#E8EAE8]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#E8EAE8] bg-white px-6 py-3 text-sm font-bold text-[#5C6560]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="flex-1 rounded-xl bg-[#F0C000] px-6 py-3 text-sm font-bold text-white"
            >
              {editingEvent ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
