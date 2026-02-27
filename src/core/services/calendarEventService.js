import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from './firebase'

function getEventsCollection(db) {
  return collection(db, 'events')
}

function normalizeEvent(id, data) {
  const raw = data || {}
  const getIso = (value) => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'object' && typeof value.toDate === 'function') return value.toDate().toISOString()
    return ''
  }

  return {
    id,
    title: raw.title || '',
    description: raw.description || '',
    timezone: raw.timezone || '',
    status: raw.status || 'scheduled',
    rrule: raw.rrule || '',
    startAt: getIso(raw.startAt),
    endAt: getIso(raw.endAt),
    nextRunAt: getIso(raw.nextRunAt),
    lastPostedAt: getIso(raw.lastPostedAt),
    postedAt: getIso(raw.postedAt),
    createdAt: getIso(raw.createdAt),
    updatedAt: getIso(raw.updatedAt),
  }
}

export const calendarEventService = {
  async addEvent({ title, description, startAt, endAt, timezone, rrule, nextRunAt }) {
    const db = getFirebaseDb()
    const auth = getFirebaseAuth()
    const uid = auth?.currentUser?.uid
    if (!uid) throw new Error('You must be signed in to manage events.')

    const payload = {
      title: String(title || '').trim(),
      description: String(description || '').trim(),
      timezone: String(timezone || '').trim(),
      status: 'scheduled',
      rrule: String(rrule || '').trim(),
      startAt: startAt || null,
      endAt: endAt || null,
      nextRunAt: nextRunAt || startAt || null,
      postedAt: null,
      createdBy: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const ref = await addDoc(getEventsCollection(db), payload)
    return normalizeEvent(ref.id, payload)
  },

  async updateEvent({ id, patch }) {
    const db = getFirebaseDb()
    const auth = getFirebaseAuth()
    const uid = auth?.currentUser?.uid
    if (!uid) throw new Error('You must be signed in to manage events.')

    const ref = doc(db, 'events', String(id))
    await updateDoc(ref, { ...(patch || {}), updatedAt: serverTimestamp() })
  },

  async removeEvent(id) {
    const db = getFirebaseDb()
    const auth = getFirebaseAuth()
    const uid = auth?.currentUser?.uid
    if (!uid) throw new Error('You must be signed in to manage events.')

    await deleteDoc(doc(db, 'events', String(id)))
  },

  async listUpcoming({ max = 200 } = {}) {
    const db = getFirebaseDb()
    const auth = getFirebaseAuth()
    const uid = auth?.currentUser?.uid
    if (!uid) throw new Error('You must be signed in to manage events.')

    const q = query(
      getEventsCollection(db),
      orderBy('nextRunAt', 'asc'),
      limit(Math.min(Math.max(Number(max) || 200, 1), 500)),
    )

    const snap = await getDocs(q)
    return snap.docs.map((d) => normalizeEvent(d.id, d.data()))
  },

  subscribeUpcoming({ onData, onError, max = 200 } = {}) {
    const db = getFirebaseDb()
    const auth = getFirebaseAuth()
    const uid = auth?.currentUser?.uid
    if (!uid) throw new Error('You must be signed in to manage events.')

    const q = query(
      getEventsCollection(db),
      orderBy('nextRunAt', 'asc'),
      limit(Math.min(Math.max(Number(max) || 200, 1), 500)),
    )

    return onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => normalizeEvent(d.id, d.data()))
        if (typeof onData === 'function') onData(rows)
      },
      (err) => {
        if (typeof onError === 'function') onError(err)
      },
    )
  },

  subscribeForDay({ dayStart, dayEnd, onData, onError } = {}) {
    const db = getFirebaseDb()
    const auth = getFirebaseAuth()
    const uid = auth?.currentUser?.uid
    if (!uid) throw new Error('You must be signed in to manage events.')

    const q = query(
      getEventsCollection(db),
      where('startAt', '>=', dayStart),
      where('startAt', '<', dayEnd),
      orderBy('startAt', 'asc'),
    )

    return onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => normalizeEvent(d.id, d.data()))
        if (typeof onData === 'function') onData(rows)
      },
      (err) => {
        if (typeof onError === 'function') onError(err)
      },
    )
  },
}
