import React from 'react'
import { websiteContentMock } from '../../models/websiteContentMock'

export default function OurStoryPage() {
  const { ourStory } = websiteContentMock.aboutUs

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{ourStory.title}</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <p className="text-gray-700 mb-4">{ourStory.content}</p>
        <p className="text-sm text-gray-600">Founded in {ourStory.foundingYear}</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Our Milestones</h2>
        {ourStory.milestones.map((milestone, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                <p className="text-gray-600 mt-1">{milestone.description}</p>
              </div>
              <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                {milestone.year}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
