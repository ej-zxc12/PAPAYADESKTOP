import type { MediaFile, MediaFolder } from '../models/MediaLibrary'

export const mediaFilesMock: MediaFile[] = [
  {
    id: 'MEDIA-001',
    filename: 'school-building.jpg',
    originalName: 'Papaya Academy Main Building.jpg',
    fileType: 'image/jpeg',
    fileSize: 2048576,
    filePath: '/images/school-building.jpg',
    url: 'https://example.com/images/school-building.jpg',
    altText: 'Papaya Academy main building',
    caption: 'Our newly renovated main building',
    tags: ['building', 'campus', 'infrastructure'],
    uploadedBy: 'admin',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z'
  },
  {
    id: 'MEDIA-002',
    filename: 'graduation-2023.jpg',
    originalName: 'Graduation Ceremony 2023.jpg',
    fileType: 'image/jpeg',
    fileSize: 3072000,
    filePath: '/images/graduation-2023.jpg',
    url: 'https://example.com/images/graduation-2023.jpg',
    altText: 'Graduation ceremony 2023',
    caption: 'Batch 2023 graduation ceremony',
    tags: ['graduation', 'ceremony', 'students'],
    uploadedBy: 'admin',
    createdAt: '2024-01-12T10:30:00Z',
    updatedAt: '2024-01-12T10:30:00Z'
  }
]

export const mediaFoldersMock: MediaFolder[] = [
  {
    id: 'FOLDER-001',
    name: 'Campus Photos',
    path: '/images/campus',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'FOLDER-002',
    name: 'Events',
    path: '/images/events',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]
