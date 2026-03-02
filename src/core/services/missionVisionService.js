import { collection, doc, getDoc, getDocs, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

const COLLECTION_NAME = 'missionVision'

export const missionVisionService = {
  // Get mission & vision content
  async getContent() {
    try {
      const docRef = doc(db, COLLECTION_NAME, 'main')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      } else {
        // Return default content if none exists
        return {
          mission: {
            title: 'Our Mission',
            content: 'To empower communities through quality education, sustainable development, and transformative programs that create lasting positive change.',
            image: ''
          },
          vision: {
            title: 'Our Vision',
            content: 'A world where every individual has access to opportunities for growth, education, and the chance to reach their full potential.',
            image: ''
          },
          values: [
            {
              title: 'Excellence',
              description: 'We strive for the highest standards in everything we do.',
              icon: 'star'
            },
            {
              title: 'Integrity',
              description: 'We act with honesty and transparency in all our dealings.',
              icon: 'heart'
            },
            {
              title: 'Compassion',
              description: 'We care deeply about the people and communities we serve.',
              icon: 'users'
            },
            {
              title: 'Innovation',
              description: 'We embrace creativity and new approaches to solve challenges.',
              icon: 'lightbulb'
            }
          ]
        }
      }
    } catch (error) {
      console.error('Error fetching mission & vision:', error)
      throw error
    }
  },

  // Update mission & vision content
  async updateContent(content) {
    try {
      const docRef = doc(db, COLLECTION_NAME, 'main')
      await updateDoc(docRef, {
        ...content,
        updatedAt: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('Error updating mission & vision:', error)
      throw error
    }
  },

  // Create initial mission & vision content
  async createContent(content) {
    try {
      const docRef = doc(db, COLLECTION_NAME, 'main')
      await setDoc(docRef, {
        ...content,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('Error creating mission & vision:', error)
      throw error
    }
  },

  // Save content (create or update)
  async saveContent(content) {
    try {
      const existing = await this.getContent()
      if (existing.id) {
        return await this.updateContent(content)
      } else {
        return await this.createContent(content)
      }
    } catch (error) {
      console.error('Error saving mission & vision:', error)
      throw error
    }
  }
}
