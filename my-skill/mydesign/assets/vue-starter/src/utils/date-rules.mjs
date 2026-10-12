const DAY = 86400000

export function shanghaiDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now)
  const pick = (type) => parts.find((part) => part.type === type).value
  return `${pick('year')}-${pick('month')}-${pick('day')}`
}

export function addDays(day, offset) {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, date + offset)).toISOString().slice(0, 10)
}

export function defaultRange(mode = 'crawl', now = new Date(), days = 14) {
  if (!['crawl', 'records'].includes(mode)) throw new Error('Unknown date mode')
  if (!Number.isInteger(days) || days < 1) throw new Error('Days must be a positive integer')
  const end = addDays(shanghaiDay(now), mode === 'crawl' ? -1 : 0)
  return [addDays(end, 1 - days), end]
}

export function previousRange([start, end]) {
  const length = Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / DAY) + 1
  if (length <= 0) throw new Error('Invalid date range')
  return [addDays(start, -length), addDays(start, -1)]
}

// ElDatePicker passes a Date representing a local calendar cell, not a business instant.
// Read its displayed calendar fields; compare them to the Shanghai business cutoff.
export function calendarDay(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function isDisabledDay(date, mode = 'crawl', now = new Date()) {
  return calendarDay(date) > defaultRange(mode, now, 1)[1]
}
