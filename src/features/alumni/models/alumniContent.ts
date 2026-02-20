import type { Alumni } from '../types/Alumni'

export const alumniMock: Alumni[] = [
  {
    id: 'AL-2023-0001',
    name: 'Ana Reyes',
    batchYear: 2025,
    programOrGrade: 'Grade 12 (SHS)',
    notes: 'Mock data for alumni listing.',
    achievements: ['With Honors'],
  },
  {
    id: 'AL-2024-0001',
    name: 'Juan Dela Cruz',
    batchYear: 2024,
    programOrGrade: 'Grade 10',
    achievements: ['Community service award'],
  },
  {
    id: 'AL-2024-0002',
    name: 'Maria Santos',
    batchYear: 2024,
    programOrGrade: 'Grade 6',
  },
  {
    id: 'AL-2022-0001',
    name: 'John Smith',
    batchYear: 2022,
    programOrGrade: 'Grade 12 (SHS)',
    notes: 'Now working abroad.',
  },
]
