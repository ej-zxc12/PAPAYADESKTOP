export interface MediaFile {
  id: string
  filename: string
  originalName: string
  fileType: string
  fileSize: number
  filePath: string
  url: string
  altText?: string
  caption?: string
  tags: string[]
  uploadedBy: string
  createdAt: string
  updatedAt: string
}

export interface MediaFolder {
  id: string
  name: string
  path: string
  parentId?: string
  createdAt: string
  updatedAt: string
}
