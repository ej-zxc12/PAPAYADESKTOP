import { doc, getDoc, setDoc, collection } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

const COLLECTION_NAME = 'appleScholarship'
const DOC_ID = 'content'

export const appleScholarshipService = {
  // Get the scholarship content
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
            title: 'Apple Scholarships',
            description: 'Empowering bright minds through education, transforming futures one scholarship at a time.',
            imageUrl: ''
          },
          about: {
            title: 'About the Program',
            description: 'The Apple Scholarships program provides comprehensive educational support to high-potential students from underserved communities in Payatas. We believe that education is the key to breaking the cycle of poverty and creating lasting change in our community.',
            features: [
              { id: 1, title: 'Academic Excellence', description: 'Supporting students from elementary through tertiary education with comprehensive academic assistance.', icon: 'FiType' },
              { id: 2, title: 'Holistic Development', description: 'Beyond financial support, we provide mentorship, counseling, and character formation programs.', icon: 'FiShield' },
              { id: 3, title: 'Long-term Impact', description: 'Creating sustainable change by investing in the next generation of leaders and professionals.', icon: 'FiStar' }
            ]
          },
          benefits: {
            title: 'Scholarship Benefits',
            categories: [
              {
                id: 1,
                title: 'Financial Support',
                items: ['Full tuition coverage', 'Book and learning materials allowance', 'Transportation stipend', 'Uniform and school supplies']
              },
              {
                id: 2,
                title: 'Academic Support',
                items: ['Regular tutoring sessions', 'Mentorship program', 'Career guidance counseling', 'Leadership development workshops']
              }
            ]
          },
          eligibility: {
            title: 'Eligibility Requirements',
            requirements: [
              'Resident of Payatas or nearby communities',
              'Demonstrated financial need',
              'Strong academic performance and potential',
              'Good moral character and conduct',
              'Commitment to community service',
              'Parent/guardian support and involvement'
            ]
          },
          graduatedScholars: {
            title: 'Our Successful Graduates',
            description: 'Celebrating the achievements of Apple Scholars who have successfully completed their education journey.',
            batches: []
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Apple Scholarship content:', error)
      throw new Error('Failed to fetch Apple Scholarship content')
    }
  },

  // Update the scholarship content
  async updateContent(content) {
    try {
      const db = getFirebaseDb()
      const docRef = doc(db, COLLECTION_NAME, DOC_ID)
      await setDoc(docRef, {
        ...content,
        updatedAt: new Date().toISOString()
      })
      return true
    } catch (error) {
      console.error('Error updating Apple Scholarship content:', error)
      throw new Error('Failed to update Apple Scholarship content')
    }
  },

  // Subscribe to real-time updates
  subscribeToContent(callback) {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID)
    
    return unsubscribe = () => {
      // For now, we'll use a simple polling approach
      // In a real implementation, you might want to use onSnapshot
      console.log('Unsubscribed from Apple Scholarship content')
    }
  }
}
