import React, { useState, useEffect } from 'react'
import { missionVisionService } from '../../../core/services/missionVisionService'

export default function MissionVisionPage() {
  const [content, setContent] = useState({
    mission: { title: 'Our Mission', content: '' },
    vision: { title: 'Our Vision', content: '' },
    values: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await missionVisionService.getContent()
        setContent(data)
      } catch (error) {
        console.error('Failed to load mission & vision:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadContent()
  }, [])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-gray-500">Loading mission & vision...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mission & Vision</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">{content.mission.title}</h2>
          <p className="text-gray-700 leading-relaxed">{content.mission.content}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">{content.vision.title}</h2>
          <p className="text-gray-700 leading-relaxed">{content.vision.content}</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-purple-600 mb-6">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.values.map((value, index) => (
            <div key={value.id || index} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div>
                <div className="text-gray-700 font-medium">{value.title}</div>
                {value.description && (
                  <div className="text-gray-600 text-sm mt-1">{value.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
