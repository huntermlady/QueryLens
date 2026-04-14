import { useState, useCallback } from 'react'
import { runQuery } from '@/utils/queryEngine'
import { pickDefaultChartConfig } from '@/utils/columnInference'
import type { QueryResult, ChartConfig } from '@/types'

export type QueryStatus = 'idle' | 'running' | 'success' | 'error'

interface QueryState {
  status: QueryStatus
  result: QueryResult | null
  error: string | null
  chartConfig: ChartConfig | null
}

export function useQueryRunner() {
  const [state, setState] = useState<QueryState>({
    status: 'idle',
    result: null,
    error: null,
    chartConfig: null,
  })

  const run = useCallback((sql: string) => {
    if (!sql.trim()) return

    setState((prev) => ({ ...prev, status: 'running', error: null }))

    // Use setTimeout so the running state renders before the (potentially sync) query
    setTimeout(() => {
      const outcome = runQuery(sql)
      if (outcome.success) {
        const config = pickDefaultChartConfig(outcome.result.columns)
        setState({
          status: 'success',
          result: outcome.result,
          error: null,
          chartConfig: config,
        })
      } else {
        setState({
          status: 'error',
          result: null,
          error: outcome.error,
          chartConfig: null,
        })
      }
    }, 60)
  }, [])

  const updateChartConfig = useCallback((patch: Partial<ChartConfig>) => {
    setState((prev) => ({
      ...prev,
      chartConfig: prev.chartConfig ? { ...prev.chartConfig, ...patch } : null,
    }))
  }, [])

  return { ...state, run, updateChartConfig }
}
