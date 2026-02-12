import React, { useMemo, useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { uiText } from './content/uiText'

function groupByYear(items) {
  return items.reduce((acc, item) => {
    const key = String(item.batchyear || 'Unknown')
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

export default function AlumniSection({ alumni: propAlumni }) {
  const [alumni, setAlumni] = useState(propAlumni || [])
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  
  // Form state - matches the table structure
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    batchYear: new Date().getFullYear(),
    programOrGrade: '',
    notes: '',
    achievements: '',
    profileImage: ''
  })

  // Load alumni from Supabase
  useEffect(() => {
    async function loadAlumni() {
      try {
        const { data, error } = await supabase
          .from('alumni')
          .select('*')
          .order('batchyear', { ascending: false })
        
        if (error) {
          console.error('Error loading alumni:', error)
          return
        }
        
        console.log('Loaded alumni:', data)
        setAlumni(data || [])
      } catch (err) {
        console.error('Alumni loading error:', err)
      }
    }

    loadAlumni()

    // Set up real-time subscription
    const subscription = supabase
      .channel('alumni_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'alumni' },
        (payload) => {
          console.log('Alumni change:', payload)
          loadAlumni() // Refresh alumni list
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const years = useMemo(() => {
    const set = new Set(alumni.map((a) => a.batchyear).filter(Boolean))
    return Array.from(set).sort((a, b) => Number(b) - Number(a))
  }, [alumni])

  const filtered = useMemo(() => {
    return alumni.filter((a) => {
      if (year && String(a.batchyear) !== String(year)) return false
      
      // Custom search function
      const fullName = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase()
      const program = a.programorgrade?.toLowerCase() || ''
      const notes = a.notes?.toLowerCase() || ''
      const searchQuery = query.toLowerCase()
      
      return fullName.includes(searchQuery) || 
             program.includes(searchQuery) ||
             notes.includes(searchQuery)
    })
  }, [alumni, query, year])

  const grouped = useMemo(() => {
    const map = groupByYear(filtered)
    const orderedKeys = Object.keys(map).sort((a, b) => Number(b) - Number(a))
    return orderedKeys.map((k) => ({ year: k, items: map[k] }))
  }, [filtered])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // ============== IMAGE UPLOAD FUNCTION ==============
  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0]
      if (!file) return

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }

      // Check file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file')
        return
      }

      setUploading(true)
      setError('')

      // Create a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `alumni-profiles/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('alumni-images') // Make sure this bucket exists in Supabase Storage
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError(`Failed to upload image: ${uploadError.message}`)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('alumni-images')
        .getPublicUrl(filePath)

      setImageUrl(publicUrl)
      setImagePreview(publicUrl)
      setFormData(prev => ({ ...prev, profileImage: publicUrl }))

    } catch (err) {
      console.error('Image upload error:', err)
      setError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setImageUrl('')
    setImagePreview('')
    setFormData(prev => ({ ...prev, profileImage: '' }))
  }

  // ============== ADD FUNCTION ==============
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.firstName.trim()) {
      setError('First name is required.')
      return
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Prepare data for insertion - matches table column names exactly
      const alumniData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        batchyear: formData.batchYear ? parseInt(formData.batchYear) : null,
        programorgrade: formData.programOrGrade.trim() || null,
        notes: formData.notes.trim() || null,
        profile_image: formData.profileImage || null,
      }

      // Handle achievements - convert string to array if needed
      if (formData.achievements.trim()) {
        alumniData.achievements = formData.achievements
          .split(',')
          .map(ach => ach.trim())
          .filter(ach => ach.length > 0)
      }

      console.log('Attempting to insert alumni data:', alumniData)

      // Try insert without .single() first
      const { data, error } = await supabase
        .from('alumni')
        .insert([alumniData])  // Wrap in array
        .select()

      console.log('Insert response:', { data, error })

      if (error) {
        console.error('Supabase error details:', error)
        
        // Provide more specific error messages
        if (error.code === '42501') {
          setError('Permission denied. Check Row Level Security (RLS) policies in Supabase.')
        } else if (error.code === '23502') {
          setError('Missing required fields. Check if all required columns exist.')
        } else if (error.code === '42703') {
          setError('Column does not exist. Check database schema.')
        } else {
          setError(`Failed to add alumni: ${error.message}`)
        }
        return
      }

      // Success - reset form and hide it
      setFormData({
        firstName: '',
        lastName: '',
        batchYear: new Date().getFullYear(),
        programOrGrade: '',
        notes: '',
        achievements: '',
        profileImage: ''
      })
      setImageUrl('')
      setImagePreview('')
      setShowAddForm(false)
      
      // Add the new alumni to the state immediately
      if (data && data.length > 0) {
        console.log('Successfully added alumni:', data[0])
        setAlumni(prev => [data[0], ...prev])
      } else {
        // If no data returned, refresh the list
        const { data: refreshedData } = await supabase
          .from('alumni')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
        
        if (refreshedData && refreshedData.length > 0) {
          setAlumni(prev => [refreshedData[0], ...prev])
        }
      }

      // Clear any errors
      setError('')

    } catch (err) {
      console.error('Alumni creation error:', err)
      setError(`Unexpected error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }
  // ============== END ADD FUNCTION ==============

  // Delete function
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this alumni?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('alumni')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting alumni:', error)
        alert('Failed to delete alumni.')
        return
      }

      // Remove from local state
      setAlumni(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete alumni.')
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={uiText.alumni?.searchPlaceholder || "Search alumni..."}
            className="flex-1 min-w-[260px] rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">{uiText.alumni?.filterYearLabel || "Filter by year"}</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
            >
              <option value="">{uiText.alumni?.allYears || "All years"}</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-2xl border border-[#1B3E2A] bg-[#1B3E2A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#163021]"
        >
          {showAddForm ? 'Cancel' : 'Add Alumni'}
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-3xl border border-slate-100 bg-slate-50/40 p-4">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Add New Alumni</h3>
          
          {error && (
            <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-3 py-2 mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload Section */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Profile Photo</label>
              <div className="flex items-start gap-4">
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-24 h-24 rounded-2xl object-cover border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-rose-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={uploading}
                    />
                    <label 
                      htmlFor="image-upload" 
                      className={`block rounded-2xl border border-slate-200 px-4 py-3 text-sm cursor-pointer hover:bg-slate-50 ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {uploading ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span>{imagePreview ? 'Change photo' : 'Upload photo'}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        JPG, PNG or GIF (max 5MB)
                      </div>
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="text-xs text-emerald-600 mt-2">
                      ✓ Photo uploaded successfully
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                  placeholder="Enter first name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Batch Year</label>
                <input
                  type="number"
                  name="batchYear"
                  value={formData.batchYear}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                  min="1990"
                  max="2030"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Program/Grade</label>
                <input
                  type="text"
                  name="programOrGrade"
                  value={formData.programOrGrade}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                  placeholder="e.g., Bachelor of Science in Computer Science"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Achievements (comma-separated)</label>
              <input
                type="text"
                name="achievements"
                value={formData.achievements}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                placeholder="e.g., Dean's List, Best Thesis Award, Valedictorian"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                placeholder="Additional notes about the alumni"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoading || uploading}
                className="rounded-2xl border border-[#1B3E2A] bg-[#1B3E2A] px-4 py-2 text-sm font-medium text-white hover:bg-[#163021] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Alumni'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setError('')
                  setImageUrl('')
                  setImagePreview('')
                  setFormData({
                    firstName: '',
                    lastName: '',
                    batchYear: new Date().getFullYear(),
                    programOrGrade: '',
                    notes: '',
                    achievements: '',
                    profileImage: ''
                  })
                }}
                disabled={isLoading || uploading}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-8 text-center text-slate-500">
          {alumni.length === 0 ? 'No alumni records yet. Click "Add Alumni" to create your first record!' : 'No alumni match your search criteria.'}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.year} className="rounded-3xl border border-slate-100 bg-slate-50/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-base font-semibold text-slate-900">Batch {group.year}</div>
                <div className="text-xs text-slate-500">{group.items.length} alumni</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.items.map((a) => (
                  <div key={a.id} className="rounded-2xl bg-white border border-slate-100 p-4 hover:shadow-sm transition-shadow">
                    <div className="flex gap-3">
                      {/* Profile Image */}
                      <div className="flex-shrink-0">
                        {a.profile_image ? (
                          <img 
                            src={a.profile_image} 
                            alt={`${a.first_name} ${a.last_name}`}
                            className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.first_name + ' ' + a.last_name)}&background=1B3E2A&color=fff&size=64`
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-[#1B3E2A] flex items-center justify-center text-white font-semibold">
                            {a.first_name?.[0]}{a.last_name?.[0]}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {a.first_name} {a.last_name}
                            </div>
                            {a.programorgrade && (
                              <div className="text-xs text-slate-500 mt-1">
                                {a.programorgrade}
                              </div>
                            )}
                            {a.batchyear && (
                              <div className="text-xs text-slate-400 mt-0.5">
                                Batch {a.batchyear}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="text-xs text-rose-600 hover:text-rose-800 ml-2"
                            title="Delete alumni"
                          >
                            Delete
                          </button>
                        </div>
                        
                        {a.notes && (
                          <div className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-100">
                            <span className="font-medium">Notes:</span> {a.notes}
                          </div>
                        )}
                        {a.achievements && Array.isArray(a.achievements) && a.achievements.length > 0 && (
                          <div className="text-xs text-slate-600 mt-2">
                            <span className="font-medium">Achievements:</span>
                            <ul className="mt-1 space-y-1">
                              {a.achievements.map((ach, idx) => (
                                <li key={idx} className="pl-2">• {ach}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                          Added: {new Date(a.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}