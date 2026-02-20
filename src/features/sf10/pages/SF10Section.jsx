import React, { useMemo, useState } from 'react'
import { FiFileText, FiDownload, FiPrinter, FiEdit2, FiTrash2, FiPlus, FiArrowLeft } from 'react-icons/fi'
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

      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white text-left text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 font-medium whitespace-nowrap">{uiText.sf10.table.id}</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">{uiText.sf10.table.name}</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">{uiText.sf10.table.gradeLevel}</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">{uiText.sf10.table.section}</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">{uiText.sf10.table.status}</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">{uiText.sf10.table.sf10}</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">{uiText.sf10.table.controls}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 px-4 text-center text-slate-500">
                  {uiText.sf10.table.noResults}
                </td>
              </tr>
            )}

            {filtered.map((student) => {
              const hasSf10 = Boolean(sf10ByStudentId[String(student.id)])
              return (
                <tr key={student.id} className="bg-white">
                  <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">{student.id}</td>
                  <td className="py-3 px-4 text-slate-900 whitespace-nowrap">{formatPersonName(student)}</td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">{student.currentGradeLevel || ''}</td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">{student.currentSection || ''}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
                      {student.status || ''}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-2 text-xs ${hasSf10 ? 'text-emerald-700' : 'text-slate-400'}`}>
                      <FiFileText className="h-4 w-4" />
                      <span>{hasSf10 ? uiText.sf10.table.hasRecord : ''}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
                        onClick={() => onViewSf10(student.id)}
                      >
                        <span>{uiText.sf10.actions.view}</span>
                      </button>
                      <button
                        type="button"
                        className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
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
                        className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                        onClick={() => {
                          onViewSf10(student.id)
                          setTimeout(() => window.print(), 50)
                        }}
                      >
                        <span>{uiText.sf10.actions.print}</span>
                      </button>

                      <button
                        type="button"
                        className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                        onClick={() => onEditSf10(student.id)}
                      >
                        <span>{uiText.sf10.actions.editSf10}</span>
                      </button>
                      <button
                        type="button"
                        className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
                        onClick={() => onRemoveStudent(student.id)}
                      >
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
