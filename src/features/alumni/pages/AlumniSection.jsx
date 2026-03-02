import React, { useEffect, useMemo, useState } from 'react'
import { uiText } from '../../../core/constants/uiText'
import { includesQuery } from '../../sf10/utils/sf10FeatureUtils'
import { alumniService } from '../../../core/services/alumniService'

export default function AlumniSection({ alumni }) {
  const [items, setItems] = useState(Array.isArray(alumni) ? alumni : [])
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newId, setNewId] = useState('')
  const [newName, setNewName] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [newSituation, setNewSituation] = useState('')
  const [newEducationalStatus, setNewEducationalStatus] = useState('')
  const [newNameOfSchool, setNewNameOfSchool] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [deleteError, setDeleteError] = useState('')
  const [deletingDocId, setDeletingDocId] = useState('')

  // Add custom styles for proper grid layout
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .alumni-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 250px));
        gap: 20px;
        width: 100%;
        overflow-x: hidden;
      }
      .alumni-container > div {
        width: 250px !important;
        height: 280px !important;
        flex-shrink: 0;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const result = await alumniService.getAll()
        if (!cancelled && Array.isArray(result) && result.length > 0) {
          setItems(result)
        }
      } catch {
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const handleDelete = async (alumniItem) => {
    const docId = alumniItem?._docId
    if (!docId) return

    const confirmed = window.confirm('Delete this alumni record?')
    if (!confirmed) return

    setDeleteError('')
    setDeletingDocId(String(docId))
    try {
      await alumniService.remove(docId, alumniItem.imagePath)
      setItems((prev) => prev.filter((entry) => entry._docId !== docId))
    } catch (e) {
      setDeleteError(e?.message || 'Failed to delete alumni. Please try again.')
    } finally {
      setDeletingDocId('')
    }
  }

  const Avatar = ({ label = '?', size = 'md' }) => {
    const sizeClass = size === 'lg' ? 'h-24 w-24 text-2xl' : size === 'sm' ? 'h-14 w-14 text-sm' : 'h-[72px] w-[72px] text-lg'

    return (
      <div
        className={`rounded-full bg-white ring-2 ring-[#1B3E2A]/70 shadow-sm flex items-center justify-center ${sizeClass}`}
      >
        <div className="h-[calc(100%-10px)] w-[calc(100%-10px)] rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center">
          {String(label || '?').slice(0, 1).toUpperCase()}
        </div>
      </div>
    )
  }

  const AlumniCard = ({ alumniItem }) => (
    <div className="group w-[250px] h-[280px] rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5 flex flex-col">
      <div className="p-5 flex flex-col items-center text-center gap-3 flex-1">
        <div>
          {alumniItem.imageUrl ? (
            <img
              src={alumniItem.imageUrl}
              alt={alumniItem.name}
              className="h-20 w-20 rounded-full object-cover bg-white ring-2 ring-[#1B3E2A]/70 shadow-sm"
            />
          ) : (
            <Avatar label={alumniItem.name} size="md" />
          )}
        </div>

        <div className="w-full flex-1 flex flex-col">
          <div className="text-sm font-semibold text-slate-900 leading-snug">{alumniItem.name}</div>
          <div className="text-[11px] text-slate-500 mt-1">Age: {alumniItem.age || 'N/A'}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 truncate">{alumniItem.address || 'No address'}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 truncate">{alumniItem.situation || 'No situation'}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 truncate">{alumniItem.educationalStatus || 'No educational status'}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 truncate">{alumniItem.nameOfSchool || 'No school'}</div>
          {alumniItem.id ? (
            <div className="mt-auto inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
              {alumniItem.id}
            </div>
          ) : null}
        </div>

        <div className="w-full flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
            onClick={() => handleDelete(alumniItem)}
            disabled={deletingDocId === String(alumniItem._docId)}
            title="Delete alumni"
          >
            {deletingDocId === String(alumniItem._docId) ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )

  useEffect(() => {
    if (!isAddOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsAddOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAddOpen])

  const years = useMemo(() => {
  const set = new Set(items.map((a) => a.age).filter(Boolean))
  return Array.from(set).sort((a, b) => b - a)
}, [items])

  const filtered = useMemo(() => {
    return items.filter((a) => {
      if (year && String(a.age) !== String(year)) return false
      if (!includesQuery(a.name, query)) return false
      return true
    })
  }, [items, query, year])

  const groupedByYear = useMemo(() => {
    const map = new Map()
    filtered.forEach((a) => {
      const key = String(a.age || 'Unknown')
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(a)
    })

    const keys = Array.from(map.keys())
      .filter(Boolean)
      .sort((a, b) => Number(b) - Number(a))
    return keys.map((k) => ({ year: k, items: map.get(k) || [] }))
  }, [filtered])

  const resetForm = () => {
    setNewId('')
    setNewName('')
    setNewAge('')
    setNewAddress('')
    setNewSituation('')
    setNewEducationalStatus('')
    setNewNameOfSchool('')
    setNewNotes('')
    setImageFile(null)
    setImagePreviewUrl('')
    setError('')
  }

  const handleImageChange = (event) => {
    const file = event.target.files && event.target.files[0]
    setImageFile(file || null)
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreviewUrl(url)
    } else {
      setImagePreviewUrl('')
    }
  }

  const handleAddAlumni = async () => {
    const trimmedId = newId.trim()
    const trimmedName = newName.trim()
    const trimmedAge = newAge.trim()

    if (!trimmedId || !trimmedName || !trimmedAge) {
      setError('ID, full name, and age are required.')
      return
    }

    const ageNumber = Number(trimmedAge)
    if (!Number.isFinite(ageNumber)) {
      setError('Age must be a number.')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const created = await alumniService.add({
        id: trimmedId,
        name: trimmedName,
        age: ageNumber,
        address: newAddress.trim(),
        situation: newSituation.trim(),
        educationalStatus: newEducationalStatus.trim(),
        nameOfSchool: newNameOfSchool.trim(),
        notes: newNotes.trim(),
        imageFile,
      })

      setItems((prev) => [created, ...prev])
      resetForm()
      setIsAddOpen(false)
    } catch (e) {
      setError(e?.message || 'Failed to add alumni. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4 min-h-0 max-w-full overflow-hidden">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Alumni</h2>
          <p className="text-xs text-slate-500">School alumni directory</p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm()
            setIsAddOpen(true)
          }}
          className="rounded-2xl border border-[#1B3E2A] bg-[#1B3E2A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163021]"
        >
          Add Alumni
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={uiText.alumni.searchPlaceholder}
          className="w-full sm:flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
        />
        <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2 justify-between sm:justify-end">
          <label className="text-xs font-medium text-slate-600">Filter by Age</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-[160px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
          >
            <option value="">All ages</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {deleteError ? (
        <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-3 py-2">{deleteError}</div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-10 text-center text-slate-500 text-sm">
          {uiText.alumni.noResults}
        </div>
      ) : (
        <div className="flex flex-col gap-6 overflow-x-hidden">
          {groupedByYear.map((group) => (
            <div key={group.year} className="flex flex-col gap-3">
              <div className="flex items-end justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">Age {group.year}</h3>
                <div className="text-[11px] text-slate-400">{group.items.length} alumni</div>
              </div>
              <div className="alumni-container">
                {group.items.map((a) => (
                  <AlumniCard key={a._docId || a.id} alumniItem={a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsAddOpen(false)}
            aria-label="Close modal"
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Add Alumni</div>
                <div className="text-xs text-slate-500">Fill out the form and save</div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="px-5 py-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="alumni-id">ID</label>
                  <input
                    id="alumni-id"
                    type="text"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                    placeholder="AL-2026-0001"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="alumni-name">Full Name</label>
                  <input
                    id="alumni-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                    placeholder="Juan Dela Cruz"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="alumni-age">Age</label>
                  <input
                    id="alumni-age"
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                    placeholder="25"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="alumni-address">Address</label>
                  <input
                    id="alumni-address"
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                    placeholder="123 Main St, City"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="alumni-situation">Situation</label>
                  <input
                    id="alumni-situation"
                    type="text"
                    value={newSituation}
                    onChange={(e) => setNewSituation(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                    placeholder="Employed, Student, etc."
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="alumni-educational-status">Educational Status</label>
                  <input
                    id="alumni-educational-status"
                    type="text"
                    value={newEducationalStatus}
                    onChange={(e) => setNewEducationalStatus(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                    placeholder="College Graduate, High School, etc."
                    disabled={isSaving}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="alumni-school">Name of School</label>
                  <input
                    id="alumni-school"
                    type="text"
                    value={newNameOfSchool}
                    onChange={(e) => setNewNameOfSchool(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                    placeholder="University of the Philippines"
                    disabled={isSaving}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="alumni-notes">Notes</label>
                  <textarea
                    id="alumni-notes"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full min-h-[110px] rounded-2xl border border-slate-200 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                    placeholder="Optional notes"
                    disabled={isSaving}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="alumni-image">Image</label>
                  <input
                    id="alumni-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
                    disabled={isSaving}
                  />
                  {imagePreviewUrl && (
                    <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-2">
                      <img src={imagePreviewUrl} alt="Alumni preview" className="w-full max-h-64 object-contain rounded-xl bg-white" />
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-3 text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-3 py-2">
                  {error}
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                disabled={isSaving}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAlumni}
                disabled={isSaving}
                className="rounded-2xl border border-[#1B3E2A] bg-[#1B3E2A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163021] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
