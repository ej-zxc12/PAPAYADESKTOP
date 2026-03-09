import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

const COLLECTION_NAME = 'pineappleProject'
const DOC_ID = 'content'

export const pineappleProjectService = {
  // Get the pineapple project content
  async getContent() {
    try {
      const db = getFirebaseDb()
      const docRef = doc(db, COLLECTION_NAME, DOC_ID)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data()
      } else {
        // Return default content if document doesn't exist
        return {
          hero: {
            title: 'Pineapple Livelihood',
            description: 'Building sustainable livelihoods through creativity, environmental responsibility, and community empowerment.',
            imageUrl: ''
          },
          launch: {
            title: 'Pineapple Initiative Launch Events',
            description: 'Documenting the journey and milestones of the Pineapple Livelihood Initiative launch events and activities.',
            events: []
          },
          about: {
            title: 'About the Project',
            description: 'Empowering Parents. Supporting Education. Promoting Sustainability. Pineapple Livelihood turns creativity into income through handcrafted, recycled products made by the proud families of Papaya Academy scholars.',
            features: [
              { id: 1, title: 'Sustainable Farming', description: 'Teaching modern agricultural techniques that maximize yield while preserving the environment.', icon: 'FiType' },
              { id: 2, title: 'Community Empowerment', description: 'Building strong cooperative networks that support local farmers and their families.', icon: 'FiUsers' },
              { id: 3, title: 'Economic Growth', description: 'Creating sustainable income streams that lift families out of poverty permanently.', icon: 'FiTrendingUp' }
            ]
          },
          components: {
            title: 'Program Components',
            categories: [
              {
                id: 1,
                title: 'Training & Education',
                items: ['Modern farming techniques', 'Business management skills', 'Financial literacy training', 'Quality control standards']
              },
              {
                id: 2,
                title: 'Support Services',
                items: ['Access to quality seedlings', 'Equipment and tools provision', 'Market linkage assistance', 'Technical support visits']
              }
            ]
          },
          impact: {
            title: 'Our Impact',
            stats: [
              { id: 1, label: 'Farmers Trained', value: '150+' },
              { id: 2, label: 'Hectares Cultivated', value: '3' },
              { id: 3, label: 'Income Increase', value: '85%' },
              { id: 4, label: 'Families Supported', value: '50+' }
            ]
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Pineapple Project content:', error)
      throw new Error('Failed to fetch Pineapple Project content')
    }
  },

  // Update the pineapple project content
  async updateContent(content) {
    const db = getFirebaseDb()
    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID)
      await setDoc(docRef, {
        ...content,
        updatedAt: new Date().toISOString()
      })
      return true
    } catch (error) {
      console.error('Error updating Pineapple Project content:', error)
      throw new Error('Failed to update Pineapple Project content')
    }
  },

  // Subscribe to real-time updates
  subscribeToContent(callback) {
    const db = getFirebaseDb()
    const docRef = doc(db, COLLECTION_NAME, DOC_ID)
    
    return unsubscribe = () => {
      // For now, we'll use a simple polling approach
      // In a real implementation, you might want to use onSnapshot
      console.log('Unsubscribed from Pineapple Project content')
    }
  }
}
