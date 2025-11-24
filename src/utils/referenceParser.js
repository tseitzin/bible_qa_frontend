const PASSAGE_PATTERN = /^(?<book>(?:[1-3]\s*)?[A-Za-z][A-Za-z\s]+?)\s+(?<chapter>\d{1,3})(?::(?<start>\d{1,3})(?:-(?<end>\d{1,3}))?)?$/i

export function parseReference(reference) {
  if (typeof reference !== 'string') {
    return null
  }

  const normalized = reference.replace(/[\u2013\u2014]/g, '-').trim()
  if (!normalized) {
    return null
  }

  const match = normalized.match(PASSAGE_PATTERN)
  if (!match || !match.groups) {
    return null
  }

  const book = match.groups.book.replace(/\s+/g, ' ').trim()
  const chapter = Number(match.groups.chapter)
  const startVerse = match.groups.start ? Number(match.groups.start) : null
  const endVerse = match.groups.end
    ? Number(match.groups.end)
    : startVerse

  return {
    reference: normalized,
    book,
    chapter,
    startVerse,
    endVerse: startVerse == null ? null : endVerse,
  }
}
