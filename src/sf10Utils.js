export function formatPersonName(parts) {
  if (!parts) return ''
  const { firstName, middleName, lastName } = parts
  return [lastName, firstName, middleName].filter(Boolean).join(', ').replace(/,\s*$/, '')
}

export function includesQuery(value, query) {
  if (!query) return true
  const q = String(query || '').trim().toLowerCase()
  if (!q) return true
  return String(value || '').toLowerCase().includes(q)
}
