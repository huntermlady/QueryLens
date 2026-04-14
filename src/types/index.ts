export type ChartType = 'bar' | 'line' | 'area' | 'pie'

export type ColumnKind = 'numeric' | 'categorical' | 'temporal'

export interface ColumnMeta {
  name: string
  kind: ColumnKind
}

export interface QueryResult {
  rows: Record<string, unknown>[]
  columns: ColumnMeta[]
  duration: number
}

export interface ChartConfig {
  chartType: ChartType
  xAxis: string
  yAxes: string[]
}

export interface ExampleQuery {
  label: string
  description: string
  sql: string
}

export interface DraftPickRow {
  season: number
  team: string
  round: number
  pick: number
  pfr_id: string | null
  pfr_name: string | null
  player_id: string | null
  side: string | null
  category: string | null
  position: string | null
}
