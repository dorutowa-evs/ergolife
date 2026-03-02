export function paginate<T>(items: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage
  return items.slice(start, start + perPage)
}

export function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = []

  if (current <= 3) {
    pages.push(1, 2, 3, '...', total)
  } else if (current >= total - 2) {
    pages.push(1, '...', total - 2, total - 1, total)
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total)
  }

  return pages
}
