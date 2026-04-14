import type { ColumnMeta, ChartConfig, ChartType } from '@/types'

export function pickDefaultChartConfig(columns: ColumnMeta[]): ChartConfig {
  const temporal = columns.find((c) => c.kind === 'temporal')
  const categoricals = columns.filter((c) => c.kind === 'categorical')
  const numerics = columns.filter((c) => c.kind === 'numeric')

  // Default Y axes: first numeric (or all numerics if <= 3)
  const yAxes = numerics.slice(0, 3).map((c) => c.name)

  // Default X axis
  let xAxis = temporal?.name ?? categoricals[0]?.name ?? columns[0]?.name ?? ''

  // Default chart type
  let chartType: ChartType = 'bar'
  if (temporal) {
    chartType = 'line'
    xAxis = temporal.name
  } else if (categoricals.length === 1 && numerics.length === 1) {
    chartType = 'pie'
  }

  return { chartType, xAxis, yAxes }
}
