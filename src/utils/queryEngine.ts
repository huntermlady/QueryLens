import alasql from 'alasql'
import Papa from 'papaparse'
import type { ColumnMeta, ColumnKind, QueryResult, UploadedTable } from '@/types'

// ── Table registry ────────────────────────────────────────────────────────────

export interface TableMeta {
  name: string        // AlaSQL table name
  file: string        // filename in /public (served from data/)
  label: string       // human-readable label for the loader
}

export const TABLES: TableMeta[] = [
  { name: 'draft_picks',  file: 'draft_picks.csv',  label: 'Draft picks (1980–present)' },
  { name: 'games',        file: 'games.csv',         label: 'Game results'               },
  { name: 'standings',    file: 'standings.csv',     label: 'Season standings'           },
  { name: 'rosters',      file: 'rosters.csv',       label: 'Player rosters'             },
  { name: 'trades',       file: 'trades.csv',        label: 'Trade history'              },
  { name: 'draft_values', file: 'draft_values.csv',  label: 'Draft pick values'          },
  { name: 'win_totals',   file: 'win_totals.csv',    label: 'Win total lines'            },
]

// ── Row counts keyed by table name ───────────────────────────────────────────

export const rowCounts: Record<string, number> = {}

let initialized = false

// ── Coercion ─────────────────────────────────────────────────────────────────

function coerce(value: string): string | number | null {
  if (value === '' || value === 'NA' || value === 'na') return null
  const n = Number(value)
  if (!isNaN(n) && value.trim() !== '') return n
  return value
}

// ── Load one table ────────────────────────────────────────────────────────────

async function loadTable(table: TableMeta): Promise<number> {
  const response = await fetch(`${import.meta.env.BASE_URL}${table.file}`)
  if (!response.ok) throw new Error(`Failed to fetch ${table.file}: ${response.statusText}`)
  const text = await response.text()

  const { data, errors } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (errors.length > 0) {
    console.warn(`[${table.name}] CSV parse warnings:`, errors.slice(0, 3))
  }

  const rows = data.map((row) => {
    const coerced: Record<string, string | number | null> = {}
    for (const key of Object.keys(row)) {
      coerced[key] = coerce(row[key])
    }
    return coerced
  })

  alasql(`CREATE TABLE IF NOT EXISTS ${table.name}`)
  alasql.tables[table.name].data = rows
  rowCounts[table.name] = rows.length
  return rows.length
}

// ── Public init ───────────────────────────────────────────────────────────────

export type ProgressCallback = (loaded: number, total: number, label: string) => void

export async function initDataset(onProgress?: ProgressCallback): Promise<void> {
  if (initialized) return

  for (let i = 0; i < TABLES.length; i++) {
    const table = TABLES[i]
    onProgress?.(i, TABLES.length, table.label)
    await loadTable(table)
  }

  onProgress?.(TABLES.length, TABLES.length, 'Done')
  initialized = true
}

// ── CSV upload ────────────────────────────────────────────────────────────────

export const uploadedTables: UploadedTable[] = []

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024 // 50 MB

function sanitizeTableName(filename: string): string {
  return filename
    .replace(/\.csv$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^([0-9])/, 't$1') // can't start with a digit
}

function uniqueTableName(base: string): string {
  const taken = new Set([
    ...TABLES.map(t => t.name),
    ...uploadedTables.map(t => t.name),
  ])
  if (!taken.has(base)) return base
  let i = 2
  while (taken.has(`${base}_${i}`)) i++
  return `${base}_${i}`
}

export async function uploadTable(file: File): Promise<UploadedTable> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `File is ${(file.size / 1024 / 1024).toFixed(1)} MB — maximum allowed size is 50 MB.`
    )
  }

  const text = await file.text()
  const { data, errors } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (errors.length > 0) {
    console.warn(`[upload:${file.name}] parse warnings:`, errors.slice(0, 3))
  }

  if (data.length === 0) {
    throw new Error('The CSV file appears to be empty or has no data rows.')
  }

  const rows = data.map(row => {
    const coerced: Record<string, string | number | null> = {}
    for (const key of Object.keys(row)) coerced[key] = coerce(row[key])
    return coerced
  })

  const tableName = uniqueTableName(sanitizeTableName(file.name))
  alasql(`CREATE TABLE IF NOT EXISTS ${tableName}`)
  alasql.tables[tableName].data = rows

  const meta: UploadedTable = {
    name: tableName,
    originalName: file.name,
    rowCount: rows.length,
    columns: Object.keys(rows[0]),
  }
  uploadedTables.push(meta)
  return meta
}

// ── Query runner ──────────────────────────────────────────────────────────────

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
  return Object.keys(rows[0]).map((name) => ({ name, kind: inferKind(rows[0][name]) }))
}

export interface RunResult { success: true;  result: QueryResult }
export interface RunError  { success: false; error: string }

export function runQuery(sql: string): RunResult | RunError {
  if (!initialized) return { success: false, error: 'Dataset not loaded yet. Please wait.' }
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
    return { success: true, result: { rows, columns: inferColumns(rows), duration } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
