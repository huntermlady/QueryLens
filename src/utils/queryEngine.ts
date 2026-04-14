import alasql from 'alasql'
import Papa from 'papaparse'
import type { ColumnMeta, ColumnKind, QueryResult } from '@/types'

let initialized = false

function coerce(value: string): string | number | null {
  if (value === '' || value === 'NA' || value === 'na') return null
  const n = Number(value)
  if (!isNaN(n) && value.trim() !== '') return n
  return value
}

export async function initDataset(): Promise<number> {
  if (initialized) return alasql.tables.draft_picks?.data?.length ?? 0

  const response = await fetch('/draft_picks.csv')
  if (!response.ok) throw new Error(`Failed to fetch dataset: ${response.statusText}`)
  const text = await response.text()

  const { data, errors } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (errors.length > 0) {
    console.warn('CSV parse warnings:', errors.slice(0, 3))
  }

  // Coerce numeric strings to numbers
  const rows = data.map((row) => {
    const coerced: Record<string, string | number | null> = {}
    for (const key of Object.keys(row)) {
      coerced[key] = coerce(row[key])
    }
    return coerced
  })

  alasql('CREATE TABLE IF NOT EXISTS draft_picks')
  alasql.tables.draft_picks.data = rows
  initialized = true

  return rows.length
}

function inferKind(value: unknown): ColumnKind {
  if (value instanceof Date) return 'temporal'
  if (typeof value === 'number') return 'numeric'
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'temporal'
    const n = Number(value)
    if (!isNaN(n) && value.trim() !== '') return 'numeric'
  }
  return 'categorical'
}

function inferColumns(rows: Record<string, unknown>[]): ColumnMeta[] {
  if (rows.length === 0) return []
  const sample = rows[0]
  return Object.keys(sample).map((name) => ({
    name,
    kind: inferKind(sample[name]),
  }))
}

export interface RunResult {
  success: true
  result: QueryResult
}

export interface RunError {
  success: false
  error: string
}

export function runQuery(sql: string): RunResult | RunError {
  if (!initialized) {
    return { success: false, error: 'Dataset not loaded yet. Please wait.' }
  }
  const start = performance.now()
  try {
    const raw = alasql(sql) as unknown
    const duration = Math.round(performance.now() - start)

    if (!Array.isArray(raw)) {
      return {
        success: true,
        result: {
          rows: [{ affected_rows: raw }],
          columns: [{ name: 'affected_rows', kind: 'numeric' }],
          duration,
        },
      }
    }

    const rows = raw as Record<string, unknown>[]
    const columns = inferColumns(rows)
    return { success: true, result: { rows, columns, duration } }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}
