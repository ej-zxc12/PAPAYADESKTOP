import React, { useEffect, useState } from 'react'
import { newsService } from '../../../core/services/newsService'

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
  const [article, setArticle] = useState('')
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
    setArticle('')
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
    setArticle(item.article || '')
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
    const trimmedArticle = article.trim()
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
        article: trimmedArticle,
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
    const trimmedArticle = article.trim()
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
        article: trimmedArticle,
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
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-row gap-5 flex-1 overflow-hidden min-h-0">
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
                className={`w-full flex flex-col items-start text-left rounded-2xl px-3 py-2 mb-1 text-xs transition border
                  ${
                    isActive
                      ? 'bg-white border-[#1B3E2A]/40 shadow-sm text-slate-900'
                      : 'bg-white/60 border-transparent hover:bg-white hover:border-slate-200 text-slate-700'
                  }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <div className="font-semibold truncate mr-2">{item.title || '(Untitled)'}</div>
                  <div className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                    {formatNewsDate(item.date)}
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
              </button>
            )
          })}
        </div>
      </div>

      <div className="w-1/2 flex flex-col gap-3 overflow-y-auto min-h-0 pr-1">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Add / Edit News</h2>
          <p className="text-xs text-slate-500">Fill out the form and use the buttons below to manage posts</p>
        </div>

        <div className="space-y-3">
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
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="news-slug">
              Slug (URL identifier)
            </label>
            <input
              id="news-slug"
              type="text"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
              placeholder="e.g., my-news-article (auto-generated from title)"
              disabled={!selectedId} // Allow editing only when editing existing item
            />
            {!selectedId && (
              <p className="text-xs text-slate-500 mt-1">Slug auto-generated from title. You can edit it when updating an existing article.</p>
            )}
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

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="news-article">
              Article
            </label>
            <textarea
              id="news-article"
              value={article}
              onChange={(event) => setArticle(event.target.value)}
              className="w-full min-h-[200px] rounded-2xl border border-slate-200 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
              placeholder="Write the full article content here (for website 'Read more' page)"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="news-category">
              Category
            </label>
            <select
              id="news-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
              disabled={isLoading}
            >
              <option value="Featured">Featured</option>
              <option value="Cultural">Cultural</option>
              <option value="Academic">Academic</option>
              <option value="Sports">Sports</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="news-image">
              Image
            </label>
            <input
              id="news-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
              disabled={isLoading}
            />
            {imagePreviewUrl && (
              <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-2">
                <img
                  src={imagePreviewUrl}
                  alt="News preview"
                  className="w-full max-h-48 object-contain rounded-xl bg-white"
                />
              </div>
            )}
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
            disabled={isLoading}
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
            disabled={isLoading}
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
