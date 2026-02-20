import type { WebsiteContent } from '../models/WebsiteContent'

export const websiteContentMock: WebsiteContent = {
  home: {
    hero: {
      title: "Welcome to Papaya Academy",
      subtitle: "Empowering students through quality education and community support",
      backgroundImage: "/images/hero-bg.jpg"
    },
    highlights: [
      {
        title: "Quality Education",
        description: "Providing comprehensive educational programs from elementary to senior high school",
        icon: "graduation-cap"
      },
      {
        title: "Community Support",
        description: "Building partnerships with local and international organizations",
        icon: "users"
      },
      {
        title: "Student Success",
        description: "Track record of academic excellence and student achievements",
        icon: "trophy"
      }
    ]
  },
  aboutUs: {
    ourStory: {
      title: "Our Story",
      content: "Papaya Academy was founded with a vision to provide quality education to the community. Starting from humble beginnings, we have grown into a comprehensive educational institution serving hundreds of students each year.",
      foundingYear: 1995,
      milestones: [
        {
          year: 1995,
          title: "Academy Founded",
          description: "Started with 50 students in a small classroom"
        },
        {
          year: 2005,
          title: "First High School Batch",
          description: "Graduated our first senior high school students"
        },
        {
          year: 2015,
          title: "Campus Expansion",
          description: "Added new buildings and facilities"
        },
        {
          year: 2020,
          title: "Digital Transformation",
          description: "Implemented online learning systems"
        }
      ]
    },
    missionVision: {
      mission: "To provide quality, accessible education that empowers students to become responsible, productive citizens and lifelong learners.",
      vision: "To be a leading educational institution recognized for excellence in teaching, innovation, and community service.",
      values: [
        "Excellence in Education",
        "Integrity and Honesty",
        "Respect for Diversity",
        "Community Service",
        "Innovation and Creativity",
        "Environmental Stewardship"
      ]
    },
    organizationalChart: {
      title: "Organizational Structure",
      description: "Our leadership team ensures smooth operation and educational excellence",
      structure: [
        {
          name: "Dr. Maria Santos",
          position: "School Director",
          department: "Administration"
        },
        {
          name: "Juan Dela Cruz",
          position: "Academic Coordinator",
          department: "Academics",
          reportsTo: "Dr. Maria Santos"
        },
        {
          name: "Ana Reyes",
          position: "Student Affairs Head",
          department: "Student Services",
          reportsTo: "Dr. Maria Santos"
        },
        {
          name: "Roberto Lim",
          position: "Finance Manager",
          department: "Finance",
          reportsTo: "Dr. Maria Santos"
        }
      ]
    },
    partnersSponsors: {
      title: "Our Partners and Sponsors",
      description: "We gratefully acknowledge the organizations that support our mission",
      partners: [
        {
          name: "Department of Education",
          type: "sponsorship",
          description: "Government partnership for educational programs"
        },
        {
          name: "ABC Foundation",
          type: "cash",
          description: "Annual scholarship funding"
        },
        {
          name: "TechCorp Philippines",
          type: "in-kind",
          description: "Technology equipment and support"
        }
      ]
    }
  }
}
