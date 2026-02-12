export function formatPersonName(parts) {
  if (!parts) return ''
  
  // Debug: Log the entire parts object to see what fields are available
  console.log('Student data:', parts)
  
  const { firstName, middleName, lastName, first_name, middle_name, last_name } = parts
  
  // Try different field name variations
  const fName = firstName || first_name || ''
  const mName = middleName || middle_name || ''
  const lName = lastName || last_name || ''
  
  // Debug: Log what we found
  console.log('Name fields:', { fName, mName, lName })
  
  return [lName, fName, mName].filter(Boolean).join(', ').replace(/,\s*$/, '')
}

export function includesQuery(value, query) {
  if (!query) return true
  const q = String(query || '').trim().toLowerCase()
  if (!q) return true
  return String(value || '').toLowerCase().includes(q)
}
