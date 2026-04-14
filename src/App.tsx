import { useState, useCallback } from 'react'
import { Toaster } from 'sonner'
import { Header } from '@/components/Header'
import { SqlEditor } from '@/components/SqlEditor'
import { ResultsPanel } from '@/components/ResultsPanel'
import { useQueryRunner } from '@/hooks/useQueryRunner'
import { useTheme } from '@/hooks/useTheme'
import { exampleQueries, DEFAULT_QUERY } from '@/data/exampleQueries'
import { rowCounts, TABLES } from '@/utils/queryEngine'

function App() {
  const [query, setQuery] = useState(DEFAULT_QUERY)
  const { theme, toggle } = useTheme()
  const { status, result, error, chartConfig, run, updateChartConfig } = useQueryRunner()
  const rowCount = TABLES.reduce((sum, t) => sum + (rowCounts[t.name] ?? 0), 0)
  const isDark = theme === 'dark'

  const bg     = isDark ? '#060b15' : '#eef2e8'
  const border = isDark ? '#142030' : '#ccd9b8'

  const handleRun = useCallback(() => run(query), [run, query])
  const handleSelectExample = useCallback((sql: string) => { setQuery(sql); run(sql) }, [run])
  const handleRunExample = useCallback(() => handleSelectExample(exampleQueries[0].sql), [handleSelectExample])

  return (
    <div className="flex flex-col h-full" style={{ background: bg }}>
      <Header theme={theme} onToggleTheme={toggle} rowCount={rowCount} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left — SQL Editor */}
        <div
          className="flex flex-col shrink-0"
          style={{ width: 400, minWidth: 260, maxWidth: '50%', borderRight: `1px solid ${border}` }}
        >
          <SqlEditor
            value={query}
            onChange={setQuery}
            onRun={handleRun}
            status={status}
            result={result}
            theme={theme}
            onSelectExample={handleSelectExample}
          />
        </div>

        {/* Right — Results */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <ResultsPanel
            status={status}
            result={result}
            error={error}
            chartConfig={chartConfig}
            onUpdateChartConfig={updateChartConfig}
            onRunExample={handleRunExample}
            theme={theme}
          />
        </div>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: isDark ? '#0e1628' : '#ffffff',
            color: isDark ? '#cdd8ee' : '#0d1a06',
            border: `1px solid ${border}`,
            fontSize: '13px',
          },
        }}
      />
    </div>
  )
}

export default App
