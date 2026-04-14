import { useState, useCallback, useEffect, useRef } from 'react'
import { toast, Toaster } from 'sonner'
import { Header } from '@/components/Header'
import { SqlEditor } from '@/components/SqlEditor'
import { ResultsPanel } from '@/components/ResultsPanel'
import { DropOverlay } from '@/components/DropOverlay'
import { useQueryRunner } from '@/hooks/useQueryRunner'
import { useTheme } from '@/hooks/useTheme'
import { exampleQueries, DEFAULT_QUERY } from '@/data/exampleQueries'
import { rowCounts, TABLES, uploadTable, uploadedTables } from '@/utils/queryEngine'
import type { UploadedTable } from '@/types'

function App() {
  const [query, setQuery] = useState(DEFAULT_QUERY)
  const { theme, toggle } = useTheme()
  const { status, result, error, chartConfig, run, updateChartConfig } = useQueryRunner()
  const [uploaded, setUploaded] = useState<UploadedTable[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const builtInRowCount = TABLES.reduce((sum, t) => sum + (rowCounts[t.name] ?? 0), 0)
  const uploadedRowCount = uploaded.reduce((sum, t) => sum + t.rowCount, 0)
  const totalRowCount = builtInRowCount + uploadedRowCount

  const isDark = theme === 'dark'
  const bg     = isDark ? '#060b15' : '#eef2e8'
  const border = isDark ? '#142030' : '#ccd9b8'

  // ── Upload handler ───────────────────────────────────────────────────────
  const handleUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Only CSV files are supported.')
      return
    }
    const toastId = toast.loading(`Importing ${file.name}…`)
    try {
      const meta = await uploadTable(file)
      setUploaded([...uploadedTables])
      toast.success(
        `${meta.name} ready — ${meta.rowCount.toLocaleString()} rows`,
        { id: toastId, description: `SELECT * FROM ${meta.name} LIMIT 50` }
      )
      // Drop a starter query into the editor
      setQuery(`SELECT *\nFROM ${meta.name}\nLIMIT 50`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Import failed.',
        { id: toastId }
      )
    }
  }, [])

  // ── Global drag-and-drop ─────────────────────────────────────────────────
  useEffect(() => {
    const onEnter = (e: DragEvent) => {
      e.preventDefault()
      dragCounter.current++
      if (dragCounter.current === 1) setIsDragging(true)
    }
    const onLeave = () => {
      dragCounter.current--
      if (dragCounter.current === 0) setIsDragging(false)
    }
    const onOver = (e: DragEvent) => e.preventDefault()
    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      dragCounter.current = 0
      setIsDragging(false)
      const file = e.dataTransfer?.files[0]
      if (file) handleUpload(file)
    }

    window.addEventListener('dragenter', onEnter)
    window.addEventListener('dragleave', onLeave)
    window.addEventListener('dragover', onOver)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onEnter)
      window.removeEventListener('dragleave', onLeave)
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('drop', onDrop)
    }
  }, [handleUpload])

  // ── Query handlers ───────────────────────────────────────────────────────
  const handleRun = useCallback(() => run(query), [run, query])
  const handleSelectExample = useCallback((sql: string) => { setQuery(sql); run(sql) }, [run])
  const handleRunExample = useCallback(() => handleSelectExample(exampleQueries[0].sql), [handleSelectExample])

  return (
    <div className="flex flex-col h-full" style={{ background: bg }}>
      {isDragging && <DropOverlay theme={theme} />}

      <Header
        theme={theme}
        onToggleTheme={toggle}
        rowCount={totalRowCount}
        uploadedCount={uploaded.length}
        onUpload={handleUpload}
        uploadedTables={uploaded}
      />

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
