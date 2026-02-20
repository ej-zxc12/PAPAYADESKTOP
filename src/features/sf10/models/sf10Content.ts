import type { Student } from '../types/Student'
import type { SF10Record } from '../types/SF10Record'

export const sf10StudentsMock: Student[] = [
  {
    id: 'STU-0001',
    firstName: 'Maria',
    lastName: 'Santos',
    lrn: '123456789012',
    currentGradeLevel: 'Grade 6',
    currentSection: 'Sampaguita',
    status: 'active',
  },
  {
    id: 'STU-0002',
    firstName: 'Juan',
    middleName: 'D.',
    lastName: 'Dela Cruz',
    lrn: '234567890123',
    currentGradeLevel: 'Grade 10',
    currentSection: 'Mahogany',
    status: 'active',
  },
  {
    id: 'STU-0003',
    firstName: 'Ana',
    lastName: 'Reyes',
    lrn: '345678901234',
    currentGradeLevel: 'Grade 12',
    currentSection: 'Narra',
    status: 'alumni',
  },
]

export const sf10RecordsMock: SF10Record[] = [
  {
    studentId: 'STU-0001',
    studentProfile: {
      lrn: '123456789012',
      address: {
        line1: 'Purok 2',
        barangay: 'Bulanao',
        cityMunicipality: 'Tabuk',
        province: 'Kalinga',
        country: 'Philippines',
      },
      guardian: {
        name: 'Elena Santos',
        relationship: 'Mother',
        contactNumber: '+63 9xx xxx xxxx',
      },
    },
    schoolInfo: {
      schoolName: 'Papaya Academy, Inc.',
      schoolId: '000000',
      division: 'Kalinga',
      region: 'CAR',
      schoolYearFrom: '2024-2025',
      schoolYearTo: '2024-2025',
    },
    gradeRecords: [
      {
        schoolYear: '2023-2024',
        gradeLevel: 'Grade 5',
        section: 'Rosal',
        adviser: 'TBA',
        subjects: [
          { subjectName: 'English', finalGrade: 88, remarks: 'Passed' },
          { subjectName: 'Mathematics', finalGrade: 90, remarks: 'Passed' },
          { subjectName: 'Science', finalGrade: 87, remarks: 'Passed' },
          { subjectName: 'Filipino', finalGrade: 89, remarks: 'Passed' },
        ],
        generalAverage: 89,
        promotionStatus: 'Promoted',
        attendance: { schoolYear: '2023-2024', gradeLevel: 'Grade 5', daysPresent: 185, daysAbsent: 5, totalDays: 190 },
      },
    ],
    remarks: 'Mock record for UI scaffolding.',
    updatedAtIso: '2026-02-01T09:00:00.000Z',
  },
  {
    studentId: 'STU-0002',
    studentProfile: {
      lrn: '234567890123',
      address: {
        line1: 'Sitio Example',
        cityMunicipality: 'Tabuk',
        province: 'Kalinga',
        country: 'Philippines',
      },
      father: { name: 'Pedro Dela Cruz', relationship: 'Father' },
      mother: { name: 'Juana Dela Cruz', relationship: 'Mother' },
    },
    schoolInfo: {
      schoolName: 'Papaya Academy, Inc.',
      schoolId: '000000',
      division: 'Kalinga',
      region: 'CAR',
      schoolYearFrom: '2024-2025',
      schoolYearTo: '2024-2025',
    },
    gradeRecords: [
      {
        schoolYear: '2022-2023',
        gradeLevel: 'Grade 9',
        section: 'Molave',
        adviser: 'TBA',
        subjects: [
          { subjectName: 'English', finalGrade: 85, remarks: 'Passed' },
          { subjectName: 'Mathematics', finalGrade: 84, remarks: 'Passed' },
          { subjectName: 'Science', finalGrade: 86, remarks: 'Passed' },
          { subjectName: 'Araling Panlipunan', finalGrade: 88, remarks: 'Passed' },
        ],
        generalAverage: 86,
        promotionStatus: 'Promoted',
      },
    ],
    remarks: 'Mock record for UI scaffolding.',
    updatedAtIso: '2026-02-01T09:00:00.000Z',
  },
  {
    studentId: 'STU-0003',
    studentProfile: {
      lrn: '345678901234',
    },
    schoolInfo: {
      schoolName: 'Papaya Academy, Inc.',
      schoolId: '000000',
      division: 'Kalinga',
      region: 'CAR',
      schoolYearFrom: '2024-2025',
      schoolYearTo: '2024-2025',
    },
    gradeRecords: [
      {
        schoolYear: '2024-2025',
        gradeLevel: 'Grade 12',
        section: 'Narra',
        adviser: 'TBA',
        subjects: [
          { subjectName: 'Practical Research', finalGrade: 92, remarks: 'Passed' },
          { subjectName: 'English for Academic Purposes', finalGrade: 90, remarks: 'Passed' },
          { subjectName: 'Mathematics', finalGrade: 89, remarks: 'Passed' },
        ],
        generalAverage: 90,
        promotionStatus: 'Completed',
      },
    ],
    updatedAtIso: '2026-02-01T09:00:00.000Z',
  },
]
