import React from 'react'
import { websiteContentMock } from '../../models/websiteContentMock'

export default function MissionVisionPage() {
  const { missionVision } = websiteContentMock.aboutUs

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mission & Vision</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">{missionVision.mission}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">Our Vision</h2>
          <p className="text-gray-700 leading-relaxed">{missionVision.vision}</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-purple-600 mb-6">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {missionVision.values.map((value, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
