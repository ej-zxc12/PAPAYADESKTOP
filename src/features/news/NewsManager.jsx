import React, { useEffect, useState } from 'react'

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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const api = window.newsAPI
        if (!api || typeof api.getAll !== 'function') {
          setItems([])
          return
        }
        const result = await api.getAll()
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
    setError('')
  }

  const handleSelectItem = (id) => {
    const item = items.find((entry) => String(entry.id) === String(id))
    if (!item) return
    setSelectedId(item.id)
    setTitle(item.title || '')
    setContent(item.content || '')
    setAuthor(item.author || '')
    setError('')
  }

  const handleAddMode = () => {
    resetForm()
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
      const api = window.newsAPI
      if (!api || typeof api.add !== 'function') {
        const now = new Date().toISOString()
        const fallbackItem = {
          id: `NEWS-${Date.now()}`,
          title: trimmedTitle,
          content: trimmedContent,
          author: trimmedAuthor,
          date: now,
        }
        setItems((prev) => [...prev, fallbackItem])
        setSelectedId(fallbackItem.id)
        return
      }

      const created = await api.add({
        title: trimmedTitle,
        content: trimmedContent,
        author: trimmedAuthor,
      })

      setItems((prev) => [...prev, created])
      setSelectedId(created && created.id ? created.id : null)
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

    if (!trimmedTitle || !trimmedContent) {
      setError('Title and content are required.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const api = window.newsAPI
      if (!api || typeof api.update !== 'function') {
        setItems((prev) =>
          prev.map((entry) =>
            String(entry.id) === String(selectedId)
              ? {
                  ...entry,
                  title: trimmedTitle,
                  content: trimmedContent,
                  author: trimmedAuthor,
                }
              : entry,
          ),
        )
        return
      }

      const updated = await api.update({
        id: selectedId,
        title: trimmedTitle,
        content: trimmedContent,
        author: trimmedAuthor,
      })

      setItems((prev) =>
        prev.map((entry) =>
          String(entry.id) === String(selectedId)
            ? updated || {
                ...entry,
                title: trimmedTitle,
                content: trimmedContent,
                author: trimmedAuthor,
              }
            : entry,
        ),
      )
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
      const api = window.newsAPI
      if (!api || typeof api.remove !== 'function') {
        setItems((prev) => prev.filter((entry) => String(entry.id) !== String(selectedId)))
        resetForm()
        return
      }

      await api.remove(selectedId)
      setItems((prev) => prev.filter((entry) => String(entry.id) !== String(selectedId)))
      resetForm()
    } catch {
      setError('Failed to delete news. Please try again.')
    } finally {
      setIsLoading(false)
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

      <div className="w-1/2 flex flex-col gap-3">
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
