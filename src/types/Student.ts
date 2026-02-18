export interface Student {
  id: string
  firstName: string
  middleName?: string
  lastName: string
  gender?: string
  birthDate?: string
  lrn?: string
  currentGradeLevel?: string
  currentSection?: string
  status?: 'active' | 'inactive' | 'alumni'
}
