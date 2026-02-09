import React, { useMemo, useState } from 'react'
import { uiText } from './content/uiText'
import { includesQuery } from './sf10Utils'

function groupByYear(items) {
  return items.reduce((acc, item) => {
    const key = String(item.batchYear)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

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

  const grouped = useMemo(() => {
    const map = groupByYear(filtered)
    const orderedKeys = Object.keys(map).sort((a, b) => Number(b) - Number(a))
    return orderedKeys.map((k) => ({ year: k, items: map[k] }))
  }, [filtered])

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={uiText.alumni.searchPlaceholder}
          className="flex-1 min-w-[260px] rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
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

      {grouped.length === 0 && <div className="py-6 text-center text-slate-500">{uiText.alumni.noResults}</div>}

      <div className="space-y-4">
        {grouped.map((group) => (
          <div key={group.year} className="rounded-3xl border border-slate-100 bg-slate-50/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-base font-semibold text-slate-900">{group.year}</div>
              <div className="text-xs text-slate-500">{group.items.length}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {group.items.map((a) => (
                <div key={a.id} className="rounded-2xl bg-white border border-slate-100 p-4">
                  <div className="text-sm font-semibold text-slate-900">{a.name}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {uiText.alumni.fields.programOrGrade}: {a.programOrGrade}
                  </div>
                  {a.notes && (
                    <div className="text-xs text-slate-600 mt-2">
                      {uiText.alumni.fields.notes}: {a.notes}
                    </div>
                  )}
                  {Array.isArray(a.achievements) && a.achievements.length > 0 && (
                    <div className="text-xs text-slate-600 mt-2">
                      {uiText.alumni.fields.achievements}: {a.achievements.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
