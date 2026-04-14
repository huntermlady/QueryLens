import { BarChart2, TrendingUp, Activity, PieChart, Download, FileText, ImageIcon } from 'lucide-react'
import type { ChartConfig, ChartType, ColumnMeta } from '@/types'
import { cn } from '@/utils/cn'

interface ChartControlsProps {
  config: ChartConfig
  columns: ColumnMeta[]
  onChange: (patch: Partial<ChartConfig>) => void
  onExportPng: () => void
  onExportCsv: () => void
  theme: 'light' | 'dark'
}

const CHART_TYPES: { type: ChartType; icon: React.ReactNode; label: string }[] = [
  { type: 'bar',  icon: <BarChart2  size={13} strokeWidth={2} />, label: 'Bar'  },
  { type: 'line', icon: <TrendingUp size={13} strokeWidth={2} />, label: 'Line' },
  { type: 'area', icon: <Activity   size={13} strokeWidth={2} />, label: 'Area' },
  { type: 'pie',  icon: <PieChart   size={13} strokeWidth={2} />, label: 'Pie'  },
]

export function ChartControls({ config, columns, onChange, onExportPng, onExportCsv, theme }: ChartControlsProps) {
  const { chartType, xAxis, yAxes } = config
  const dark = theme === 'dark'

  const cardBg  = dark ? '#0b1220' : '#f5f8f0'
  const border  = dark ? '#142030' : '#ccd9b8'
  const muted   = dark ? '#3e5a7a' : '#5a7240'
  const fg      = dark ? '#cdd8ee' : '#0d1a06'
  const primary = dark ? '#a3e635' : '#4d7c0f'
  const mutedBg = dark ? '#0e1928' : '#e2ebd6'
  const popover = dark ? '#0e1628' : '#ffffff'

  const selectStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    borderRadius: 6,
    padding: '5px 8px',
    border: `1px solid ${border}`,
    background: cardBg,
    color: fg,
    cursor: 'pointer',
    outline: 'none',
  }

  return (
    <div className="flex items-center gap-2.5 flex-wrap">

      {/* Chart type switcher */}
      <div
        className="flex items-center gap-0.5 rounded-lg p-0.5"
        style={{ background: mutedBg, border: `1px solid ${border}` }}
      >
        {CHART_TYPES.map(({ type, icon, label }) => (
          <button
            key={type}
            onClick={() => onChange({ chartType: type })}
            title={label}
            className={cn('flex items-center gap-1 px-2 py-1 rounded-md transition-all')}
            style={chartType === type
              ? { background: cardBg, color: primary, fontWeight: 700, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }
              : { color: muted }
            }
          >
            {icon}
            <span
              className="hidden sm:inline text-[10px] uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-display)', fontWeight: chartType === type ? 700 : 500 }}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="h-4 w-px" style={{ background: border }} />

      {/* X Axis */}
      <div className="flex items-center gap-1.5">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: muted }}>X</span>
        <select value={xAxis} onChange={(e) => onChange({ xAxis: e.target.value })} style={selectStyle}>
          {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {/* Y Axis */}
      <div className="flex items-center gap-1.5">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: muted }}>Y</span>
        <select value={yAxes[0] ?? ''} onChange={(e) => onChange({ yAxes: [e.target.value] })} style={selectStyle}>
          {columns.filter((c) => c.kind === 'numeric').map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {/* Y2 */}
      {chartType !== 'pie' && columns.filter((c) => c.kind === 'numeric').length > 1 && (
        <div className="flex items-center gap-1.5">
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: muted }}>Y2</span>
          <select
            value={yAxes[1] ?? ''}
            onChange={(e) => onChange({ yAxes: e.target.value ? [yAxes[0], e.target.value] : [yAxes[0]] })}
            style={selectStyle}
          >
            <option value="">—</option>
            {columns.filter((c) => c.kind === 'numeric' && c.name !== yAxes[0]).map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex-1" />

      {/* Export */}
      <details className="relative">
        <summary
          className="list-none cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider select-none transition-colors"
          style={{ fontFamily: 'var(--font-display)', color: muted, border: `1px solid ${border}`, background: cardBg }}
        >
          <Download size={12} />
          Export
        </summary>
        <div
          className="absolute right-0 top-full mt-1.5 z-50 w-48 rounded-xl py-1.5 overflow-hidden"
          style={{ background: popover, border: `1px solid ${border}`, boxShadow: '0 12px 32px rgba(0,0,0,0.3)' }}
        >
          <button
            onClick={onExportPng}
            className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 text-xs transition-colors"
            style={{ color: fg, background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = mutedBg)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <ImageIcon size={12} style={{ color: primary }} />
            Export as PNG
          </button>
          <button
            onClick={onExportCsv}
            className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 text-xs transition-colors"
            style={{ color: fg, background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = mutedBg)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <FileText size={12} style={{ color: dark ? '#f59e0b' : '#b45309' }} />
            Export as CSV
          </button>
        </div>
      </details>
    </div>
  )
}
