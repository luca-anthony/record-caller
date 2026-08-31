// Fixed display order for format subsections. 'Other' catches legacy rows
// saved before the format column existed, or anything we couldn't detect.
export const FORMAT_ORDER = ['Vinyl', 'CD', 'Cassette', 'Other']

export function groupByFormat(records) {
  const groups = { Vinyl: [], CD: [], Cassette: [], Other: [] }
  for (const record of records) {
    const key = FORMAT_ORDER.includes(record.format) ? record.format : 'Other'
    groups[key].push(record)
  }
  return FORMAT_ORDER
    .map(format => ({ format, records: groups[format] }))
    .filter(group => group.records.length > 0)
}
