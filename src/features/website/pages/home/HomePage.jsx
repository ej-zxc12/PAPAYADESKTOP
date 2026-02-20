import React from 'react'
import { websiteContentMock } from '../models/websiteContentMock'

export default function HomePage() {
  const { home } = websiteContentMock

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{home.hero.title}</h1>
        <p className="text-lg text-gray-600">{home.hero.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {home.highlights.map((highlight, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{highlight.title}</h3>
            <p className="text-gray-600">{highlight.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
