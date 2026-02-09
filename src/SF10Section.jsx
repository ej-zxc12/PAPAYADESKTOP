import React, { useMemo, useState } from 'react'
import { FiFileText, FiDownload, FiPrinter, FiEdit2, FiTrash2, FiPlus, FiArrowLeft } from 'react-icons/fi'
import { uiText } from './content/uiText'
import { formatPersonName, includesQuery } from './sf10Utils'

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

  const filtered = useMemo(() => {
    return students.filter((s) => includesQuery(buildStudentSearchKey(s), query))
  }, [students, query])

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={uiText.sf10.searchPlaceholder}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
            />
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-2xl bg-[#1B3E2A] text-white text-sm font-medium px-4 py-2.5 hover:bg-[#23513A]"
          onClick={onAddStudent}
          type="button"
        >
          <FiPlus className="h-4 w-4" />
          <span>{uiText.sf10.actions.addStudent}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2 pr-3 font-medium">{uiText.sf10.table.id}</th>
              <th className="py-2 pr-3 font-medium">{uiText.sf10.table.name}</th>
              <th className="py-2 pr-3 font-medium">{uiText.sf10.table.gradeLevel}</th>
              <th className="py-2 pr-3 font-medium">{uiText.sf10.table.section}</th>
              <th className="py-2 pr-3 font-medium">{uiText.sf10.table.status}</th>
              <th className="py-2 pr-3 font-medium">{uiText.sf10.table.sf10}</th>
              <th className="py-2 pr-3 font-medium">{uiText.sf10.table.controls}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  {uiText.sf10.table.noResults}
                </td>
              </tr>
            )}

            {filtered.map((student) => {
              const hasSf10 = Boolean(sf10ByStudentId[String(student.id)])
              return (
                <tr key={student.id} className="border-t border-slate-100">
                  <td className="py-3 pr-3 font-medium text-slate-900 whitespace-nowrap">{student.id}</td>
                  <td className="py-3 pr-3 text-slate-900">{formatPersonName(student)}</td>
                  <td className="py-3 pr-3 text-slate-700">{student.currentGradeLevel || ''}</td>
                  <td className="py-3 pr-3 text-slate-700">{student.currentSection || ''}</td>
                  <td className="py-3 pr-3">
                    <span className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
                      {student.status || ''}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <span className={`inline-flex items-center gap-2 text-xs ${hasSf10 ? 'text-emerald-700' : 'text-slate-400'}`}>
                      <FiFileText className="h-4 w-4" />
                      <span>{hasSf10 ? uiText.sf10.table.hasRecord : ''}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-3 py-2 text-xs hover:bg-slate-800"
                        onClick={() => onViewSf10(student.id)}
                      >
                        <FiFileText className="h-4 w-4" />
                        <span>{uiText.sf10.actions.view}</span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                          const record = sf10ByStudentId[String(student.id)]
                          if (!record) {
                            window.alert(uiText.sf10.placeholders.download)
                            return
                          }
                          downloadMockPdf({ filename: `${student.id}-SF10.pdf`, payload: record })
                        }}
                      >
                        <FiDownload className="h-4 w-4" />
                        <span>{uiText.sf10.actions.download}</span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                          onViewSf10(student.id)
                          setTimeout(() => window.print(), 50)
                        }}
                      >
                        <FiPrinter className="h-4 w-4" />
                        <span>{uiText.sf10.actions.print}</span>
                      </button>

                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        onClick={() => onEditSf10(student.id)}
                      >
                        <FiEdit2 className="h-4 w-4" />
                        <span>{uiText.sf10.actions.editSf10}</span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-rose-200 px-3 py-2 text-xs text-rose-700 hover:bg-rose-50"
                        onClick={() => onRemoveStudent(student.id)}
                      >
                        <FiTrash2 className="h-4 w-4" />
                        <span>{uiText.sf10.actions.removeStudent}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SF10View({ student, record, onBack }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          onClick={onBack}
        >
          <FiArrowLeft className="h-4 w-4" />
          <span>{uiText.sf10.actions.backToList}</span>
        </button>
      </div>

      <div className="border border-slate-200 rounded-2xl p-6 print:border-0 print:p-0">
        <div className="text-center mb-6">
          <div className="text-lg font-semibold text-slate-900">{uiText.sf10.sf10View.header}</div>
          <div className="text-xs text-slate-500">{student ? formatPersonName(student) : ''}</div>
          <div className="text-xs text-slate-500">{student?.id || ''}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="text-xs font-semibold text-slate-700 mb-2">{uiText.sf10.sf10View.profile}</div>
            <div className="text-sm text-slate-700">LRN: {record?.studentProfile?.lrn || ''}</div>
            <div className="text-sm text-slate-700">{student?.currentGradeLevel || ''}</div>
            <div className="text-sm text-slate-700">{student?.currentSection || ''}</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="text-xs font-semibold text-slate-700 mb-2">{uiText.sf10.sf10View.schoolInfo}</div>
            <div className="text-sm text-slate-700">{record?.schoolInfo?.schoolName || ''}</div>
            <div className="text-sm text-slate-700">{record?.schoolInfo?.division || ''}</div>
            <div className="text-sm text-slate-700">{record?.schoolInfo?.region || ''}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 p-4">
          <div className="text-xs font-semibold text-slate-700 mb-3">{uiText.sf10.sf10View.gradeRecords}</div>
          <div className="space-y-4">
            {(record?.gradeRecords || []).map((gr) => (
              <div key={`${gr.schoolYear}-${gr.gradeLevel}`} className="rounded-2xl bg-slate-50/50 border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="text-sm font-semibold text-slate-900">
                    {gr.gradeLevel} • {gr.schoolYear}
                  </div>
                  <div className="text-xs text-slate-500">{gr.section || ''}</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500">
                        <th className="py-1 pr-3 font-medium">{uiText.sf10.sf10View.subject}</th>
                        <th className="py-1 pr-3 font-medium">{uiText.sf10.sf10View.final}</th>
                        <th className="py-1 pr-3 font-medium">{uiText.sf10.sf10View.subjectRemarks}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gr.subjects.map((s) => (
                        <tr key={s.subjectName} className="border-t border-slate-100">
                          <td className="py-2 pr-3 text-slate-800">{s.subjectName}</td>
                          <td className="py-2 pr-3 text-slate-800">{typeof s.finalGrade === 'number' ? s.finalGrade : ''}</td>
                          <td className="py-2 pr-3 text-slate-600">{s.remarks || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 text-xs text-slate-600">
                  <div>
                    {uiText.sf10.sf10View.generalAverage}: {typeof gr.generalAverage === 'number' ? gr.generalAverage : ''}
                  </div>
                  <div>{gr.promotionStatus || ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
          <div className="text-xs font-semibold text-slate-700 mb-2">{uiText.sf10.sf10View.remarks}</div>
          <div className="text-sm text-slate-700">{record?.remarks || ''}</div>
        </div>
      </div>
    </div>
  )
}
