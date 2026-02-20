import React, { useMemo, useState } from 'react'
import { uiText } from '../../../core/constants/uiText'
import { includesQuery } from '../../sf10/utils/sf10FeatureUtils'

export default function AlumniSection({ alumni }) {
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('')

  const years = useMemo(() => {
    const set = new Set(alumni.map((a) => a.batchYear))
    return Array.from(set).sort((a, b) => b - a)
  }, [alumni])

  const filtered = useMemo(() => {
    return alumni.filter((a) => {
      if (year && String(a.batchYear) !== String(year)) return false
      if (!includesQuery(a.name, query)) return false
      return true
    })
  }, [alumni, query, year])

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={uiText.alumni.searchPlaceholder}
          className="flex-1 min-w-[240px] rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">{uiText.alumni.filterYearLabel}</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
          >
            <option value="">{uiText.alumni.allYears}</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white text-left text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 font-medium whitespace-nowrap">S.No</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Full Name</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">College ID</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Batch</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Email</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Registration Date</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    {uiText.alumni.noResults}
                  </td>
                </tr>
              )}

              {filtered.map((a, idx) => (
                <tr key={a.id} className="bg-white">
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{idx + 1}</td>
                  <td className="py-3 px-4 text-slate-900 whitespace-nowrap">{a.name}</td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{a.id}</td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{a.batchYear}</td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">-</td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">-</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
                        onClick={() => {}}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
                        onClick={() => {}}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                        onClick={() => {}}
                      >
                        Posted Jobs
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
