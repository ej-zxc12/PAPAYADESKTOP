export interface WebsiteContent {
  home: {
    hero: {
      title: string
      subtitle: string
      backgroundImage?: string
    }
    highlights: {
      title: string
      description: string
      icon?: string
    }[]
  }
  aboutUs: {
    ourStory: {
      title: string
      content: string
      foundingYear: number
      milestones: {
        year: number
        title: string
        description: string
      }[]
    }
    missionVision: {
      mission: string
      vision: string
      values: string[]
    }
    organizationalChart: {
      title: string
      description: string
      structure: {
        name: string
        position: string
        department?: string
        reportsTo?: string
      }[]
    }
    partnersSponsors: {
      title: string
      description: string
      partners: {
        name: string
        type: 'cash' | 'sponsorship' | 'in-kind'
        logo?: string
        website?: string
        description?: string
      }[]
    }
  }
}
