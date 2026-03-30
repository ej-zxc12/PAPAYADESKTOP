import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signOut,
  setPersistence,
  indexedDBLocalPersistence
} from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getFirebaseAuth, getFirebaseDb, getSecondaryFirebaseApp, getFirebaseStorage } from './firebase'

function normalizeRole(role) {
  const raw = String(role || '').trim().toLowerCase()
  if (raw === 'principal') return 'principal'
  return 'teacher'
}

export const accountService = {
  /**
   * Fetches all accounts from the 'teachers_user' collection.
   */
  async getAllAccounts() {
    const db = getFirebaseDb()
    const q = query(collection(db, 'teachers_user'), orderBy('createdAt', 'desc'))
    try {
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching accounts:', error)
      throw error
    }
  },

  /**
   * Creates a teacher/principal account in both Firebase Auth and Firestore.
   * Uses a secondary Firebase App instance to prevent the main Admin session
   * from being replaced by the newly created user.
   */
  async createAccount({ username, email, password, role, isActive, imageFile }) {
    const db = getFirebaseDb()
    const storage = getFirebaseStorage()
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

      // 3. Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        const imageRef = ref(storage, `profiles/${newUid}_${Date.now()}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // 4. Prepare Firestore payload
      const payload = {
        uid: newUid,
        username: String(username || '').trim(),
        email: String(email || '').trim(),
        role: normalizeRole(role),
        isActive: Boolean(isActive),
        imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: adminUser.uid,
      }

      await setDoc(doc(db, 'teachers_user', newUid), payload)

      return { success: true, id: newUid }
    } catch (error) {
      console.error('Account creation error:', error)
      throw error
    }
  },

  /**
   * Updates an existing account's details including profile picture.
   */
  async updateAccount(uid, { username, role, isActive, imageFile }) {
    const db = getFirebaseDb()
    const storage = getFirebaseStorage()
    
    try {
      const docRef = doc(db, 'teachers_user', uid)
      const updates = {
        username: String(username || '').trim(),
        role: normalizeRole(role),
        isActive: Boolean(isActive),
        updatedAt: serverTimestamp(),
      }

      if (imageFile) {
        const imageRef = ref(storage, `profiles/${uid}_${Date.now()}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        updates.imageUrl = await getDownloadURL(snapshot.ref);
      }

      await updateDoc(docRef, updates)
      return { success: true }
    } catch (error) {
      console.error('Account update error:', error)
      throw error
    }
  },

  /**
   * Deletes an account from Firestore.
   * Note: This only deletes the Firestore record, not the Auth user.
   */
  async deleteAccount(uid) {
    const db = getFirebaseDb()
    try {
      await deleteDoc(doc(db, 'teachers_user', uid))
      return { success: true }
    } catch (error) {
      console.error('Account deletion error:', error)
      throw error
    }
  },
}
