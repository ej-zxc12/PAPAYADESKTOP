import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

// Helper function to generate slug from title
function generateSlug(title) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .trim()
  
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now()
  return `${baseSlug}-${timestamp}`
}

function formatNewsDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function NewsManager() {
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadNews() {
      try {
        const { data, error } = await supabase
          .from('news_articles')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error loading news:', error)
          if (!cancelled) {
            setItems([])
          }
          return
        }
        
        if (!cancelled) {
          setItems(data || [])
        }
      } catch (err) {
        console.error('News loading error:', err)
        if (!cancelled) {
          setItems([])
        }
      }
    }

    loadNews()

    // Set up real-time subscription
    const subscription = supabase
      .channel('news_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'news_articles' },
        (payload) => {
          console.log('News change:', payload)
          loadNews() // Refresh news list
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const resetForm = () => {
    setSelectedId(null)
    setTitle('')
    setContent('')
    setAuthor('')
    setFeaturedImage('')
    setImagePreview('')
    setError('')
  }

  const handleSelectItem = (id) => {
    const item = items.find((entry) => String(entry.id) === String(id))
    if (!item) return
    setSelectedId(item.id)
    setTitle(item.title || '')
    setContent(item.content || '')
    setAuthor(item.author || '')
    setFeaturedImage(item.featured_image || '')
    setImagePreview(item.featured_image || '')
    setError('')
  }

  const handleAddMode = () => {
    resetForm()
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
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('Please select a JPG, PNG, GIF, or WebP image file')
        return
      }

      setIsUploading(true)
      setError('')

      // Create a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `news-images/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('news-images') // Make sure this bucket exists in Supabase Storage
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError(`Failed to upload image: ${uploadError.message}`)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath)

      setFeaturedImage(publicUrl)
      setImagePreview(publicUrl)

    } catch (err) {
      console.error('Image upload error:', err)
      setError('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setFeaturedImage('')
    setImagePreview('')
  }

  const handleSaveNew = async () => {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    const trimmedAuthor = author.trim()

    if (!trimmedTitle || !trimmedContent) {
      setError('Title and content are required.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const slug = generateSlug(trimmedTitle)
      const { data, error } = await supabase
        .from('news_articles')
        .insert({
          title: trimmedTitle,
          slug: slug,
          content: trimmedContent,
          author: trimmedAuthor,
          featured_image: featuredImage || null,
          status: 'Published',
          published_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating news:', error)
        setError('Failed to save news. Please try again.')
        return
      }

      setItems((prev) => [data, ...prev])
      setSelectedId(data.id)
      setTitle(data.title)
      setContent(data.content)
      setAuthor(data.author)
      setFeaturedImage(data.featured_image || '')
      setImagePreview(data.featured_image || '')
    } catch (err) {
      console.error('News creation error:', err)
      setError('Failed to save news. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateExisting = async () => {
    if (!selectedId) return

    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    const trimmedAuthor = author.trim()

    if (!trimmedTitle || !trimmedContent) {
      setError('Title and content are required.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const slug = generateSlug(trimmedTitle)
      const { data, error } = await supabase
        .from('news_articles')
        .update({
          title: trimmedTitle,
          slug: slug,
          content: trimmedContent,
          author: trimmedAuthor,
          featured_image: featuredImage || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedId)
        .select()
        .single()

      if (error) {
        console.error('Error updating news:', error)
        setError('Failed to update news. Please try again.')
        return
      }

      setItems((prev) =>
        prev.map((entry) =>
          entry.id === selectedId ? data : entry,
        ),
      )
      setImagePreview(featuredImage || '')
    } catch (err) {
      console.error('News update error:', err)
      setError('Failed to update news. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedId) return

    const confirmed = window.confirm('Delete this news post?')
    if (!confirmed) return

    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', selectedId)

      if (error) {
        console.error('Error deleting news:', error)
        setError('Failed to delete news. Please try again.')
        return
      }

      setItems((prev) => prev.filter((entry) => entry.id !== selectedId))
      resetForm()
    } catch (err) {
      console.error('News deletion error:', err)
      setError('Failed to delete news. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const sortedItems = items
    .slice()
    .sort((a, b) => {
      const aTime = a && (a.created_at || a.published_at) ? new Date(a.created_at || a.published_at).getTime() : 0
      const bTime = b && (b.created_at || b.published_at) ? new Date(b.created_at || b.published_at).getTime() : 0
      return bTime - aTime
    })

  const isNewMode = !selectedId
  const isSaveDisabled = !title.trim() || !content.trim() || isLoading || isUploading
  const isUpdateDisabled = isNewMode || !title.trim() || !content.trim() || isLoading || isUploading
  const isDeleteDisabled = isNewMode || isLoading || isUploading

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-row gap-5 flex-1 overflow-hidden">
      <div className="w-1/2 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">News Posts</h2>
            <p className="text-xs text-slate-500">View and select existing news posts</p>
          </div>
          <div className="text-xs text-slate-400">{sortedItems.length} items</div>
        </div>
        <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/60 p-2">
          {sortedItems.length === 0 && (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No news posts yet.
            </div>
          )}
          {sortedItems.map((item) => {
            const isActive = String(item.id) === String(selectedId)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectItem(item.id)}
                className={`w-full flex items-start text-left rounded-2xl px-3 py-2 mb-1 text-xs transition border
                  ${
                    isActive
                      ? 'bg-white border-[#1B3E2A]/40 shadow-sm text-slate-900'
                      : 'bg-white/60 border-transparent hover:bg-white hover:border-slate-200 text-slate-700'
                  }`}
              >
                {item.featured_image && (
                  <div className="flex-shrink-0 mr-3">
                    <img 
                      src={item.featured_image} 
                      alt={item.title || 'News image'}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between w-full mb-0.5">
                    <div className="font-semibold truncate mr-2">{item.title || '(Untitled)'}</div>
                    <div className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                      {formatNewsDate(item.created_at || item.published_at)}
                    </div>
                  </div>
                  {item.author && (
                    <div className="text-[11px] text-slate-500 mb-0.5">By {item.author}</div>
                  )}
                  {item.content && (
                    <div className="text-[11px] text-slate-500 line-clamp-2">
                      {String(item.content).length > 140
                        ? `${String(item.content).slice(0, 140)}...`
                        : String(item.content)}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="w-1/2 flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Add / Edit News</h2>
          <p className="text-xs text-slate-500">Fill out the form and use the buttons below to manage posts</p>
        </div>

        <div className="space-y-3">
          {/* Image Upload Section */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Featured Image</label>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-rose-600 text-xs"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="file"
                    id="news-image-upload"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isUploading}
                  />
                  <label 
                    htmlFor="news-image-upload" 
                    className={`block rounded-xl border border-slate-200 px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {isUploading ? (
                        <>
                          <svg className="animate-spin h-3 w-3 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span>{imagePreview ? 'Change image' : 'Upload image'}</span>
                        </>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      JPG, PNG, GIF, WebP (max 5MB)
                    </div>
                  </label>
                </div>
                {imagePreview && (
                  <div className="text-[10px] text-emerald-600 mt-2">
                    ✓ Image uploaded successfully
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="news-title">
              Title
            </label>
            <input
              id="news-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
              placeholder="Enter news title"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="news-author">
              Author
            </label>
            <input
              id="news-author"
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
              placeholder="Optional author name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="news-content">
              Content
            </label>
            <textarea
              id="news-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="w-full min-h-[160px] rounded-2xl border border-slate-200 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
              placeholder="Write the full news content here"
            />
          </div>
        </div>

        {error && (
          <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-3 py-2">
            {error}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAddMode}
            disabled={isLoading || isUploading}
            className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Add
          </button>
          <button
            type="button"
            onClick={handleSaveNew}
            disabled={isSaveDisabled}
            className="rounded-2xl border border-[#1B3E2A] bg-[#1B3E2A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#163021] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleUpdateExisting}
            disabled={isUpdateDisabled}
            className="rounded-2xl border border-amber-500 bg-amber-500/90 px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Update
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleteDisabled}
            className="rounded-2xl border border-rose-500 bg-rose-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={isLoading || isUploading}
            className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          {selectedId && (
            <span className="ml-auto text-[11px] text-slate-400">Editing ID: {selectedId}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default NewsManager