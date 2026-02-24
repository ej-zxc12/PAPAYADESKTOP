import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { getFirebaseDb, getFirebaseStorage } from './firebase'

const COLLECTION = 'alumni'

function normalizeAlumniItem(id, data) {
  const raw = data || {}
  let createdAt = raw.createdAt

  if (createdAt && typeof createdAt === 'object' && typeof createdAt.toDate === 'function') {
    createdAt = createdAt.toDate().toISOString()
  }

  return {
    id: raw.id || id,
    name: raw.name || '',
    batchYear: raw.batchYear ?? '',
    programOrGrade: raw.programOrGrade || '',
    notes: raw.notes || '',
    createdAt: createdAt || '',
    imageUrl: raw.imageUrl || '',
    imagePath: raw.imagePath || '',
    _docId: id,
  }
}

async function uploadAlumniImage({ docId, file }) {
  const storage = getFirebaseStorage()
  const safeName = String(file?.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `alumni/${String(docId)}/${Date.now()}-${safeName}`
  const objectRef = storageRef(storage, path)
  await uploadBytes(objectRef, file)
  const url = await getDownloadURL(objectRef)
  return { url, path }
}

export const alumniService = {
  async getAll() {
    const db = getFirebaseDb()
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => normalizeAlumniItem(d.id, d.data()))
  },

  async add({ id, name, batchYear, programOrGrade, notes, imageFile }) {
    const db = getFirebaseDb()

    const payload = {
      id,
      name,
      batchYear,
      programOrGrade: programOrGrade || '',
      notes: notes || '',
      imageUrl: '',
      imagePath: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const ref = await addDoc(collection(db, COLLECTION), payload)

    if (imageFile) {
      const uploaded = await uploadAlumniImage({ docId: ref.id, file: imageFile })
      const patch = {
        imageUrl: uploaded.url,
        imagePath: uploaded.path,
        updatedAt: serverTimestamp(),
      }
      await updateDoc(doc(db, COLLECTION, ref.id), patch)
      return normalizeAlumniItem(ref.id, { ...payload, ...patch })
    }

    return normalizeAlumniItem(ref.id, payload)
  },

  async remove(docId, imagePath) {
    const db = getFirebaseDb()
    await deleteDoc(doc(db, COLLECTION, String(docId)))

    if (imagePath) {
      try {
        const storage = getFirebaseStorage()
        await deleteObject(storageRef(storage, imagePath))
      } catch {
      }
    }
  },
}
