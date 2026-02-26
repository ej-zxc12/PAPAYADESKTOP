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
  where,
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { getFirebaseDb, getFirebaseStorage } from './firebase'

const COLLECTION = 'news'
const ARTICLES_COLLECTION = 'news_articles'

function normalizeNewsItem(id, data) {
  const raw = data || {}
  let dateValue = raw.date

  if (dateValue && typeof dateValue === 'object' && typeof dateValue.toDate === 'function') {
    dateValue = dateValue.toDate().toISOString()
  }

  return {
    id,
    title: raw.title || '',
    content: raw.content || '',
    author: raw.author || '',
    category: raw.category || 'Featured',
    article: raw.article || '',
    slug: raw.slug || '',
    date: dateValue || '',
    imageUrl: raw.imageUrl || '',
    imagePath: raw.imagePath || '',
  }
}

async function uploadNewsImage({ id, file }) {
  const storage = getFirebaseStorage()
  const safeName = String(file?.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `news/${String(id)}/${Date.now()}-${safeName}`
  const objectRef = storageRef(storage, path)
  await uploadBytes(objectRef, file)
  const url = await getDownloadURL(objectRef)
  return { url, path }
}

export const newsService = {
  async getAll() {
    const db = getFirebaseDb()
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => normalizeNewsItem(d.id, d.data()))
  },

  async add({ title, content, author, category, article, slug, imageFile }) {
    const db = getFirebaseDb()
    const payload = {
      title,
      content,
      author: author || '',
      category: category || 'Featured',
      article: article || '',
      slug: slug || '',
      date: new Date().toISOString(),
      imageUrl: '',
      imagePath: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const ref = await addDoc(collection(db, COLLECTION), payload)

    if (imageFile) {
      const uploaded = await uploadNewsImage({ id: ref.id, file: imageFile })
      const patch = {
        imageUrl: uploaded.url,
        imagePath: uploaded.path,
        updatedAt: serverTimestamp(),
      }
      await updateDoc(doc(db, COLLECTION, ref.id), patch)
      return normalizeNewsItem(ref.id, { ...payload, ...patch })
    }

    return normalizeNewsItem(ref.id, payload)
  },

  async update({ id, title, content, author, category, article, slug, imageFile, previousImagePath }) {
    const db = getFirebaseDb()
    const ref = doc(db, COLLECTION, String(id))
    const payload = {
      title,
      content,
      author: author || '',
      category: category || 'Featured',
      article: article || '',
      slug: slug || '',
      updatedAt: serverTimestamp(),
    }

    let uploaded
    if (imageFile) {
      uploaded = await uploadNewsImage({ id, file: imageFile })
      payload.imageUrl = uploaded.url
      payload.imagePath = uploaded.path
    }

    await updateDoc(ref, payload)

    if (uploaded && previousImagePath) {
      try {
        const storage = getFirebaseStorage()
        await deleteObject(storageRef(storage, previousImagePath))
      } catch {
      }
    }

    return {
      id,
      title,
      content,
      author: author || '',
      category: category || 'Featured',
      article: article || '',
      slug: slug || '',
      ...(uploaded ? { imageUrl: uploaded.url, imagePath: uploaded.path } : {}),
    }
  },

  async remove(id, imagePath) {
    const db = getFirebaseDb()
    const ref = doc(db, COLLECTION, String(id))
    await deleteDoc(ref)

    if (imagePath) {
      try {
        const storage = getFirebaseStorage()
        await deleteObject(storageRef(storage, imagePath))
      } catch {
      }
    }
  },
}

export async function getNewsArticleBySlug(slug) {
  try {
    console.log('Fetching article by slug:', slug)
    const db = getFirebaseDb()
    const newsRef = collection(db, COLLECTION)
    const q = query(newsRef, where('slug', '==', slug))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      console.log('Article not found')
      return null
    }

    const doc = querySnapshot.docs[0]
    const data = doc.data()

    return {
      id: doc.id,
      ...data,
    }
  } catch (error) {
    console.error('Error fetching news article:', error)
    throw new Error(`Firebase fetch error: ${error}`)
  }
}
