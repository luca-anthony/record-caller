const DISCOGS_TOKEN = import.meta.env.VITE_DISCOGS_TOKEN

export async function searchRecords(query) {
  const res = await fetch(
    `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release&token=${DISCOGS_TOKEN}`
  )
  const data = await res.json()
  const results = data.results || []

  // Remove duplicates by master_id, falling back to title
  const seen = new Set()
  const unique = results.filter(record => {
    const key = record.master_id || record.title
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return unique.slice(0, 20)
}