import React, { useEffect, useMemo, useState } from 'react'
import { websiteContentMock } from '../../models/websiteContentMock'
import { orgChartService } from '../../../../../core/services/orgChartService'

export default function OrganizationalChartPage() {
  const { organizationalChart } = websiteContentMock.aboutUs
  const [meta, setMeta] = useState({ title: '', description: '' })
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError('')

      try {
        const [loadedMeta, loadedMembers] = await Promise.all([
          orgChartService.getMeta(),
          orgChartService.getMembers(),
        ])

        if (cancelled) return

        setMeta(loadedMeta || { title: '', description: '' })
        setMembers(Array.isArray(loadedMembers) ? loadedMembers : [])
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Unable to load organizational chart.')
          setMeta({ title: '', description: '' })
          setMembers([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const pageTitle = meta?.title || organizationalChart.title
  const pageDescription = meta?.description || organizationalChart.description

  const structure = useMemo(() => {
    if (Array.isArray(members) && members.length > 0) return members
    return Array.isArray(organizationalChart.structure) ? organizationalChart.structure : []
  }, [members, organizationalChart.structure])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{pageTitle}</h1>
      <p className="text-gray-600 mb-8">{pageDescription}</p>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-xl font-semibold">Leadership Team</h2>
        </div>
        
        <div className="p-6">
          {loading && (
            <div className="text-sm text-gray-500">Loading organizational chart…</div>
          )}

          {!loading && error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}

          <div className="space-y-6">
            {structure.map((person, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
                    <p className="text-gray-600">{person.position}</p>
                    {person.department && (
                      <span className="inline-block mt-1 text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {person.department}
                      </span>
                    )}
                  </div>
                  {person.reportsTo && (
                    <div className="text-right">
                      <span className="text-sm text-gray-500">Reports to:</span>
                      <p className="text-sm font-medium text-gray-700">{person.reportsTo}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
