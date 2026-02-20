import React from 'react'
import { websiteContentMock } from '../../models/websiteContentMock'

export default function PartnersSponsorsPage() {
  const { partnersSponsors } = websiteContentMock.aboutUs

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{partnersSponsors.title}</h1>
      <p className="text-gray-600 mb-8">{partnersSponsors.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partnersSponsors.partners.map((partner, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                partner.type === 'cash' ? 'bg-green-100 text-green-800' :
                partner.type === 'sponsorship' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {partner.type}
              </span>
            </div>
            {partner.description && (
              <p className="text-gray-600 text-sm">{partner.description}</p>
            )}
            {partner.website && (
              <a 
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                Visit Website →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
