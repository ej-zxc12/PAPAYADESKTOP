import * as chrono from 'chrono-node'
import { RRule } from 'rrule'

function getLocalTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

function parseRecurrence(text) {
  const t = String(text || '').toLowerCase()

  if (!t.includes('every') && !t.includes('daily') && !t.includes('weekly') && !t.includes('monthly') && !t.includes('yearly')) {
    return ''
  }

  if (t.includes('daily') || t.includes('every day')) {
    return new RRule({ freq: RRule.DAILY, interval: 1 }).toString()
  }

  if (t.includes('weekly') || t.includes('every week')) {
    return new RRule({ freq: RRule.WEEKLY, interval: 1 }).toString()
  }

  if (t.includes('monthly') || t.includes('every month')) {
    return new RRule({ freq: RRule.MONTHLY, interval: 1 }).toString()
  }

  if (t.includes('yearly') || t.includes('every year') || t.includes('annually')) {
    return new RRule({ freq: RRule.YEARLY, interval: 1 }).toString()
  }

  const weekdayMap = {
    monday: RRule.MO,
    tuesday: RRule.TU,
    wednesday: RRule.WE,
    thursday: RRule.TH,
    friday: RRule.FR,
    saturday: RRule.SA,
    sunday: RRule.SU,
  }

  for (const [word, rr] of Object.entries(weekdayMap)) {
    if (t.includes(`every ${word}`)) {
      return new RRule({ freq: RRule.WEEKLY, interval: 1, byweekday: [rr] }).toString()
    }
  }

  return ''
}

export function parseQuickAdd(input, { now = new Date() } = {}) {
  const text = String(input || '').trim()
  if (!text) {
    return { ok: false, error: 'Please type an event.' }
  }

  const timezone = getLocalTimeZone()
  const start = chrono.parseDate(text, now, { forwardDate: true })

  if (!start || Number.isNaN(start.getTime())) {
    return { ok: false, error: 'Could not understand the date/time. Try: "team meeting tomorrow 3pm".' }
  }

  const rrule = parseRecurrence(text)
  const end = new Date(start.getTime() + 60 * 60 * 1000)

  const title = text

  return {
    ok: true,
    value: {
      title,
      description: '',
      timezone,
      startAt: start,
      endAt: end,
      rrule,
      nextRunAt: start,
    },
  }
}
