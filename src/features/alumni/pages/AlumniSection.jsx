import React, { useEffect, useMemo, useState } from 'react'
import { uiText } from '../../../core/constants/uiText'
import { includesQuery } from '../../sf10/utils/sf10FeatureUtils'
import { alumniService } from '../../../core/services/alumniService'

export default function AlumniSection({ alumni }) {
  const [items, setItems] = useState(Array.isArray(alumni) ? alumni : [])
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newBatchYear, setNewBatchYear] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newEducationalStatus, setNewEducationalStatus] = useState('')
  const [newNameOfSchool, setNewNameOfSchool] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [deleteError, setDeleteError] = useState('')
  const [deletingDocId, setDeletingDocId] = useState('')

  // Edit state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingAlumni, setEditingAlumni] = useState(null)
  const [editName, setEditName] = useState('')
  const [editBatchYear, setEditBatchYear] = useState('')
  const [editAge, setEditAge] = useState('')
  const [editEducationalStatus, setEditEducationalStatus] = useState('')
  const [editNameOfSchool, setEditNameOfSchool] = useState('')
  const [editImageFile, setEditImageFile] = useState(null)
  const [editImagePreviewUrl, setEditImagePreviewUrl] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

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

    const confirmed = window.confirm('Delete this alumni record?')
    if (!confirmed) return

    if (!docId) {
      setItems((prev) => prev.filter((entry) => entry !== alumniItem))
      return
    }

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
        className={`rounded-full bg-white ring-2 ring-[#7EB88A]/70 shadow-sm flex items-center justify-center ${sizeClass}`}
      >
        <div className="h-[calc(100%-10px)] w-[calc(100%-10px)] rounded-full bg-[#FAFAFA] text-[#1A1F1B] font-semibold flex items-center justify-center">
          {String(label || '?').slice(0, 1).toUpperCase()}
        </div>
      </div>
    )
  }

  const AlumniCard = ({ alumniItem }) => (
    <div className="group w-[250px] h-[280px] rounded-3xl border border-[#E8EAE8] bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5 flex flex-col">
      <div className="p-5 flex flex-col items-center text-center gap-3 flex-1">
        <div>
          {alumniItem.imageUrl ? (
            <img
              src={alumniItem.imageUrl}
              alt={alumniItem.name}
              className="h-20 w-20 rounded-full object-cover bg-white ring-2 ring-[#7EB88A]/70 shadow-sm"
            />
          ) : (
            <Avatar label={alumniItem.name} size="md" />
          )}
        </div>

        <div className="w-full flex-1 flex flex-col">
          <div className="text-sm font-semibold text-[#1A1F1B] leading-snug">{alumniItem.name}</div>
          <div className="text-[11px] text-[#5C6560] mt-1">Batch {alumniItem.batchYear || 'N/A'}</div>
          <div className="text-[11px] text-[#5C6560] mt-0.5">Age: {alumniItem.age || 'N/A'}</div>
          <div className="text-[11px] text-[#5C6560] mt-0.5 truncate">{alumniItem.educationalStatus || 'No educational status'}</div>
          <div className="text-[11px] text-[#5C6560] mt-0.5 truncate">{alumniItem.nameOfSchool || 'No school'}</div>
        </div>

        <div className="w-full flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8EAE8] bg-[#FAFAFA] px-3 py-1.5 text-[11px] font-bold text-[#5C6560] hover:bg-[#E8EAE8] transition-all active:scale-95"
            onClick={() => handleEdit(alumniItem)}
            title="Edit alumni"
          >
            Edit
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D97070]/20 bg-[#D97070]/5 px-3 py-1.5 text-[11px] font-bold text-[#D97070] hover:bg-[#D97070]/10 transition-all active:scale-95 disabled:opacity-60"
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
  const set = new Set(items.map((a) => a.batchYear).filter(Boolean))
  return Array.from(set).sort((a, b) => b - a)
}, [items])

  const filtered = useMemo(() => {
    return items.filter((a) => {
      if (year && String(a.batchYear) !== String(year)) return false
      if (!includesQuery(a.name, query)) return false
      return true
    })
  }, [items, query, year])

  const groupedByYear = useMemo(() => {
    const map = new Map()
    filtered.forEach((a) => {
      const key = String(a.batchYear || '')
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(a)
    })

    const keys = Array.from(map.keys())
      .filter(Boolean)
      .sort((a, b) => Number(b) - Number(a))
    return keys.map((k) => ({ year: k, items: map.get(k) || [] }))
  }, [filtered])

  const resetForm = () => {
    setNewName('')
    setNewBatchYear('')
    setNewAge('')
    setNewEducationalStatus('')
    setNewNameOfSchool('')
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

  const handleEdit = (alumniItem) => {
    setEditingAlumni(alumniItem)
    setEditName(alumniItem.name || '')
    setEditBatchYear(String(alumniItem.batchYear || ''))
    setEditAge(String(alumniItem.age || ''))
    setEditEducationalStatus(alumniItem.educationalStatus || '')
    setEditNameOfSchool(alumniItem.nameOfSchool || '')
    setEditImageFile(null)
    setEditImagePreviewUrl(alumniItem.imageUrl || '')
    setIsEditOpen(true)
    setError('')
  }

  const handleEditImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditImagePreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateAlumni = async () => {
    const trimmedName = editName.trim()
    const trimmedBatchYear = String(editBatchYear).trim()
    const trimmedAge = editAge.trim()

    if (!trimmedName || !trimmedBatchYear || !trimmedAge) {
      setError('Full name, batch year, and age are required.')
      return
    }

    const batchYearNumber = Number(trimmedBatchYear)
    const ageNumber = Number(trimmedAge)
    if (!Number.isFinite(batchYearNumber) || !Number.isFinite(ageNumber)) {
      setError('Batch year and age must be numbers.')
      return
    }

    setIsUpdating(true)
    setError('')

    try {
      const updated = await alumniService.update(editingAlumni._docId || editingAlumni.id, {
        name: trimmedName,
        batchYear: batchYearNumber,
        age: ageNumber,
        educationalStatus: editEducationalStatus.trim(),
        nameOfSchool: editNameOfSchool.trim(),
        imageFile: editImageFile,
      })

      setItems((prev) => 
        prev.map((item) => 
          (item._docId || item.id) === (editingAlumni._docId || editingAlumni.id) 
            ? updated 
            : item
        )
      )
      
      setIsEditOpen(false)
      setEditingAlumni(null)
      // Reset edit form
      setEditName('')
      setEditBatchYear('')
      setEditAge('')
      setEditEducationalStatus('')
      setEditNameOfSchool('')
      setEditImageFile(null)
      setEditImagePreviewUrl('')
    } catch (e) {
      setError(e?.message || 'Failed to update alumni. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddAlumni = async () => {
    const trimmedName = newName.trim()
    const trimmedBatchYear = String(newBatchYear).trim()
    const trimmedAge = newAge.trim()

    if (!trimmedName || !trimmedBatchYear || !trimmedAge) {
      setError('Full name, batch year, and age are required.')
      return
    }

    const batchYearNumber = Number(trimmedBatchYear)
    const ageNumber = Number(trimmedAge)
    if (!Number.isFinite(batchYearNumber) || !Number.isFinite(ageNumber)) {
      setError('Batch year and age must be numbers.')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const created = await alumniService.add({
        name: trimmedName,
        batchYear: batchYearNumber,
        age: ageNumber,
        educationalStatus: newEducationalStatus.trim(),
        nameOfSchool: newNameOfSchool.trim(),
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
          <h2 className="text-base font-semibold text-[#1A1F1B]">Alumni</h2>
          <p className="text-xs text-[#5C6560]">School alumni directory</p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm()
            setIsAddOpen(true)
          }}
          className="rounded-2xl bg-[#F0C000] px-4 py-2 text-xs font-bold text-white hover:bg-[#B8920A] shadow-md shadow-[#F0C000]/10 transition-all active:scale-95"
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
          className="w-full sm:flex-1 rounded-2xl border border-[#E8EAE8] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:border-transparent"
        />
        <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2 justify-between sm:justify-end">
          <label className="text-xs font-medium text-[#5C6560]">{uiText.alumni.filterYearLabel}</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-[160px] rounded-2xl border border-[#E8EAE8] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000]"
          >
            <option value="">{uiText.alumni.allYears}</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {deleteError ? (
        <div className="text-[11px] text-[#D97070] bg-[#D97070]/5 border border-[#D97070]/10 rounded-2xl px-3 py-2">{deleteError}</div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-[#E8EAE8] bg-white px-4 py-10 text-center text-[#5C6560] text-sm">
          {uiText.alumni.noResults}
        </div>
      ) : (
        <div className="flex flex-col gap-6 overflow-x-hidden">
          {groupedByYear.map((group) => (
            <div key={group.year} className="flex flex-col gap-3">
              <div className="flex items-end justify-between gap-3">
                <h3 className="text-sm font-semibold text-[#1A1F1B]">Batch {group.year}</h3>
                <div className="text-[11px] text-[#9CA89F]">{group.items.length} alumni</div>
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
            className="absolute inset-0 bg-black/40 z-0"
            onClick={() => setIsAddOpen(false)}
            aria-label="Close modal"
          />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-[#E8EAE8] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8EAE8] flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[#1A1F1B]">Add Alumni</div>
                <div className="text-xs text-[#5C6560]">Fill out the form and save</div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-2xl border border-[#E8EAE8] px-3 py-1.5 text-xs font-medium text-[#5C6560] hover:bg-[#FAFAFA]"
              >
                Close
              </button>
            </div>

            <div className="px-5 py-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#5C6560] mb-1" htmlFor="alumni-name">Full Name</label>
                  <input
                    id="alumni-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-2xl border border-[#E8EAE8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:border-transparent"
                    placeholder="Juan Dela Cruz"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C6560] mb-1" htmlFor="alumni-batch">Batch Year</label>
                  <input
                    id="alumni-batch"
                    type="number"
                    value={newBatchYear}
                    onChange={(e) => setNewBatchYear(e.target.value)}
                    className="w-full rounded-2xl border border-[#E8EAE8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:border-transparent"
                    placeholder="2026"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C6560] mb-1" htmlFor="alumni-age">Age</label>
                  <input
                    id="alumni-age"
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full rounded-2xl border border-[#E8EAE8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:border-transparent"
                    placeholder="25"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C6560] mb-1" htmlFor="alumni-educational-status">Educational Status</label>
                  <input
                    id="alumni-educational-status"
                    type="text"
                    value={newEducationalStatus}
                    onChange={(e) => setNewEducationalStatus(e.target.value)}
                    className="w-full rounded-2xl border border-[#E8EAE8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:border-transparent"
                    placeholder="College Graduate, High School, etc."
                    disabled={isSaving}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#5C6560] mb-1" htmlFor="alumni-school">Name of School</label>
                  <input
                    id="alumni-school"
                    type="text"
                    value={newNameOfSchool}
                    onChange={(e) => setNewNameOfSchool(e.target.value)}
                    className="w-full rounded-2xl border border-[#E8EAE8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:border-transparent"
                    placeholder="University of the Philippines"
                    disabled={isSaving}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#5C6560] mb-1" htmlFor="alumni-image">Image</label>
                  <input
                    id="alumni-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-2xl border border-[#E8EAE8] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:border-transparent"
                    disabled={isSaving}
                  />
                  {imagePreviewUrl && (
                    <div className="mt-2 rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] p-2">
                      <img src={imagePreviewUrl} alt="Alumni preview" className="w-full max-h-64 object-contain rounded-xl bg-white" />
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-3 text-[11px] text-[#D97070] bg-[#D97070]/5 border border-[#D97070]/10 rounded-2xl px-3 py-2">
                  {error}
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-[#E8EAE8] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                disabled={isSaving}
                className="rounded-2xl border border-[#E8EAE8] px-4 py-2 text-xs font-bold text-[#5C6560] hover:bg-[#FAFAFA] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAlumni}
                disabled={isSaving}
                className="rounded-2xl bg-[#F0C000] px-4 py-2 text-xs font-bold text-white hover:bg-[#B8920A] shadow-md shadow-[#F0C000]/10 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 z-0"
            onClick={() => setIsEditOpen(false)}
            aria-label="Close modal"
          />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-[#E8EAE8] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8EAE8] flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[#1A1F1B]">Edit Alumni</div>
                <div className="text-xs text-[#5C6560]">Update the information and save</div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="rounded-2xl border border-[#E8EAE8] px-3 py-1.5 text-xs font-medium text-[#5C6560] hover:bg-[#FAFAFA]"
              >
                Close
              </button>
            </div>

            <div className="px-5 py-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#5C6560] mb-1" htmlFor="edit-alumni-name">Full Name</label>
                  <input
                    id="edit-alumni-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-2xl border border-[#E8EAE8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:border-transparent"
                    placeholder="Juan Dela Cruz"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C6560] mb-1" htmlFor="edit-alumni-batch">Batch Year</label>
                  <input
                    id="edit-alumni-batch"
                    type="number"
                    value={editBatchYear}
                    onChange={(e) => setEditBatchYear(e.target.value)}
                    className="w-full rounded-2xl border border-[#E8EAE8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:border-transparent"
                    placeholder="2026"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C6560] mb-1" htmlFor="edit-alumni-age">Age</label>
                  <input
                    id="edit-alumni-age"
                    type="number"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full rounded-2xl border border-[#E8EAE8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:border-transparent"
                    placeholder="25"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C6560] mb-1" htmlFor="edit-alumni-educational-status">Educational Status</label>
                  <input
                    id="edit-alumni-educational-status"
                    type="text"
                    value={editEducationalStatus}
                    onChange={(e) => setEditEducationalStatus(e.target.value)}
                    className="w-full rounded-2xl border border-[#E8EAE8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:border-transparent"
                    placeholder="College Graduate, High School, etc."
                    disabled={isUpdating}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#5C6560] mb-1" htmlFor="edit-alumni-school">Name of School</label>
                  <input
                    id="edit-alumni-school"
                    type="text"
                    value={editNameOfSchool}
                    onChange={(e) => setEditNameOfSchool(e.target.value)}
                    className="w-full rounded-2xl border border-[#E8EAE8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:border-transparent"
                    placeholder="University of the Philippines"
                    disabled={isUpdating}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#5C6560] mb-1" htmlFor="edit-alumni-image">Update Image (optional)</label>
                  <input
                    id="edit-alumni-image"
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="w-full rounded-2xl border border-[#E8EAE8] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:border-transparent"
                    disabled={isUpdating}
                  />
                  {editImagePreviewUrl && (
                    <div className="mt-2 rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] p-2">
                      <img src={editImagePreviewUrl} alt="Alumni preview" className="w-full max-h-64 object-contain rounded-xl bg-white" />
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-3 text-[11px] text-[#D97070] bg-[#D97070]/5 border border-[#D97070]/10 rounded-2xl px-3 py-2">
                  {error}
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-[#E8EAE8] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                disabled={isUpdating}
                className="rounded-2xl border border-[#E8EAE8] px-4 py-2 text-xs font-bold text-[#5C6560] hover:bg-[#FAFAFA] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateAlumni}
                disabled={isUpdating}
                className="rounded-2xl bg-[#F0C000] px-4 py-2 text-xs font-bold text-white hover:bg-[#B8920A] shadow-md shadow-[#F0C000]/10 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating…' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
