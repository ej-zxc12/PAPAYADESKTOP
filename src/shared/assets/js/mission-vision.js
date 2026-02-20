/*
  Mission / Vision / Values module
  - Electron renderer compatible (no frameworks)
  - Stores data temporarily in an in-memory array
  - Supports View / Add / Edit / Remove via modal
*/

;(() => {
  'use strict'

  /**
   * Mock data store (temporary)
   * In a real app, replace with IPC calls to main process or API persistence.
   */
  let items = [
    {
      id: cryptoRandomId(),
      type: 'Mission',
      title: 'Our Mission',
      content:
        'To provide quality learning experiences that nurture character, competence, and compassion in every learner.',
      updatedAt: Date.now(),
    },
    {
      id: cryptoRandomId(),
      type: 'Vision',
      title: 'Our Vision',
      content:
        'A future-ready community of learners empowered to lead with integrity and serve with love.',
      updatedAt: Date.now(),
    },
    {
      id: cryptoRandomId(),
      type: 'Values',
      title: 'Our Values',
      content: 'Faith\nExcellence\nRespect\nService\nInnovation',
      updatedAt: Date.now(),
    },
  ]

  // DOM
  const missionList = mustGetEl('missionList')
  const visionList = mustGetEl('visionList')
  const valuesList = mustGetEl('valuesList')
  const missionEmpty = mustGetEl('missionEmpty')
  const visionEmpty = mustGetEl('visionEmpty')
  const valuesEmpty = mustGetEl('valuesEmpty')

  const addNewBtn = mustGetEl('addNewBtn')

  // Modal DOM
  const modalOverlay = mustGetEl('modalOverlay')
  const modalTitle = mustGetEl('modalTitle')
  const modalKicker = mustGetEl('modalKicker')
  const modalCloseBtn = mustGetEl('modalCloseBtn')

  const contentForm = mustGetEl('contentForm')
  const contentId = mustGetEl('contentId')
  const contentType = mustGetEl('contentType')
  const contentTitle = mustGetEl('contentTitle')
  const contentBody = mustGetEl('contentBody')

  const cancelBtn = mustGetEl('cancelBtn')

  // Modal state
  let activeModalMode = 'add' // 'add' | 'edit'

  // Events
  addNewBtn.addEventListener('click', () => openAddModal())

  modalCloseBtn.addEventListener('click', () => closeModal())
  cancelBtn.addEventListener('click', () => closeModal())

  modalOverlay.addEventListener('click', (e) => {
    // Close when clicking the overlay, not when clicking inside the dialog.
    if (e.target === modalOverlay) closeModal()
  })

  document.addEventListener('keydown', (e) => {
    if (!isModalOpen()) return
    if (e.key === 'Escape') closeModal()
  })

  contentForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // Basic validation
    const type = String(contentType.value || '').trim()
    const title = String(contentTitle.value || '').trim()
    const content = String(contentBody.value || '').trim()

    if (!type) {
      window.alert('Please select a Type.')
      return
    }

    if (!content) {
      window.alert('Please enter Content.')
      return
    }

    if (activeModalMode === 'add') {
      const newItem = {
        id: cryptoRandomId(),
        type,
        title,
        content,
        updatedAt: Date.now(),
      }
      items = [newItem, ...items]
    } else {
      const id = String(contentId.value || '')
      if (!id) return

      items = items.map((item) => {
        if (item.id !== id) return item
        return { ...item, type, title, content, updatedAt: Date.now() }
      })
    }

    closeModal()
    render()
  })

  // Initial render
  render()

  /**
   * Rendering
   */
  function render() {
    const missionItems = items.filter((i) => i.type === 'Mission')
    const visionItems = items.filter((i) => i.type === 'Vision')
    const valuesItems = items.filter((i) => i.type === 'Values')

    renderList(missionList, missionItems)
    renderList(visionList, visionItems)
    renderList(valuesList, valuesItems)

    missionEmpty.hidden = missionItems.length > 0
    visionEmpty.hidden = visionItems.length > 0
    valuesEmpty.hidden = valuesItems.length > 0
  }

  function renderList(container, list) {
    container.innerHTML = ''

    for (const item of list) {
      container.appendChild(createCardEl(item))
    }
  }

  /**
   * UI components
   */
  function createCardEl(item) {
    const card = document.createElement('article')
    card.className = 'card'

    const head = document.createElement('div')
    head.className = 'card-head'

    const left = document.createElement('div')

    const title = document.createElement('h3')
    title.className = 'card-title'
    title.textContent = item.title ? item.title : `${item.type} Content`

    const metaRow = document.createElement('div')
    metaRow.style.marginTop = '8px'

    const typePill = document.createElement('span')
    typePill.className = 'card-type'
    typePill.textContent = item.type

    metaRow.appendChild(typePill)
    left.appendChild(title)
    left.appendChild(metaRow)

    const actions = document.createElement('div')
    actions.className = 'card-actions'

    const editBtn = document.createElement('button')
    editBtn.type = 'button'
    editBtn.className = 'btn'
    editBtn.textContent = 'Edit'
    editBtn.addEventListener('click', () => openEditModal(item.id))

    const removeBtn = document.createElement('button')
    removeBtn.type = 'button'
    removeBtn.className = 'btn btn-danger'
    removeBtn.textContent = 'Remove'
    removeBtn.addEventListener('click', () => handleRemove(item.id))

    actions.appendChild(editBtn)
    actions.appendChild(removeBtn)

    head.appendChild(left)
    head.appendChild(actions)

    const body = document.createElement('div')
    body.className = 'card-body'
    body.textContent = item.content

    card.appendChild(head)
    card.appendChild(body)

    return card
  }

  /**
   * Modal logic
   */
  function openAddModal() {
    activeModalMode = 'add'

    modalKicker.textContent = 'Content'
    modalTitle.textContent = 'Add New'

    contentId.value = ''
    contentType.value = 'Mission'
    contentTitle.value = ''
    contentBody.value = ''

    openModal()
  }

  function openEditModal(id) {
    const item = items.find((i) => i.id === id)
    if (!item) return

    activeModalMode = 'edit'

    modalKicker.textContent = item.type
    modalTitle.textContent = 'Edit Content'

    contentId.value = item.id
    contentType.value = item.type
    contentTitle.value = item.title || ''
    contentBody.value = item.content || ''

    openModal()
  }

  function openModal() {
    modalOverlay.hidden = false
    modalOverlay.setAttribute('aria-hidden', 'false')

    // Focus the first field for better UX.
    window.setTimeout(() => {
      contentType.focus()
    }, 0)
  }

  function closeModal() {
    modalOverlay.hidden = true
    modalOverlay.setAttribute('aria-hidden', 'true')

    // Restore focus to the primary entry point.
    addNewBtn.focus()
  }

  function isModalOpen() {
    return !modalOverlay.hidden
  }

  /**
   * Actions
   */
  function handleRemove(id) {
    const item = items.find((i) => i.id === id)
    if (!item) return

    const label = item.title ? item.title : `${item.type} Content`

    const ok = window.confirm(`Remove "${label}"? This cannot be undone.`)
    if (!ok) return

    items = items.filter((i) => i.id !== id)
    render()
  }

  /**
   * Utilities
   */
  function mustGetEl(id) {
    const el = document.getElementById(id)
    if (!el) throw new Error(`Missing element: #${id}`)
    return el
  }

  function cryptoRandomId() {
    // Prefer crypto.randomUUID when available (modern Chromium / Electron).
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }

    // Fallback.
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
})()
