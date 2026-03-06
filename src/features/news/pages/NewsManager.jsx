import React, { useEffect, useState } from 'react'
import { newsService } from '../../../core/services/newsService'
import { FiFileText, FiPlus, FiImage } from 'react-icons/fi'

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

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .trim()
}

function NewsManager() {
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('Featured')
  const [slug, setSlug] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [selectedImagePath, setSelectedImagePath] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-generate slug from title
  useEffect(() => {
    if (selectedId) {
      // Don't auto-generate slug when editing existing item
      return
    }
    const generatedSlug = generateSlug(title)
    setSlug(generatedSlug)
  }, [title, selectedId])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const result = await newsService.getAll()
        if (!cancelled) {
          setItems(Array.isArray(result) ? result : [])
        }
      } catch {
        if (!cancelled) {
          setItems([])
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const resetForm = () => {
    setSelectedId(null)
    setTitle('')
    setContent('')
    setAuthor('')
    setCategory('Featured')
    setSlug('')
    setImageFile(null)
    setImagePreviewUrl('')
    setSelectedImagePath('')
    setError('')
  }

  const handleSelectItem = (id) => {
    const item = items.find((entry) => String(entry.id) === String(id))
    if (!item) return
    setSelectedId(item.id)
    setTitle(item.title || '')
    setContent(item.content || '')
    setAuthor(item.author || '')
    setCategory(item.category || 'Featured')
    setSlug(item.slug || '')
    setSelectedImagePath(item.imagePath || '')
    setImageFile(null)
    setImagePreviewUrl(item.imageUrl || '')
    setError('')
  }

  const handleAddMode = () => {
    resetForm()
  }

  const handleSaveNew = async () => {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    const trimmedAuthor = author.trim()
    const trimmedCategory = String(category || '').trim() || 'Featured'
    const trimmedSlug = slug.trim()

    if (!trimmedTitle || !trimmedContent) {
      setError('Title and content are required.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const created = await newsService.add({
        title: trimmedTitle,
        content: trimmedContent,
        author: trimmedAuthor,
        category: trimmedCategory,
        slug: trimmedSlug,
        imageFile,
      })

      setItems((prev) => [...prev, created])
      setSelectedId(created && created.id ? created.id : null)
      setImageFile(null)
      setImagePreviewUrl(created?.imageUrl || '')
      setSelectedImagePath(created?.imagePath || '')
    } catch {
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
    const trimmedCategory = String(category || '').trim() || 'Featured'
    const trimmedSlug = slug.trim()

    if (!trimmedTitle || !trimmedContent) {
      setError('Title and content are required.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const updated = await newsService.update({
        id: selectedId,
        title: trimmedTitle,
        content: trimmedContent,
        author: trimmedAuthor,
        category: trimmedCategory,
        slug: trimmedSlug,
        imageFile,
        previousImagePath: selectedImagePath,
      })

      setItems((prev) =>
        prev.map((entry) =>
          String(entry.id) === String(selectedId)
            ? {
                ...entry,
                ...(updated || {}),
                title: trimmedTitle,
                content: trimmedContent,
                author: trimmedAuthor,
                category: trimmedCategory,
              }
            : entry,
        ),
      )

      if (updated?.imageUrl) {
        setImagePreviewUrl(updated.imageUrl)
      }
      if (updated?.imagePath) {
        setSelectedImagePath(updated.imagePath)
      }
      setImageFile(null)
    } catch {
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
      await newsService.remove(selectedId, selectedImagePath)
      setItems((prev) => prev.filter((entry) => String(entry.id) !== String(selectedId)))
      resetForm()
    } catch {
      setError('Failed to delete news. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (event) => {
    const file = event.target.files && event.target.files[0]
    setImageFile(file || null)
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreviewUrl(url)
    } else {
      setImagePreviewUrl(selectedImagePath ? imagePreviewUrl : '')
    }
  }

  const sortedItems = items
    .slice()
    .sort((a, b) => {
      const aTime = a && a.date ? Date.parse(a.date) : 0
      const bTime = b && b.date ? Date.parse(b.date) : 0
      return bTime - aTime
    })

  const isNewMode = !selectedId
  const isSaveDisabled = !title.trim() || !content.trim() || isLoading
  const isUpdateDisabled = isNewMode || !title.trim() || !content.trim() || isLoading
  const isDeleteDisabled = isNewMode || isLoading

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-0 h-full">
      {/* Left Column: News List */}
      <div className="w-full lg:w-[450px] flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-xl font-bold text-[#1A1F1B]">News Posts</h2>
            <p className="text-sm text-[#5C6560]">Manage your website's news feed</p>
          </div>
          <div className="px-3 py-1 bg-[#F0F8F1] text-[#4A8058] rounded-full text-xs font-bold border border-[#D6EDD9]">
            {sortedItems.length} Posts
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-[32px] border border-[#E8EAE8] bg-white shadow-sm p-4 space-y-3">
          {sortedItems.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
              <div className="w-16 h-16 bg-[#FAFAFA] rounded-3xl flex items-center justify-center mb-4">
                <FiFileText className="w-8 h-8 text-[#9CA89F]" />
              </div>
              <p className="text-sm font-medium text-[#5C6560]">No news posts yet.</p>
            </div>
          )}
          {sortedItems.map((item) => {
            const isActive = String(item.id) === String(selectedId)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectItem(item.id)}
                className={`w-full flex flex-col items-start text-left rounded-[24px] p-4 transition-all border
                  ${
                    isActive
                      ? 'bg-[#FFFAE8] border-[#F0C000] shadow-md ring-4 ring-[#F0C000]/10'
                      : 'bg-white border-[#E8EAE8] hover:border-[#F0C000]/40 hover:bg-[#FAFAFA] text-[#5C6560]'
                  }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isActive ? 'bg-[#F0C000] text-white border-[#F0C000]' : 'bg-[#FAFAFA] text-[#9CA89F] border-[#E8EAE8]'
                  }`}>
                    {item.category || 'General'}
                  </span>
                  <div className="text-[10px] font-bold text-[#9CA89F]">
                    {formatNewsDate(item.date)}
                  </div>
                </div>
                <div className={`font-bold text-sm mb-1 line-clamp-1 ${isActive ? 'text-[#1A1F1B]' : 'text-[#1A1F1B]'}`}>
                  {item.title || '(Untitled)'}
                </div>
                {item.content && (
                  <div className={`text-[11px] line-clamp-2 leading-relaxed ${isActive ? 'text-[#5C6560]' : 'text-[#9CA89F]'}`}>
                    {String(item.content)}
                  </div>
                )}
                {item.author && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#E8EAE8] flex items-center justify-center text-[10px] font-bold text-[#5C6560]">
                      {item.author[0]}
                    </div>
                    <span className="text-[10px] font-bold text-[#5C6560] opacity-70">By {item.author}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Right Column: Editor */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-h-0 pr-2">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-xl font-bold text-[#1A1F1B]">{isNewMode ? 'Create New Post' : 'Edit Post'}</h2>
            <p className="text-sm text-[#5C6560]">{isNewMode ? 'Compose your latest update' : 'Update the details of your article'}</p>
          </div>
          {!isNewMode && (
            <button 
              onClick={handleAddMode}
              className="px-4 py-2 bg-white border border-[#E8EAE8] text-[#1A1F1B] rounded-xl text-xs font-bold hover:bg-[#FAFAFA] transition-all shadow-sm active:scale-95 flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              New Post
            </button>
          )}
        </div>

        <div className="bg-white rounded-[32px] border border-[#E8EAE8] shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Article Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all"
                  placeholder="Enter a catchy title..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Author Name</label>
                <input
                  type="text"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all"
                  placeholder="Optional author name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Category</label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all appearance-none"
                  disabled={isLoading}
                >
                  <option value="Featured">Featured News</option>
                  <option value="Cultural">Cultural Events</option>
                  <option value="Academic">Academic Updates</option>
                  <option value="Sports">Sports News</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all disabled:opacity-50"
                  placeholder="auto-generated-slug"
                  disabled={!selectedId}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Post Content</label>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="w-full min-h-[240px] rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-4 text-sm font-medium leading-relaxed text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all resize-none"
                placeholder="Share your story with the community..."
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Cover Image</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="relative group">
                  <input
                    type="file"
                    id="news-image-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <label 
                    htmlFor="news-image-input"
                    className="flex flex-col items-center justify-center w-full h-48 rounded-3xl border-2 border-dashed border-[#E8EAE8] bg-[#FAFAFA] hover:bg-white hover:border-[#F0C000]/40 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiImage className="w-10 h-10 text-[#9CA89F] mb-3 group-hover:text-[#F0C000] transition-colors" />
                      <p className="text-sm font-bold text-[#5C6560]">Click to upload image</p>
                      <p className="text-[10px] text-[#9CA89F] mt-1 uppercase font-bold tracking-tighter">PNG, JPG or WEBP (Max 5MB)</p>
                    </div>
                  </label>
                </div>

                {imagePreviewUrl ? (
                  <div className="relative rounded-3xl border border-[#E8EAE8] bg-[#FAFAFA] p-3 h-48 overflow-hidden flex items-center justify-center group">
                    <img
                      src={imagePreviewUrl}
                      alt="News preview"
                      className="w-full h-full object-cover rounded-2xl bg-white transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[#1A1F1B]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                      <p className="text-white text-xs font-bold uppercase tracking-widest">Preview Mode</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 rounded-3xl border border-[#E8EAE8] bg-[#FAFAFA] flex items-center justify-center">
                    <p className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-widest">No Image Selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editor Footer Actions */}
          <div className="px-8 py-6 bg-[#FAFAFA] border-t border-[#E8EAE8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetForm}
                disabled={isLoading}
                className="rounded-xl border border-[#E8EAE8] bg-white px-6 py-2.5 text-xs font-bold text-[#5C6560] hover:bg-[#FAFAFA] transition-all active:scale-95 disabled:opacity-60"
              >
                Reset Form
              </button>
              {!isNewMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleteDisabled}
                  className="rounded-xl bg-[#D97070]/10 px-6 py-2.5 text-xs font-bold text-[#D97070] hover:bg-[#D97070]/20 transition-all active:scale-95 disabled:opacity-60"
                >
                  Delete Post
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isNewMode ? (
                <button
                  type="button"
                  onClick={handleSaveNew}
                  disabled={isSaveDisabled}
                  className="rounded-xl bg-[#F0C000] px-8 py-2.5 text-xs font-bold text-white hover:bg-[#B8920A] shadow-lg shadow-[#F0C000]/20 transition-all active:scale-95 disabled:opacity-60"
                >
                  {isLoading ? 'Publishing...' : 'Publish Post'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleUpdateExisting}
                  disabled={isUpdateDisabled}
                  className="rounded-xl bg-[#1A1F1B] px-8 py-2.5 text-xs font-bold text-white hover:bg-black shadow-lg shadow-black/10 transition-all active:scale-95 disabled:opacity-60"
                >
                  {isLoading ? 'Updating...' : 'Update Article'}
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-2 bg-[#D97070]/5 border border-[#D97070]/10 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#D97070] animate-pulse" />
            <span className="text-xs font-bold text-[#D97070]">{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewsManager
