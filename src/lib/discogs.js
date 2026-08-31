const DISCOGS_TOKEN = import.meta.env.VITE_DISCOGS_TOKEN

// Discogs release titles usually come back as "Artist - Title".
// Split that out so we can show/store the artist separately.
export function splitArtistTitle(rawTitle) {
  if (!rawTitle) return { artist: null, title: rawTitle || '' }
  const idx = rawTitle.indexOf(' - ')
  if (idx === -1) return { artist: null, title: rawTitle }
  return {
    artist: rawTitle.slice(0, idx).trim(),
    title: rawTitle.slice(idx + 3).trim()
  }
}

// Discogs "format" is an array of tags like ["Vinyl","LP","Album","Stereo"]
// or ["CD","Album"] or ["Cassette"]. Collapse that down to one of our
// three buckets (or 'Other' if we can't tell).
export function detectFormat(formatArray) {
  if (!Array.isArray(formatArray)) return 'Other'
  const tokens = formatArray.map(f => String(f).toLowerCase())
  if (tokens.includes('cd')) return 'CD'
  if (tokens.includes('cassette')) return 'Cassette'
  if (tokens.some(t => ['vinyl', 'lp', '7"', '10"', '12"'].includes(t))) return 'Vinyl'
  return 'Other'
}

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