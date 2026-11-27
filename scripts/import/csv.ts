/** Minimal RFC 4180 CSV reader (quoted fields, doubled quotes). Throws on ragged rows. */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some((f) => f !== '')) rows.push(row)
      row = []
    } else field += c
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  const [head, ...body] = rows
  if (!head) throw new Error('CSV is empty')
  return body.map((r, n) => {
    if (r.length !== head.length)
      throw new Error(`CSV row ${n + 2} has ${r.length} fields, expected ${head.length}`)
    return Object.fromEntries(head.map((h, i) => [h, r[i]!]))
  })
}
