import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signOut,
  setPersistence,
  indexedDBLocalPersistence
} from 'firebase/auth'
import { getFirebaseAuth, getFirebaseDb, getSecondaryFirebaseApp } from './firebase'

function normalizeRole(role) {
  const raw = String(role || '').trim().toLowerCase()
  if (raw === 'principal') return 'principal'
  return 'teacher'
}

export const accountService = {
  /**
   * Creates a teacher/principal account in both Firebase Auth and Firestore.
   * Uses a secondary Firebase App instance to prevent the main Admin session
   * from being replaced by the newly created user.
   */
  async createAccount({ username, email, password, role, isActive }) {
    const db = getFirebaseDb()
    const mainAuth = getFirebaseAuth()
    const adminUser = mainAuth.currentUser

    if (!adminUser) throw new Error('You must be signed in to add accounts.')
    if (!password) throw new Error('Password is required.')

    // Initialize secondary app and auth for background creation
    const secondaryApp = getSecondaryFirebaseApp()
    const secondaryAuth = getAuth(secondaryApp)
    
    // Crucial: Set persistence to 'none' or indexedDB for the secondary auth
    // to ensure it doesn't touch the main app's session storage
    await setPersistence(secondaryAuth, indexedDBLocalPersistence)

    try {
      // 1. Create user in Firebase Authentication via secondary instance
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password)
      const newUid = userCredential.user.uid

      // 2. Immediately sign out the new user from the secondary instance
      await signOut(secondaryAuth)

      // 3. Prepare Firestore payload
      const payload = {
        uid: newUid,
        username: String(username || '').trim(),
        email: String(email || '').trim(),
        role: normalizeRole(role),
        isActive: Boolean(isActive),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: adminUser.uid,
      }

      // 4. Save to 'teachers_user' collection using the main DB instance
      await setDoc(doc(db, 'teachers_user', newUid), payload)
      
      return { success: true, id: newUid }
    } catch (error) {
      console.error('Error creating account:', error)
      throw error
    }
  },
}
