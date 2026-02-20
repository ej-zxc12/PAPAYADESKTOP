import React from 'react'
import { websiteContentMock } from '../../models/websiteContentMock'

export default function OrganizationalChartPage() {
  const { organizationalChart } = websiteContentMock.aboutUs

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{organizationalChart.title}</h1>
      <p className="text-gray-600 mb-8">{organizationalChart.description}</p>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-xl font-semibold">Leadership Team</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {organizationalChart.structure.map((person, index) => (
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
