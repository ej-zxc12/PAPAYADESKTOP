import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { uiText } from '../../../core/constants/uiText'
import { includesQuery } from '../../sf10/utils/sf10FeatureUtils'
import { alumniService } from '../../../core/services/alumniService'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSearch, faFilter, faUserGraduate, faPlus } from '@fortawesome/free-solid-svg-icons'

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

  const sectionRef = useRef(null)

  // Add custom styles
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      
      .alumni-section-root {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background-color: #f8f9fb;
      }

      .alumni-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
        width: 100%;
      }

      .alumni-card-3d {
        perspective: 1000px;
        transition: transform 0.1s ease-out;
      }

      .alumni-card-inner {
        transform-style: preserve-3d;
        border-radius: 20px;
        background: #fff;
        border: 1px solid rgba(232, 234, 232, 0.6);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        height: 100%;
        position: relative;
        overflow: hidden;
      }

      .alumni-card-inner:hover {
        box-shadow: 0 10px 30px rgba(123, 191, 58, 0.15);
        border-color: rgba(123, 191, 58, 0.3);
      }

      .shimmer-sweep {
        position: absolute;
        top: 0; left: -100%;
        width: 50%; height: 100%;
        background: linear-gradient(
          to right,
          rgba(255,255,255,0) 0%,
          rgba(255,255,255,0.4) 50%,
          rgba(255,255,255,0) 100%
        );
        transform: skewX(-25deg);
        pointer-events: none;
        z-index: 5;
      }

      .avatar-ring {
        background: linear-gradient(45deg, #7BBF3A, #EF9F27);
        padding: 3px;
        border-radius: 50%;
        transition: transform 0.5s ease;
      }

      .alumni-card-inner:hover .avatar-ring {
        transform: rotate(15deg);
      }

      .batch-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        background: #f0fdf4;
        color: #166534;
        padding: 4px 12px;
        border-radius: 99px;
        font-size: 10px;
        font-weight: 700;
        border: 1px solid #dcfce7;
      }

      .action-buttons {
        position: absolute;
        bottom: 16px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        gap: 8px;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .alumni-card-inner:hover .action-buttons {
        opacity: 1;
        transform: translateY(0);
      }

      .batch-header {
        border-left: 4px solid #7BBF3A;
        padding-left: 16px;
        margin-bottom: 20px;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Page Load Stagger Animation
  useEffect(() => {
    if (items.length > 0) {
      const ctx = gsap.context(() => {
        gsap.from(".header-fade", {
          y: -30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out"
        })

        gsap.from(".batch-header", {
          x: -40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          delay: 0.3
        })

        gsap.from(".alumni-card-3d", {
          y: 40,
          opacity: 0,
          scale: 0.92,
          duration: 0.8,
          stagger: 0.08,
          ease: "back.out(1.4)",
          delay: 0.4
        })
      }, sectionRef)
      return () => ctx.revert()
    }
  }, [items.length === 0])

  const handleMouseMove = useCallback((e, el) => {
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = (y - centerY) / 10
    const rotateY = (centerX - x) / 10

    gsap.to(el.querySelector('.alumni-card-inner'), {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.5,
      ease: "power2.out"
    })

    const shimmer = el.querySelector('.shimmer-sweep')
    gsap.to(shimmer, {
      left: '150%',
      duration: 1,
      ease: "power2.inOut"
    })
  }, [])

  const handleMouseLeave = useCallback((el) => {
    if (!el) return
    gsap.to(el.querySelector('.alumni-card-inner'), {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.3)"
    })

    const shimmer = el.querySelector('.shimmer-sweep')
    gsap.set(shimmer, { left: '-100%' })
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const result = await alumniService.getAll()
        if (!cancelled && Array.isArray(result) && result.length > 0) {
          setItems(result)
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

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
      const key = String(a.batchYear || 'N/A')
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(a)
    })
    const keys = Array.from(map.keys()).sort((a, b) => {
      if (a === 'N/A') return 1
      if (b === 'N/A') return -1
      return Number(b) - Number(a)
    })
    return keys.map((k) => ({ year: k, items: map.get(k) || [] }))
  }, [filtered])

  const Avatar = ({ label = '?', size = 'md' }) => {
    const sizeClass = size === 'lg' ? 'h-24 w-24 text-2xl' : 'h-20 w-20 text-lg'
    return (
      <div className={`avatar-ring ${sizeClass} flex items-center justify-center`}>
        <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
          <div className="h-[92%] w-[92%] rounded-full bg-[#f8f9fb] text-[#1A1F1B] font-bold flex items-center justify-center">
            {String(label || '?').slice(0, 1).toUpperCase()}
          </div>
        </div>
      </div>
    )
  }

  const handleDelete = async (alumniItem) => {
    const confirmed = window.confirm('Delete this alumni record?')
    if (!confirmed) return
    const docId = alumniItem?._docId
    if (!docId) {
      setItems((prev) => prev.filter((entry) => entry !== alumniItem))
      return
    }
    setDeletingDocId(String(docId))
    try {
      await alumniService.remove(docId, alumniItem.imagePath)
      setItems((prev) => prev.filter((entry) => entry._docId !== docId))
    } catch (e) {
      setDeleteError(e?.message || 'Failed to delete.')
    } finally {
      setDeletingDocId('')
    }
  }

  const handleEdit = (alumniItem) => {
    setEditingAlumni(alumniItem)
    setEditName(alumniItem.name || '')
    setEditBatchYear(String(alumniItem.batchYear || ''))
    setEditAge(String(alumniItem.age || ''))
    setEditEducationalStatus(alumniItem.educationalStatus || '')
    setEditNameOfSchool(alumniItem.nameOfSchool || '')
    setEditImagePreviewUrl(alumniItem.imageUrl || '')
    setIsEditOpen(true)
    setError('')
  }

  const handleUpdateAlumni = async () => {
    const trimmedName = editName.trim()
    const trimmedBatchYear = String(editBatchYear).trim()
    const trimmedAge = String(editAge).trim()

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
      setIsUpdating(false)
    } catch (e) {
      setError(e?.message || 'Failed to update.')
      setIsUpdating(false)
    }
  }

  const handleAddAlumni = async () => {
    const trimmedName = newName.trim()
    const trimmedBatchYear = String(newBatchYear).trim()
    const trimmedAge = String(newAge).trim()

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
      setNewName('')
      setNewBatchYear('')
      setNewAge('')
      setNewEducationalStatus('')
      setNewNameOfSchool('')
      setImageFile(null)
      setImagePreviewUrl('')
      setIsAddOpen(false)
    } catch (e) {
      setError(e?.message || 'Failed to add.')
    } finally {
      setIsSaving(false)
    }
  }

  const AlumniCard = ({ alumniItem, index }) => (
    <div 
      className="alumni-card-3d h-[320px]"
      onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
      onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
    >
      <div className="alumni-card-inner p-6 flex flex-col items-center text-center">
        <div className="shimmer-sweep" />
        <span className="batch-badge">Batch {alumniItem.batchYear || 'N/A'}</span>
        
        <div className="mt-4 mb-4">
          {alumniItem.imageUrl ? (
            <div className="avatar-ring h-20 w-20">
              <img
                src={alumniItem.imageUrl}
                alt={alumniItem.name}
                className="h-full w-full rounded-full object-cover border-2 border-white"
              />
            </div>
          ) : (
            <Avatar label={alumniItem.name} />
          )}
        </div>

        <div className="flex-1">
          <h4 className="text-base font-bold text-[#1A1F1B] mb-1">{alumniItem.name}</h4>
          <p className="text-[11px] text-[#7BBF3A] font-extrabold uppercase tracking-wider mb-2">
            {alumniItem.educationalStatus || 'Alumnus'}
          </p>
          <p className="text-[12px] text-[#5C6560] leading-relaxed line-clamp-2">
            {alumniItem.nameOfSchool || 'No school specified'}
          </p>
        </div>

        <div className="action-buttons">
          <button
            onClick={() => handleEdit(alumniItem)}
            className="h-9 w-9 rounded-full bg-white shadow-md border border-slate-100 text-slate-600 hover:text-[#7BBF3A] hover:border-[#7BBF3A] transition-colors"
          >
            <FontAwesomeIcon icon={faPen} className="text-xs" />
          </button>
          <button
            onClick={() => handleDelete(alumniItem)}
            className="h-9 w-9 rounded-full bg-white shadow-md border border-slate-100 text-slate-600 hover:text-rose-500 hover:border-rose-500 transition-colors"
          >
            <FontAwesomeIcon icon={faTrash} className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  )

  const years = useMemo(() => {
    const set = new Set(items.map((a) => a.batchYear).filter(Boolean))
    return Array.from(set).sort((a, b) => b - a)
  }, [items])

  return (
    <div className="alumni-section-root min-h-full p-6 lg:p-8" ref={sectionRef}>
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="header-fade">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-2xl bg-[#7BBF3A]/10 flex items-center justify-center text-[#7BBF3A]">
                <FontAwesomeIcon icon={faUserGraduate} className="text-xl" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#1A1F1B] tracking-tight">Alumni Directory</h2>
            </div>
            <p className="text-sm text-[#5C6560]">Manage and celebrate the achievements of our graduates</p>
          </div>
          
          <div className="header-fade flex flex-wrap items-center gap-3">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full sm:w-[300px] pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-[#7BBF3A] focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
            <div className="relative">
              <FontAwesomeIcon icon={faFilter} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="pl-10 pr-8 py-2.5 rounded-2xl border border-slate-200 bg-white shadow-sm appearance-none focus:ring-2 focus:ring-[#7BBF3A] outline-none transition-all text-sm font-medium"
              >
                <option value="">All Batches</option>
                {years.map(y => <option key={y} value={y}>Batch {y}</option>)}
              </select>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-[#1B3E2A] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#23513A] shadow-lg shadow-[#1B3E2A]/20 transition-all active:scale-95"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              <span>Add Alumni</span>
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-dashed border-slate-300">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
              <FontAwesomeIcon icon={faSearch} className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No alumni found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-12">
            {groupedByYear.map((group) => (
              <div key={group.year} className="batch-group">
                <div className="batch-header flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#1A1F1B]">Batch {group.year}</h3>
                    <p className="text-xs text-[#5C6560]">Graduation year collection</p>
                  </div>
                  <span className="bg-[#7BBF3A]/10 text-[#7BBF3A] px-4 py-1.5 rounded-full text-xs font-bold border border-[#7BBF3A]/20">
                    {group.items.length} Members
                  </span>
                </div>
                <div className="alumni-grid">
                  {group.items.map((a, idx) => (
                    <AlumniCard key={a._docId || a.id} alumniItem={a} index={idx} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <h3 className="text-xl font-bold mb-6">Add New Alumnus</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                  <input placeholder="Name" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#7BBF3A] outline-none" value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Batch Year</label>
                  <input placeholder="Batch" type="number" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#7BBF3A] outline-none" value={newBatchYear} onChange={e => setNewBatchYear(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Age</label>
                  <input placeholder="Age" type="number" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#7BBF3A] outline-none" value={newAge} onChange={e => setNewAge(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Educational Status</label>
                  <input placeholder="Educational Status" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#7BBF3A] outline-none" value={newEducationalStatus} onChange={e => setNewEducationalStatus(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Name of School</label>
                  <input placeholder="School Name" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#7BBF3A] outline-none" value={newNameOfSchool} onChange={e => setNewNameOfSchool(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsAddOpen(false)} className="px-6 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-all">Cancel</button>
                <button onClick={handleAddAlumni} className="px-8 py-2 rounded-xl bg-[#1B3E2A] text-white font-bold hover:bg-[#23513A] transition-all shadow-lg">Save Alumnus</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Edit Alumnus</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                  <input placeholder="Name" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#7BBF3A] outline-none" value={editName} onChange={e => setEditName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Batch Year</label>
                  <input placeholder="Batch" type="number" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#7BBF3A] outline-none" value={editBatchYear} onChange={e => setEditBatchYear(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Age</label>
                  <input placeholder="Age" type="number" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#7BBF3A] outline-none" value={editAge} onChange={e => setEditAge(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Educational Status</label>
                  <input placeholder="Educational Status" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#7BBF3A] outline-none" value={editEducationalStatus} onChange={e => setEditEducationalStatus(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Name of School</label>
                  <input placeholder="School Name" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#7BBF3A] outline-none" value={editNameOfSchool} onChange={e => setEditNameOfSchool(e.target.value)} />
                </div>
              </div>

              {error && <p className="text-xs text-rose-500 mb-4 ml-1">{error}</p>}

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsEditOpen(false)} 
                  disabled={isUpdating}
                  className="px-6 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateAlumni} 
                  disabled={isUpdating}
                  className="px-8 py-2 rounded-xl bg-[#7BBF3A] text-white font-bold hover:bg-[#6aa832] transition-all shadow-lg shadow-[#7BBF3A]/20 flex items-center gap-2"
                >
                  {isUpdating ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : null}
                  {isUpdating ? 'Updating...' : 'Update Records'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
