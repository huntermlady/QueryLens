import { useRef, useState } from 'react'
import { BarChart2, Table2, Code2 } from 'lucide-react'
import { ChartRenderer } from './ChartRenderer'
import { ChartControls } from './ChartControls'
import { DataTable } from './DataTable'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { LoadingState } from './LoadingState'
import { exportPng } from '@/utils/exportPng'
import { exportCsv } from '@/utils/exportCsv'
import type { QueryStatus } from '@/hooks/useQueryRunner'
import type { QueryResult, ChartConfig } from '@/types'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

type ViewTab = 'chart' | 'table' | 'json'

interface ResultsPanelProps {
  status: QueryStatus
  result: QueryResult | null
  error: string | null
  chartConfig: ChartConfig | null
  onUpdateChartConfig: (patch: Partial<ChartConfig>) => void
  onRunExample: () => void
  theme: 'light' | 'dark'
}

const TABS: { id: ViewTab; icon: React.ReactNode; label: string }[] = [
  { id: 'chart', icon: <BarChart2 size={13} strokeWidth={2} />, label: 'Chart' },
  { id: 'table', icon: <Table2  size={13} strokeWidth={2} />, label: 'Table' },
  { id: 'json',  icon: <Code2   size={13} strokeWidth={2} />, label: 'JSON'  },
]

export function ResultsPanel({
  status, result, error, chartConfig, onUpdateChartConfig, onRunExample, theme,
}: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>('chart')
  const chartRef = useRef<HTMLDivElement>(null)
  const hasResult = status === 'success' || status === 'error'
  const isDark = theme === 'dark'

  // Explicit color values — no CSS variable cascade needed
  const bg       = isDark ? '#060b15' : '#eef2e8'
  const cardBg   = isDark ? '#0b1220' : '#f5f8f0'
  const border   = isDark ? '#142030' : '#ccd9b8'
  const fg       = isDark ? '#cdd8ee' : '#0d1a06'
  const muted    = isDark ? '#3e5a7a' : '#5a7240'
  const primary  = isDark ? '#a3e635' : '#4d7c0f'
  const stripBg  = isDark ? 'rgba(163,230,53,0.04)' : 'rgba(77,124,15,0.04)'

  async function handleExportPng() {
    if (!chartRef.current) return
    try { await exportPng(chartRef.current); toast.success('Chart exported as PNG') }
    catch { toast.error('Failed to export chart') }
  }
  function handleExportCsv() {
    if (!result) return
    exportCsv(result.rows)
    toast.success('Data exported as CSV')
  }

  return (
    <div className="flex flex-col h-full" style={{ background: bg }}>

      {/* Tab bar */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0 flex-wrap gap-y-2"
        style={{ background: cardBg, borderBottom: `1px solid ${border}` }}
      >
        <div className="flex items-center">
          {TABS.map(({ id, icon, label }) => {
            const isActive = activeTab === id && hasResult
            return (
              <button
                key={id}
                onClick={() => hasResult && setActiveTab(id)}
                disabled={!hasResult}
                className={cn(
                  'relative flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition-colors',
                  !hasResult && 'opacity-40 cursor-not-allowed',
                )}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isActive ? primary : muted,
                }}
              >
                {icon}
                {label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full animate-fade-in"
                    style={{ background: primary }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {activeTab === 'chart' && status === 'success' && result && chartConfig && (
          <div className="animate-fade-in">
            <ChartControls
              config={chartConfig}
              columns={result.columns}
              onChange={onUpdateChartConfig}
              onExportPng={handleExportPng}
              onExportCsv={handleExportCsv}
              theme={theme}
            />
          </div>
        )}
      </div>

      {/* Stats strip */}
      {status === 'success' && result && (
        <div
          className="flex items-center gap-4 px-4 py-1.5 shrink-0 animate-slide-up"
          style={{ background: stripBg, borderBottom: `1px solid ${border}` }}
        >
          {[
            { label: 'ROWS', value: result.rows.length.toLocaleString() },
            { label: 'COLS', value: result.columns.length.toString() },
            { label: 'TIME', value: `${result.duration}ms` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: muted }}>
                {label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: primary }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {status === 'idle'    && <EmptyState onRunExample={onRunExample} theme={theme} />}
        {status === 'running' && <LoadingState />}
        {status === 'error'   && error && <ErrorState error={error} />}

        {status === 'success' && result && chartConfig && (
          <>
            {activeTab === 'chart' && (
              <div ref={chartRef} className="h-full p-5 animate-slide-up" style={{ background: bg }}>
                <ChartRenderer result={result} config={chartConfig} />
              </div>
            )}
            {activeTab === 'table' && (
              <div className="h-full animate-slide-up">
                <DataTable result={result} theme={theme} />
              </div>
            )}
            {activeTab === 'json' && (
              <div className="h-full overflow-auto p-5 animate-slide-up">
                <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: fg, lineHeight: 1.6 }}>
                  {JSON.stringify(result.rows.slice(0, 100), null, 2)}
                </pre>
                {result.rows.length > 100 && (
                  <p style={{ fontSize: 11, color: muted, fontFamily: 'var(--font-mono)', marginTop: 8 }}>
                    Showing first 100 of {result.rows.length} rows
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
