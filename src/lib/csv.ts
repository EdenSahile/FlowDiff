const SEP = ';'
const BOM = '﻿'

function escape(v: string | number): string {
  const s = String(v)
  return s.includes(SEP) || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"` : s
}

export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const csv = [headers, ...rows].map(r => r.map(escape).join(SEP)).join('\r\n')
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
