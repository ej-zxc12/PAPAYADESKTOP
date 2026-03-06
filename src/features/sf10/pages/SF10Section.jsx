import React, { useMemo, useState } from 'react'
import { 
  FiFileText, 
  FiDownload, 
  FiPrinter, 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiArrowLeft, 
  FiSearch, 
  FiFilter, 
  FiMoreVertical,
  FiEye,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown
} from 'react-icons/fi'
import { uiText } from '../../../core/constants/uiText'
import { formatPersonName, includesQuery } from '../utils/sf10FeatureUtils'
import sf10FormPng from '../../../shared/assets/sf10.png'

function downloadMockPdf({ filename, payload }) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function buildStudentSearchKey(student) {
  return [student.id, student.lrn, student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(' ')
}

export default function SF10Section({ students, sf10ByStudentId, onViewSf10, onRemoveStudent, onAddStudent, onEditSf10 }) {
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7

  // Filters state
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterGrade, setFilterGrade] = useState('All')

  // Edit Student Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    currentGradeLevel: '',
    currentSection: '',
    status: 'Active'
  })

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesQuery = includesQuery(buildStudentSearchKey(s), query)
      const matchesStatus = filterStatus === 'All' || s.status === filterStatus
      const matchesGrade = filterGrade === 'All' || s.currentGradeLevel === filterGrade
      return matchesQuery && matchesStatus && matchesGrade
    })
  }, [students, query, filterStatus, filterGrade])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleExportCSV = () => {
    const headers = ['Student ID', 'First Name', 'Middle Name', 'Last Name', 'Grade Level', 'Section', 'Status']
    const csvContent = [
      headers.join(','),
      ...students.map(s => [
        `STU-${String(s.id).padStart(4, '0')}`,
        s.firstName,
        s.middleName || '',
        s.lastName,
        s.currentGradeLevel || '',
        s.currentSection || '',
        s.status || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'student_directory.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleEditClick = (student) => {
    setEditingStudent(student)
    setNewStudent({
      firstName: student.firstName || '',
      middleName: student.middleName || '',
      lastName: student.lastName || '',
      currentGradeLevel: student.currentGradeLevel || '',
      currentSection: student.currentSection || '',
      status: student.status || 'Active'
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    if (!newStudent.firstName || !newStudent.lastName) {
      alert('First Name and Last Name are required.')
      return
    }
    onEditSf10(editingStudent.id, newStudent)
    setShowEditModal(false)
    setEditingStudent(null)
  }

  const handlePrint = (studentId) => {
    onViewSf10(studentId)
    setTimeout(() => window.print(), 500)
  }

  const handleDownload = (studentId) => {
    const record = sf10ByStudentId[String(studentId)]
    if (!record) {
      alert('No record found for this student.')
      return
    }
    downloadMockPdf({ filename: `STU-${String(studentId).padStart(4, '0')}-SF10.pdf`, payload: record })
  }

  const handleAddSubmit = (e) => {
    e.preventDefault()
    if (!newStudent.firstName || !newStudent.lastName) {
      alert('First Name and Last Name are required.')
      return
    }
    // Call the parent's onAddStudent with the new student data
    onAddStudent(newStudent)
    // Reset form and close modal
    setNewStudent({
      firstName: '',
      middleName: '',
      lastName: '',
      currentGradeLevel: '',
      currentSection: '',
      status: 'Active'
    })
    setShowAddModal(false)
  }

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-[#F0F8F1] text-[#4A8058] border-[#D6EDD9]'
      case 'alumni':
        return 'bg-[#FFFAE8] text-[#B8920A] border-[#FEF3C0]'
      case 'transferred':
        return 'bg-[#FEF3C0] text-[#B8920A] border-[#F7D84A]'
      case 'inactive':
        return 'bg-[#FAFAFA] text-[#9CA89F] border-[#E8EAE8]'
      default:
        return 'bg-[#FAFAFA] text-[#9CA89F] border-[#E8EAE8]'
    }
  }

  const getFileStatus = (studentId) => {
    const record = sf10ByStudentId[String(studentId)]
    if (!record) return { label: 'Missing Docs', icon: <FiXCircle />, color: 'text-[#D97070]' }
    // Simple mock logic for demonstration
    if (record.isComplete === false) return { label: 'Incomplete', icon: <FiAlertCircle />, color: 'text-[#F0C000]' }
    return { label: 'OK', icon: <FiCheckCircle />, color: 'text-[#7EB88A]' }
  }

  return (
    <div className="bg-[#F5F6F5] min-h-screen p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Top Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA89F]">
                <FiSearch className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search by student name, ID, or section..."
                className="w-full rounded-xl border border-[#E8EAE8] bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:border-transparent shadow-sm transition-all"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E8EAE8] bg-white px-4 py-2.5 text-sm font-medium text-[#5C6560] hover:bg-[#FAFAFA] shadow-sm transition-all"
              >
                <FiFilter className="h-4 w-4" />
                <span>Filters</span>
                <FiChevronDown className={`h-4 w-4 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E8EAE8] z-[110] p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['All', 'Active', 'Alumni', 'Transferred', 'Inactive'].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setFilterStatus(status)
                            setCurrentPage(1)
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            filterStatus === status
                              ? 'bg-[#F0C000] text-white'
                              : 'bg-[#FAFAFA] text-[#5C6560] hover:bg-[#E8EAE8]'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Grade Level</label>
                    <select
                      value={filterGrade}
                      onChange={(e) => {
                        setFilterGrade(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="w-full rounded-lg border border-[#E8EAE8] bg-[#FAFAFA] px-3 py-2 text-xs font-semibold text-[#5C6560] outline-none focus:ring-2 focus:ring-[#F0C000]"
                    >
                      <option value="All">All Grades</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 border-t border-[#E8EAE8]">
                    <button
                      onClick={() => {
                        setFilterStatus('All')
                        setFilterGrade('All')
                        setQuery('')
                        setShowFilterMenu(false)
                      }}
                      className="w-full py-2 text-xs font-bold text-[#D97070] hover:bg-[#D97070]/10 rounded-lg transition-all"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F0C000] text-white text-sm font-semibold px-6 py-2.5 hover:bg-[#B8920A] shadow-md shadow-[#F0C000]/10 transition-all active:scale-95"
          >
            <FiPlus className="h-4 w-4" />
            <span>Add Student Record</span>
          </button>
        </div>

        {/* Master Directory Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8EAE8] overflow-hidden">
          <div className="p-6 border-b border-[#E8EAE8] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FAFAFA] rounded-lg flex items-center justify-center text-[#F0C000]">
                <FiFileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1A1F1B]">Master Student Directory</h2>
                <p className="text-xs text-[#5C6560]">Managing {students.length.toLocaleString()} total permanent records</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleExportCSV}
                className="text-xs font-semibold text-[#5C6560] hover:text-[#1A1F1B] transition-colors"
              >
                Export CSV
              </button>
              <div className="w-px h-4 bg-[#E8EAE8]"></div>
              <button className="text-[#9CA89F] hover:text-[#1A1F1B] transition-colors">
                <FiMoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-[#FAFAFA] text-[#5C6560] font-semibold border-b border-[#E8EAE8]">
                  <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Student ID</th>
                  <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Student Name</th>
                  <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Grade Level</th>
                  <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Section</th>
                  <th className="py-4 px-6 uppercase tracking-wider text-[11px]">Status</th>
                  <th className="py-4 px-6 uppercase tracking-wider text-[11px]">SF10 File</th>
                  <th className="py-4 px-6 uppercase tracking-wider text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAE8]">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#9CA89F] italic">
                      No matching student records found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((student) => {
                    const fileStatus = getFileStatus(student.id)
                    return (
                      <tr key={student.id} className="hover:bg-[#FAFAFA]/50 transition-colors group">
                        <td className="py-4 px-6 text-[#5C6560] font-medium">STU-{String(student.id).padStart(4, '0')}</td>
                        <td className="py-4 px-6 font-bold text-[#1A1F1B]">{formatPersonName(student)}</td>
                        <td className="py-4 px-6 text-[#5C6560]">{student.currentGradeLevel || 'N/A'}</td>
                        <td className="py-4 px-6 text-[#5C6560]">{student.currentSection || 'N/A'}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(student.status)}`}>
                            {student.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${fileStatus.color}`}>
                            {fileStatus.icon}
                            <span>{fileStatus.label}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onViewSf10(student.id)}
                              className="p-2 text-[#9CA89F] hover:text-[#1A1F1B] hover:bg-[#FAFAFA] rounded-lg transition-all active:scale-95"
                              title="View SF10"
                            >
                              <FiEye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDownload(student.id)}
                              className="p-2 text-[#9CA89F] hover:text-[#1A1F1B] hover:bg-[#FAFAFA] rounded-lg transition-all active:scale-95" 
                              title="Download"
                            >
                              <FiDownload className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handlePrint(student.id)}
                              className="p-2 text-[#9CA89F] hover:text-[#1A1F1B] hover:bg-[#FAFAFA] rounded-lg transition-all active:scale-95" 
                              title="Print"
                            >
                              <FiPrinter className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditClick(student)}
                              className="p-2 text-[#9CA89F] hover:text-[#1A1F1B] hover:bg-[#FAFAFA] rounded-lg transition-all active:scale-95" 
                              title="Edit"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => onRemoveStudent(student.id)}
                              className="p-2 text-[#9CA89F] hover:text-[#D97070] hover:bg-[#D97070]/10 rounded-lg transition-all active:scale-95" title="Delete"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-[#FAFAFA] border-t border-[#E8EAE8] flex items-center justify-between">
            <p className="text-xs text-[#5C6560]">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} student records
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E8EAE8] bg-white text-xs font-semibold text-[#5C6560] hover:bg-[#FAFAFA] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1
                      ? 'bg-[#5C6560] text-white shadow-md'
                      : 'bg-white border border-[#E8EAE8] text-[#5C6560] hover:bg-[#FAFAFA]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E8EAE8] bg-white text-xs font-semibold text-[#5C6560] hover:bg-[#FAFAFA] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Edit Student Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1F1B]/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E8EAE8]">
              <div className="px-6 py-4 border-b border-[#E8EAE8] flex items-center justify-between bg-[#FAFAFA]">
                <h3 className="text-lg font-bold text-[#1A1F1B]">Edit Student Record</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-[#9CA89F] hover:text-[#1A1F1B] rounded-full hover:bg-[#FAFAFA] transition-all"
                >
                  <FiXCircle className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C6560] uppercase">First Name</label>
                    <input
                      required
                      type="text"
                      value={newStudent.firstName}
                      onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                      className="w-full rounded-xl border border-[#E8EAE8] px-4 py-2 text-sm focus:ring-2 focus:ring-[#F0C000] focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C6560] uppercase">Last Name</label>
                    <input
                      required
                      type="text"
                      value={newStudent.lastName}
                      onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                      className="w-full rounded-xl border border-[#E8EAE8] px-4 py-2 text-sm focus:ring-2 focus:ring-[#F0C000] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5C6560] uppercase">Middle Name (Optional)</label>
                  <input
                    type="text"
                    value={newStudent.middleName}
                    onChange={(e) => setNewStudent({...newStudent, middleName: e.target.value})}
                    className="w-full rounded-xl border border-[#E8EAE8] px-4 py-2 text-sm focus:ring-2 focus:ring-[#F0C000] focus:border-transparent outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C6560] uppercase">Grade Level</label>
                    <input
                      type="text"
                      value={newStudent.currentGradeLevel}
                      onChange={(e) => setNewStudent({...newStudent, currentGradeLevel: e.target.value})}
                      placeholder="e.g. Grade 10"
                      className="w-full rounded-xl border border-[#E8EAE8] px-4 py-2 text-sm focus:ring-2 focus:ring-[#F0C000] focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C6560] uppercase">Section</label>
                    <input
                      type="text"
                      value={newStudent.currentSection}
                      onChange={(e) => setNewStudent({...newStudent, currentSection: e.target.value})}
                      placeholder="e.g. Narra"
                      className="w-full rounded-xl border border-[#E8EAE8] px-4 py-2 text-sm focus:ring-2 focus:ring-[#F0C000] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5C6560] uppercase">Status</label>
                  <select
                    value={newStudent.status}
                    onChange={(e) => setNewStudent({...newStudent, status: e.target.value})}
                    className="w-full rounded-xl border border-[#E8EAE8] px-4 py-2 text-sm focus:ring-2 focus:ring-[#F0C000] focus:border-transparent outline-none appearance-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Transferred">Transferred</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-6 py-2.5 rounded-xl border border-[#E8EAE8] text-sm font-bold text-[#5C6560] hover:bg-[#FAFAFA] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2.5 rounded-xl bg-[#F0C000] text-white text-sm font-bold hover:bg-[#B8920A] transition-all shadow-md shadow-[#F0C000]/10"
                  >
                    Update Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1F1B]/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E8EAE8]">
              <div className="px-6 py-4 border-b border-[#E8EAE8] flex items-center justify-between bg-[#FAFAFA]">
                <h3 className="text-lg font-bold text-[#1A1F1B]">Add New Student Record</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-[#9CA89F] hover:text-[#1A1F1B] rounded-full hover:bg-[#FAFAFA] transition-all"
                >
                  <FiXCircle className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C6560] uppercase">First Name</label>
                    <input
                      required
                      type="text"
                      value={newStudent.firstName}
                      onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                      className="w-full rounded-xl border border-[#E8EAE8] px-4 py-2 text-sm focus:ring-2 focus:ring-[#F0C000] focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C6560] uppercase">Last Name</label>
                    <input
                      required
                      type="text"
                      value={newStudent.lastName}
                      onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                      className="w-full rounded-xl border border-[#E8EAE8] px-4 py-2 text-sm focus:ring-2 focus:ring-[#F0C000] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5C6560] uppercase">Middle Name (Optional)</label>
                  <input
                    type="text"
                    value={newStudent.middleName}
                    onChange={(e) => setNewStudent({...newStudent, middleName: e.target.value})}
                    className="w-full rounded-xl border border-[#E8EAE8] px-4 py-2 text-sm focus:ring-2 focus:ring-[#F0C000] focus:border-transparent outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C6560] uppercase">Grade Level</label>
                    <input
                      type="text"
                      value={newStudent.currentGradeLevel}
                      onChange={(e) => setNewStudent({...newStudent, currentGradeLevel: e.target.value})}
                      placeholder="e.g. Grade 10"
                      className="w-full rounded-xl border border-[#E8EAE8] px-4 py-2 text-sm focus:ring-2 focus:ring-[#F0C000] focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C6560] uppercase">Section</label>
                    <input
                      type="text"
                      value={newStudent.currentSection}
                      onChange={(e) => setNewStudent({...newStudent, currentSection: e.target.value})}
                      placeholder="e.g. Narra"
                      className="w-full rounded-xl border border-[#E8EAE8] px-4 py-2 text-sm focus:ring-2 focus:ring-[#F0C000] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5C6560] uppercase">Status</label>
                  <select
                    value={newStudent.status}
                    onChange={(e) => setNewStudent({...newStudent, status: e.target.value})}
                    className="w-full rounded-xl border border-[#E8EAE8] px-4 py-2 text-sm focus:ring-2 focus:ring-[#F0C000] focus:border-transparent outline-none appearance-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Transferred">Transferred</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-2.5 rounded-xl border border-[#E8EAE8] text-sm font-bold text-[#5C6560] hover:bg-[#FAFAFA] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2.5 rounded-xl bg-[#F0C000] text-white text-sm font-bold hover:bg-[#B8920A] transition-all shadow-md shadow-[#F0C000]/10"
                  >
                    Save Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function SF10View({ student, record, onBack }) {
  const renderScholasticRows = ({
    prefix,
    baseLeftMm,
    baseTopMm,
    rowHeightMm,
    rowCount,
    col,
  }) => {
    const widths =
      col === 'wide'
        ? {
            areaLeft: baseLeftMm,
            q1: baseLeftMm + 44.8,
            q2: baseLeftMm + 52.5,
            q3: baseLeftMm + 60.2,
            q4: baseLeftMm + 67.9,
            final: baseLeftMm + 75.6,
            remarks: baseLeftMm + 83.8,
          }
        : {
            areaLeft: baseLeftMm,
            q1: baseLeftMm + 44.5,
            q2: baseLeftMm + 52.0,
            q3: baseLeftMm + 59.5,
            q4: baseLeftMm + 67.0,
            final: baseLeftMm + 74.6,
            remarks: baseLeftMm + 83.0,
          }

    return Array.from({ length: rowCount }).map((_, index) => {
      const top = baseTopMm + index * rowHeightMm
      const id = `${prefix}-${index}`

      return (
        <React.Fragment key={id}>
          {/* Subject name goes here */}
          <span
            id={`${prefix}-subject-${index}`}
            data-field={`${prefix}.subject.${index}`}
            className="sf10-field"
            style={{ left: `${widths.areaLeft}mm`, top: `${top}mm`, width: '43mm' }}
          />
          {/* Quarter 1 grade goes here */}
          <span
            id={`${prefix}-q1-${index}`}
            data-field={`${prefix}.q1.${index}`}
            className="sf10-field sf10-field-center"
            style={{ left: `${widths.q1}mm`, top: `${top}mm`, width: '7mm' }}
          />
          {/* Quarter 2 grade goes here */}
          <span
            id={`${prefix}-q2-${index}`}
            data-field={`${prefix}.q2.${index}`}
            className="sf10-field sf10-field-center"
            style={{ left: `${widths.q2}mm`, top: `${top}mm`, width: '7mm' }}
          />
          {/* Quarter 3 grade goes here */}
          <span
            id={`${prefix}-q3-${index}`}
            data-field={`${prefix}.q3.${index}`}
            className="sf10-field sf10-field-center"
            style={{ left: `${widths.q3}mm`, top: `${top}mm`, width: '7mm' }}
          />
          {/* Quarter 4 grade goes here */}
          <span
            id={`${prefix}-q4-${index}`}
            data-field={`${prefix}.q4.${index}`}
            className="sf10-field sf10-field-center"
            style={{ left: `${widths.q4}mm`, top: `${top}mm`, width: '7mm' }}
          />
          {/* Final rating goes here */}
          <span
            id={`${prefix}-final-${index}`}
            data-field={`${prefix}.final.${index}`}
            className="sf10-field sf10-field-center"
            style={{ left: `${widths.final}mm`, top: `${top}mm`, width: '8mm' }}
          />
          {/* Remarks go here */}
          <span
            id={`${prefix}-remarks-${index}`}
            data-field={`${prefix}.remarks.${index}`}
            className="sf10-field"
            style={{ left: `${widths.remarks}mm`, top: `${top}mm`, width: '21mm' }}
          />
        </React.Fragment>
      )
    })
  }

  const renderRemedialRows = ({ prefix, baseLeftMm, baseTopMm, rowHeightMm, count }) => {
    return Array.from({ length: count }).map((_, index) => {
      const top = baseTopMm + index * rowHeightMm
      return (
        <React.Fragment key={`${prefix}-${index}`}>
          {/* Remedial learning area goes here */}
          <span
            id={`${prefix}-area-${index}`}
            data-field={`${prefix}.area.${index}`}
            className="sf10-field"
            style={{ left: `${baseLeftMm}mm`, top: `${top}mm`, width: '35mm' }}
          />
          {/* Remedial final rating goes here */}
          <span
            id={`${prefix}-final-${index}`}
            data-field={`${prefix}.final.${index}`}
            className="sf10-field sf10-field-center"
            style={{ left: `${baseLeftMm + 35.8}mm`, top: `${top}mm`, width: '11mm' }}
          />
          {/* Remedial class mark goes here */}
          <span
            id={`${prefix}-mark-${index}`}
            data-field={`${prefix}.mark.${index}`}
            className="sf10-field sf10-field-center"
            style={{ left: `${baseLeftMm + 47.3}mm`, top: `${top}mm`, width: '11mm' }}
          />
          {/* Recomputed final grade goes here */}
          <span
            id={`${prefix}-recomputed-${index}`}
            data-field={`${prefix}.recomputed.${index}`}
            className="sf10-field sf10-field-center"
            style={{ left: `${baseLeftMm + 58.9}mm`, top: `${top}mm`, width: '11mm' }}
          />
          {/* Remedial remarks go here */}
          <span
            id={`${prefix}-remarks-${index}`}
            data-field={`${prefix}.remarks.${index}`}
            className="sf10-field"
            style={{ left: `${baseLeftMm + 70.7}mm`, top: `${top}mm`, width: '20mm' }}
          />
        </React.Fragment>
      )
    })
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4">
      <style>
        {`
          /* SF10 print template: ensure exact A4 sizing (210mm x 297mm), no margins, background prints.
             Electron print configuration should use:
             - printBackground: true
             - margins: none
             - scale: 100%
          */
          @page {
            size: A4;
            margin: 0;
          }

          @media print {
            html, body {
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 0;
            }

            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }

          .sf10-page {
            position: relative;
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background-repeat: no-repeat;
            background-position: 0 0;
            background-size: 210mm 297mm;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10pt;
            line-height: 1.1;
          }

          .sf10-page-wrap {
            width: 100%;
            display: flex;
            justify-content: center;
            overflow: auto;
          }

          .sf10-field {
            position: absolute;
            display: block;
            min-height: 4mm;
            color: #000;
            white-space: pre;
            overflow: hidden;
          }

          .sf10-field-center {
            text-align: center;
          }

          .sf10-ui {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }

          @media print {
            .sf10-ui {
              display: none;
            }
          }
        `}
      </style>

      <div className="sf10-ui">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          onClick={onBack}
        >
          <FiArrowLeft className="h-4 w-4" />
          <span>{uiText.sf10.actions.backToList}</span>
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#1B3E2A] px-4 py-2 text-sm font-medium text-white hover:bg-[#163021]"
          onClick={() => window.print()}
        >
          <FiPrinter className="h-4 w-4" />
          <span>{uiText.sf10.actions.print}</span>
        </button>
      </div>

      <div className="sf10-page-wrap">
        <div
          className="sf10-page"
          style={{ backgroundImage: `url(${sf10FormPng})` }}
          aria-label="SF10 Print Template"
        >
        {/* Student Last Name goes here */}
        <span id="sf10-student-lastName" data-field="student.lastName" className="sf10-field" style={{ left: '12mm', top: '30mm', width: '55mm' }} />
        {/* Student First Name goes here */}
        <span id="sf10-student-firstName" data-field="student.firstName" className="sf10-field" style={{ left: '72mm', top: '30mm', width: '55mm' }} />
        {/* Student Name Extn (Jr/I/II) goes here */}
        <span id="sf10-student-nameExtn" data-field="student.nameExtn" className="sf10-field" style={{ left: '130mm', top: '30mm', width: '25mm' }} />
        {/* Student Middle Name goes here */}
        <span id="sf10-student-middleName" data-field="student.middleName" className="sf10-field" style={{ left: '160mm', top: '30mm', width: '38mm' }} />

        {/* Learner Reference Number (LRN) goes here */}
        <span id="sf10-student-lrn" data-field="student.lrn" className="sf10-field" style={{ left: '12mm', top: '37mm', width: '85mm' }} />
        {/* Birthdate (mm/dd/yyyy) goes here */}
        <span id="sf10-student-birthdate" data-field="student.birthdate" className="sf10-field" style={{ left: '103mm', top: '37mm', width: '42mm' }} />
        {/* Sex goes here */}
        <span id="sf10-student-sex" data-field="student.sex" className="sf10-field sf10-field-center" style={{ left: '181mm', top: '37mm', width: '17mm' }} />

        {/* Name of School goes here */}
        <span id="sf10-school-name" data-field="school.name" className="sf10-field" style={{ left: '12mm', top: '52mm', width: '120mm' }} />
        {/* School ID goes here */}
        <span id="sf10-school-id" data-field="school.id" className="sf10-field" style={{ left: '141mm', top: '52mm', width: '57mm' }} />

        {/* Eligibility / Date of Examination/Assessment goes here */}
        <span id="sf10-eligibility-examDate" data-field="eligibility.examDate" className="sf10-field" style={{ left: '92mm', top: '62mm', width: '48mm' }} />
        {/* Eligibility / Others (Pls Specify) goes here */}
        <span id="sf10-eligibility-others" data-field="eligibility.others" className="sf10-field" style={{ left: '155mm', top: '62mm', width: '43mm' }} />
        {/* Eligibility / Remarks goes here */}
        <span id="sf10-eligibility-remarks" data-field="eligibility.remarks" className="sf10-field" style={{ left: '12mm', top: '70mm', width: '186mm' }} />

        {/* Scholastic Record (Top Left) School goes here */}
        <span id="sf10-topLeft-school" data-field="topLeft.school" className="sf10-field" style={{ left: '12mm', top: '83mm', width: '52mm' }} />
        {/* Scholastic Record (Top Left) School ID goes here */}
        <span id="sf10-topLeft-schoolId" data-field="topLeft.schoolId" className="sf10-field" style={{ left: '72mm', top: '83mm', width: '25mm' }} />
        {/* Scholastic Record (Top Left) District goes here */}
        <span id="sf10-topLeft-district" data-field="topLeft.district" className="sf10-field" style={{ left: '12mm', top: '88mm', width: '35mm' }} />
        {/* Scholastic Record (Top Left) Division goes here */}
        <span id="sf10-topLeft-division" data-field="topLeft.division" className="sf10-field" style={{ left: '50mm', top: '88mm', width: '30mm' }} />
        {/* Scholastic Record (Top Left) Region goes here */}
        <span id="sf10-topLeft-region" data-field="topLeft.region" className="sf10-field" style={{ left: '84mm', top: '88mm', width: '27mm' }} />
        {/* Scholastic Record (Top Left) Classified as Grade goes here */}
        <span id="sf10-topLeft-grade" data-field="topLeft.grade" className="sf10-field" style={{ left: '12mm', top: '93mm', width: '35mm' }} />
        {/* Scholastic Record (Top Left) Section goes here */}
        <span id="sf10-topLeft-section" data-field="topLeft.section" className="sf10-field" style={{ left: '50mm', top: '93mm', width: '30mm' }} />
        {/* Scholastic Record (Top Left) School Year goes here */}
        <span id="sf10-topLeft-schoolYear" data-field="topLeft.schoolYear" className="sf10-field" style={{ left: '84mm', top: '93mm', width: '27mm' }} />
        {/* Scholastic Record (Top Left) Adviser/Teacher goes here */}
        <span id="sf10-topLeft-teacher" data-field="topLeft.teacher" className="sf10-field" style={{ left: '12mm', top: '98mm', width: '75mm' }} />
        {/* Scholastic Record (Top Left) Signature goes here */}
        <span id="sf10-topLeft-signature" data-field="topLeft.signature" className="sf10-field" style={{ left: '90mm', top: '98mm', width: '22mm' }} />

        {/* Scholastic Record (Top Right) School goes here */}
        <span id="sf10-topRight-school" data-field="topRight.school" className="sf10-field" style={{ left: '109mm', top: '83mm', width: '52mm' }} />
        {/* Scholastic Record (Top Right) School ID goes here */}
        <span id="sf10-topRight-schoolId" data-field="topRight.schoolId" className="sf10-field" style={{ left: '169mm', top: '83mm', width: '29mm' }} />
        {/* Scholastic Record (Top Right) District goes here */}
        <span id="sf10-topRight-district" data-field="topRight.district" className="sf10-field" style={{ left: '109mm', top: '88mm', width: '35mm' }} />
        {/* Scholastic Record (Top Right) Division goes here */}
        <span id="sf10-topRight-division" data-field="topRight.division" className="sf10-field" style={{ left: '147mm', top: '88mm', width: '25mm' }} />
        {/* Scholastic Record (Top Right) Region goes here */}
        <span id="sf10-topRight-region" data-field="topRight.region" className="sf10-field" style={{ left: '174mm', top: '88mm', width: '24mm' }} />
        {/* Scholastic Record (Top Right) Classified as Grade goes here */}
        <span id="sf10-topRight-grade" data-field="topRight.grade" className="sf10-field" style={{ left: '109mm', top: '93mm', width: '35mm' }} />
        {/* Scholastic Record (Top Right) Section goes here */}
        <span id="sf10-topRight-section" data-field="topRight.section" className="sf10-field" style={{ left: '147mm', top: '93mm', width: '25mm' }} />
        {/* Scholastic Record (Top Right) School Year goes here */}
        <span id="sf10-topRight-schoolYear" data-field="topRight.schoolYear" className="sf10-field" style={{ left: '174mm', top: '93mm', width: '24mm' }} />
        {/* Scholastic Record (Top Right) Adviser/Teacher goes here */}
        <span id="sf10-topRight-teacher" data-field="topRight.teacher" className="sf10-field" style={{ left: '109mm', top: '98mm', width: '75mm' }} />
        {/* Scholastic Record (Top Right) Signature goes here */}
        <span id="sf10-topRight-signature" data-field="topRight.signature" className="sf10-field" style={{ left: '187mm', top: '98mm', width: '11mm' }} />

        {/* Scholastic Record (Top Left) learning areas + quarter grades go here */}
        {renderScholasticRows({
          prefix: 'sf10-topLeft',
          baseLeftMm: 12,
          baseTopMm: 111,
          rowHeightMm: 5.0,
          rowCount: 22,
          col: 'wide',
        })}
        {/* Scholastic Record (Top Right) learning areas + quarter grades go here */}
        {renderScholasticRows({
          prefix: 'sf10-topRight',
          baseLeftMm: 109,
          baseTopMm: 111,
          rowHeightMm: 5.0,
          rowCount: 22,
          col: 'narrow',
        })}

        {/* Scholastic Record (Top Left) General Average goes here */}
        <span id="sf10-topLeft-generalAverage" data-field="topLeft.generalAverage" className="sf10-field sf10-field-center" style={{ left: '59mm', top: '222mm', width: '20mm' }} />
        {/* Scholastic Record (Top Right) General Average goes here */}
        <span id="sf10-topRight-generalAverage" data-field="topRight.generalAverage" className="sf10-field sf10-field-center" style={{ left: '156mm', top: '222mm', width: '20mm' }} />

        {/* Remedial classes (Top Left) Conducted from goes here */}
        <span id="sf10-topLeft-remedial-from" data-field="topLeft.remedial.from" className="sf10-field" style={{ left: '46mm', top: '232mm', width: '25mm' }} />
        {/* Remedial classes (Top Left) Conducted to goes here */}
        <span id="sf10-topLeft-remedial-to" data-field="topLeft.remedial.to" className="sf10-field" style={{ left: '72mm', top: '232mm', width: '25mm' }} />
        {/* Remedial classes (Top Left) rows go here */}
        {renderRemedialRows({ prefix: 'sf10-topLeft-remedial', baseLeftMm: 12, baseTopMm: 241, rowHeightMm: 5.0, count: 2 })}

        {/* Remedial classes (Top Right) Conducted from goes here */}
        <span id="sf10-topRight-remedial-from" data-field="topRight.remedial.from" className="sf10-field" style={{ left: '143mm', top: '232mm', width: '25mm' }} />
        {/* Remedial classes (Top Right) Conducted to goes here */}
        <span id="sf10-topRight-remedial-to" data-field="topRight.remedial.to" className="sf10-field" style={{ left: '169mm', top: '232mm', width: '25mm' }} />
        {/* Remedial classes (Top Right) rows go here */}
        {renderRemedialRows({ prefix: 'sf10-topRight-remedial', baseLeftMm: 109, baseTopMm: 241, rowHeightMm: 5.0, count: 2 })}

        {/* Scholastic Record (Bottom Left) School goes here */}
        <span id="sf10-bottomLeft-school" data-field="bottomLeft.school" className="sf10-field" style={{ left: '12mm', top: '170mm', width: '52mm' }} />
        {/* Scholastic Record (Bottom Left) School ID goes here */}
        <span id="sf10-bottomLeft-schoolId" data-field="bottomLeft.schoolId" className="sf10-field" style={{ left: '72mm', top: '170mm', width: '25mm' }} />
        {/* Scholastic Record (Bottom Left) District goes here */}
        <span id="sf10-bottomLeft-district" data-field="bottomLeft.district" className="sf10-field" style={{ left: '12mm', top: '175mm', width: '35mm' }} />
        {/* Scholastic Record (Bottom Left) Division goes here */}
        <span id="sf10-bottomLeft-division" data-field="bottomLeft.division" className="sf10-field" style={{ left: '50mm', top: '175mm', width: '30mm' }} />
        {/* Scholastic Record (Bottom Left) Region goes here */}
        <span id="sf10-bottomLeft-region" data-field="bottomLeft.region" className="sf10-field" style={{ left: '84mm', top: '175mm', width: '27mm' }} />
        {/* Scholastic Record (Bottom Left) Classified as Grade goes here */}
        <span id="sf10-bottomLeft-grade" data-field="bottomLeft.grade" className="sf10-field" style={{ left: '12mm', top: '180mm', width: '35mm' }} />
        {/* Scholastic Record (Bottom Left) Section goes here */}
        <span id="sf10-bottomLeft-section" data-field="bottomLeft.section" className="sf10-field" style={{ left: '50mm', top: '180mm', width: '30mm' }} />
        {/* Scholastic Record (Bottom Left) School Year goes here */}
        <span id="sf10-bottomLeft-schoolYear" data-field="bottomLeft.schoolYear" className="sf10-field" style={{ left: '84mm', top: '180mm', width: '27mm' }} />
        {/* Scholastic Record (Bottom Left) Adviser/Teacher goes here */}
        <span id="sf10-bottomLeft-teacher" data-field="bottomLeft.teacher" className="sf10-field" style={{ left: '12mm', top: '185mm', width: '75mm' }} />
        {/* Scholastic Record (Bottom Left) Signature goes here */}
        <span id="sf10-bottomLeft-signature" data-field="bottomLeft.signature" className="sf10-field" style={{ left: '90mm', top: '185mm', width: '22mm' }} />

        {/* Scholastic Record (Bottom Right) School goes here */}
        <span id="sf10-bottomRight-school" data-field="bottomRight.school" className="sf10-field" style={{ left: '109mm', top: '170mm', width: '52mm' }} />
        {/* Scholastic Record (Bottom Right) School ID goes here */}
        <span id="sf10-bottomRight-schoolId" data-field="bottomRight.schoolId" className="sf10-field" style={{ left: '169mm', top: '170mm', width: '29mm' }} />
        {/* Scholastic Record (Bottom Right) District goes here */}
        <span id="sf10-bottomRight-district" data-field="bottomRight.district" className="sf10-field" style={{ left: '109mm', top: '175mm', width: '35mm' }} />
        {/* Scholastic Record (Bottom Right) Division goes here */}
        <span id="sf10-bottomRight-division" data-field="bottomRight.division" className="sf10-field" style={{ left: '147mm', top: '175mm', width: '25mm' }} />
        {/* Scholastic Record (Bottom Right) Region goes here */}
        <span id="sf10-bottomRight-region" data-field="bottomRight.region" className="sf10-field" style={{ left: '174mm', top: '175mm', width: '24mm' }} />
        {/* Scholastic Record (Bottom Right) Classified as Grade goes here */}
        <span id="sf10-bottomRight-grade" data-field="bottomRight.grade" className="sf10-field" style={{ left: '109mm', top: '180mm', width: '35mm' }} />
        {/* Scholastic Record (Bottom Right) Section goes here */}
        <span id="sf10-bottomRight-section" data-field="bottomRight.section" className="sf10-field" style={{ left: '147mm', top: '180mm', width: '25mm' }} />
        {/* Scholastic Record (Bottom Right) School Year goes here */}
        <span id="sf10-bottomRight-schoolYear" data-field="bottomRight.schoolYear" className="sf10-field" style={{ left: '174mm', top: '180mm', width: '24mm' }} />
        {/* Scholastic Record (Bottom Right) Adviser/Teacher goes here */}
        <span id="sf10-bottomRight-teacher" data-field="bottomRight.teacher" className="sf10-field" style={{ left: '109mm', top: '185mm', width: '75mm' }} />
        {/* Scholastic Record (Bottom Right) Signature goes here */}
        <span id="sf10-bottomRight-signature" data-field="bottomRight.signature" className="sf10-field" style={{ left: '187mm', top: '185mm', width: '11mm' }} />

        {/* Scholastic Record (Bottom Left) learning areas + quarter grades go here */}
        {renderScholasticRows({
          prefix: 'sf10-bottomLeft',
          baseLeftMm: 12,
          baseTopMm: 198,
          rowHeightMm: 4.6,
          rowCount: 18,
          col: 'wide',
        })}
        {/* Scholastic Record (Bottom Right) learning areas + quarter grades go here */}
        {renderScholasticRows({
          prefix: 'sf10-bottomRight',
          baseLeftMm: 109,
          baseTopMm: 198,
          rowHeightMm: 4.6,
          rowCount: 18,
          col: 'narrow',
        })}

        {/* Bottom left General Average goes here */}
        <span id="sf10-bottomLeft-generalAverage" data-field="bottomLeft.generalAverage" className="sf10-field sf10-field-center" style={{ left: '59mm', top: '281mm', width: '20mm' }} />
        {/* Bottom right General Average goes here */}
        <span id="sf10-bottomRight-generalAverage" data-field="bottomRight.generalAverage" className="sf10-field sf10-field-center" style={{ left: '156mm', top: '281mm', width: '20mm' }} />

        {/* Remedial classes (Bottom Left) Conducted from goes here */}
        <span id="sf10-bottomLeft-remedial-from" data-field="bottomLeft.remedial.from" className="sf10-field" style={{ left: '46mm', top: '288mm', width: '25mm' }} />
        {/* Remedial classes (Bottom Left) Conducted to goes here */}
        <span id="sf10-bottomLeft-remedial-to" data-field="bottomLeft.remedial.to" className="sf10-field" style={{ left: '72mm', top: '288mm', width: '25mm' }} />

        {/* Remedial classes (Bottom Right) Conducted from goes here */}
        <span id="sf10-bottomRight-remedial-from" data-field="bottomRight.remedial.from" className="sf10-field" style={{ left: '143mm', top: '288mm', width: '25mm' }} />
        {/* Remedial classes (Bottom Right) Conducted to goes here */}
        <span id="sf10-bottomRight-remedial-to" data-field="bottomRight.remedial.to" className="sf10-field" style={{ left: '169mm', top: '288mm', width: '25mm' }} />
        </div>
      </div>
    </div>
  )
}
