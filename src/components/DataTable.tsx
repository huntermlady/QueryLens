import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { QueryResult } from '@/types'
import { cn } from '@/utils/cn'

const PAGE_SIZE = 25

interface DataTableProps {
  result: QueryResult
  theme: 'light' | 'dark'
}

export function DataTable({ result, theme }: DataTableProps) {
  const [page, setPage] = useState(0)
  const { rows, columns } = result
  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const isDark = theme === 'dark'

  const cardBg   = isDark ? '#0b1220' : '#f5f8f0'
  const headerBg = isDark ? '#0e1928' : '#e2ebd6'
  const border   = isDark ? '#142030' : '#ccd9b8'
  const fg       = isDark ? '#cdd8ee' : '#0d1a06'
  const muted    = isDark ? '#3e5a7a' : '#5a7240'
  const primary  = isDark ? '#a3e635' : '#4d7c0f'
  const success  = isDark ? '#34d399' : '#15803d'
  const warning  = isDark ? '#fbbf24' : '#b45309'

  const KIND_DOT: Record<string, string> = {
    numeric:     primary,
    categorical: success,
    temporal:    warning,
  }

  function formatCell(value: unknown): string {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'number') {
      return Number.isInteger(value)
        ? value.toLocaleString()
        : value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    }
    return String(value)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10">
            <tr style={{ background: headerBg, borderBottom: `1px solid ${border}` }}>
              {columns.map((col) => (
                <th
                  key={col.name}
                  className="px-3 py-2.5 text-left whitespace-nowrap first:pl-4 last:pr-4"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: KIND_DOT[col.kind] ?? muted }}
                    />
                    <span
                      className="font-semibold uppercase tracking-wider text-[10px]"
                      style={{ fontFamily: 'var(--font-display)', color: muted, letterSpacing: '0.1em' }}
                    >
                      {col.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={cn('border-b transition-colors')}
                style={{ borderColor: border, background: rowIdx % 2 !== 0 ? (isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)') : 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(163,230,53,0.04)' : 'rgba(77,124,15,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.background = rowIdx % 2 !== 0 ? (isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)') : 'transparent' }}
              >
                {columns.map((col) => (
                  <td
                    key={col.name}
                    className={cn('px-3 py-2 first:pl-4 last:pr-4', col.kind === 'numeric' && 'text-right tabular-nums')}
                    style={{
                      color: fg,
                      fontFamily: col.kind === 'numeric' || col.kind === 'temporal' ? 'var(--font-mono)' : 'var(--font-sans)',
                      fontSize: col.kind === 'numeric' ? 11 : 12,
                    }}
                  >
                    {formatCell(row[col.name])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-4 py-2.5 border-t shrink-0"
          style={{ borderColor: border, background: cardBg }}
        >
          <span style={{ fontSize: 11, color: muted, fontFamily: 'var(--font-mono)' }}>
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, rows.length)} of {rows.length.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: muted }}
              onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = headerBg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 11, color: muted, fontFamily: 'var(--font-display)', padding: '0 8px' }}>
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: muted }}
              onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = headerBg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
