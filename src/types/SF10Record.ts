export interface SF10Address {
  line1?: string
  line2?: string
  barangay?: string
  cityMunicipality?: string
  province?: string
  country?: string
  postalCode?: string
}

export interface SF10Guardian {
  name: string
  relationship?: string
  contactNumber?: string
  address?: SF10Address
}

export interface SF10SchoolInfo {
  schoolName: string
  schoolId?: string
  district?: string
  division?: string
  region?: string
  schoolYearFrom?: string
  schoolYearTo?: string
}

export interface SF10AttendanceSummary {
  schoolYear: string
  gradeLevel: string
  daysPresent?: number
  daysAbsent?: number
  totalDays?: number
}

export interface SF10SubjectGrade {
  subjectName: string
  finalGrade?: number
  remarks?: string
}

export interface SF10GradeLevelRecord {
  schoolYear: string
  gradeLevel: string
  section?: string
  adviser?: string
  subjects: SF10SubjectGrade[]
  generalAverage?: number
  promotionStatus?: string
  attendance?: SF10AttendanceSummary
}

export interface SF10Record {
  studentId: string
  studentProfile: {
    lrn?: string
    address?: SF10Address
    father?: SF10Guardian
    mother?: SF10Guardian
    guardian?: SF10Guardian
  }
  schoolInfo: SF10SchoolInfo
  gradeRecords: SF10GradeLevelRecord[]
  remarks?: string
  updatedAtIso?: string
}
