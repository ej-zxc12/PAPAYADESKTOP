import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

const MEMBERS_COLLECTION = 'orgChartMembers'
const META_COLLECTION = 'orgChartMeta'
const DEFAULT_META_ID = 'default'

function normalizeMember(id, data) {
  const raw = data || {}
  return {
    id,
    name: raw.name || '',
    position: raw.position || '',
    department: raw.department || '',
    reportsTo: raw.reportsTo || '',
    order: typeof raw.order === 'number' ? raw.order : 0,
    imageUrl: raw.imageUrl || '',
    imagePath: raw.imagePath || '',
  }
}

export const orgChartService = {
  async getMeta() {
    const db = getFirebaseDb()
    const snap = await getDoc(doc(db, META_COLLECTION, DEFAULT_META_ID))
    const data = snap.exists() ? snap.data() : null
    return {
      title: data?.title || '',
      description: data?.description || '',
    }
  },

  async setMeta({ title, description }) {
    const db = getFirebaseDb()
    await setDoc(
      doc(db, META_COLLECTION, DEFAULT_META_ID),
      {
        title: title || '',
        description: description || '',
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  },

  async getMembers() {
    const db = getFirebaseDb()
    const q = query(collection(db, MEMBERS_COLLECTION), orderBy('order', 'asc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => normalizeMember(d.id, d.data()))
  },

  async addMember({ name, position, department, reportsTo, order }) {
    const db = getFirebaseDb()
    const payload = {
      name: name || '',
      position: position || '',
      department: department || '',
      reportsTo: reportsTo || '',
      order: typeof order === 'number' ? order : 0,
      imageUrl: '',
      imagePath: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const ref = await addDoc(collection(db, MEMBERS_COLLECTION), payload)
    return normalizeMember(ref.id, payload)
  },

  async setMember({ id, name, position, department, reportsTo, order, imageUrl, imagePath }) {
    const db = getFirebaseDb()
    const ref = doc(db, MEMBERS_COLLECTION, String(id))
    const payload = {
      name: name || '',
      position: position || '',
      department: department || '',
      reportsTo: reportsTo || '',
      order: typeof order === 'number' ? order : 0,
      imageUrl: imageUrl || '',
      imagePath: imagePath || '',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }
    await setDoc(ref, payload, { merge: true })
    return normalizeMember(String(id), payload)
  },

  async updateMember({ id, name, position, department, reportsTo, order, imageUrl, imagePath }) {
    const db = getFirebaseDb()
    const ref = doc(db, MEMBERS_COLLECTION, String(id))
    const payload = {
      ...(name !== undefined ? { name } : {}),
      ...(position !== undefined ? { position } : {}),
      ...(department !== undefined ? { department } : {}),
      ...(reportsTo !== undefined ? { reportsTo } : {}),
      ...(order !== undefined ? { order } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(imagePath !== undefined ? { imagePath } : {}),
      updatedAt: serverTimestamp(),
    }
    await updateDoc(ref, payload)
  },

  async removeMember(id) {
    const db = getFirebaseDb()
    await deleteDoc(doc(db, MEMBERS_COLLECTION, String(id)))
  },
}
