import { initializeApp, getApps } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDtSindkymD94UsJdOr5F0SPyulRbvGA1I",
  authDomain: "papayaacademy-system.firebaseapp.com",
  projectId: "papayaacademy-system",
  storageBucket: "papayaacademy-system.firebasestorage.app",
  messagingSenderId: "1038999818594",
  appId: "1:1038999818594:web:2e8d114a1db0de43011c3b",
  measurementId: "G-KYY5KDBVNP"
}

let cachedAuth
let cachedDb
let cachedStorage

export function getFirebaseApp() {
  return getApps().length ? getApps().find(app => app.name === '[DEFAULT]') || getApps()[0] : initializeApp(firebaseConfig)
}

export function getSecondaryFirebaseApp() {
  const secondaryName = 'secondary-auth-app';
  const existingApp = getApps().find(app => app.name === secondaryName);
  return existingApp || initializeApp(firebaseConfig, secondaryName);
}

export function getFirebaseAuth() {
  if (cachedAuth) return cachedAuth

  try {
    const app = getFirebaseApp()
    cachedAuth = getAuth(app)
    setPersistence(cachedAuth, browserLocalPersistence)
    console.log('Firebase auth initialized successfully')
    return cachedAuth
  } catch (error) {
    console.error('Firebase initialization error:', error)
    throw error
  }
}

export function getFirebaseStorage() {
  if (cachedStorage) return cachedStorage

  try {
    const app = getFirebaseApp()
    cachedStorage = getStorage(app)
    console.log('Firebase storage initialized successfully')
    return cachedStorage
  } catch (error) {
    console.error('Firebase initialization error:', error)
    throw error
  }
}

export function getFirebaseDb() {
  if (cachedDb) return cachedDb

  try {
    const app = getFirebaseApp()
    cachedDb = getFirestore(app)
    console.log('Firebase firestore initialized successfully')
    return cachedDb
  } catch (error) {
    console.error('Firebase initialization error:', error)
    throw error
  }
}