import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import type { QueryResult, ChartConfig } from '@/types'
import { useState } from 'react'

// Night-game palette: lime, amber, cyan, rose, violet, emerald, orange, sky, fuchsia, red
const PALETTE = [
  '#a3e635', '#f59e0b', '#22d3ee', '#fb7185', '#a78bfa',
  '#34d399', '#fb923c', '#38bdf8', '#e879f9', '#f87171',
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3.5 py-3"
      style={{
        background: 'var(--color-popover)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
        minWidth: 140,
      }}
    >
      {label && (
        <div
          className="mb-2 pb-1.5 text-[10px] uppercase tracking-widest font-bold"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-muted-foreground)',
            borderBottom: '1px solid var(--color-border)',
            letterSpacing: '0.15em',
          }}
        >
          {label}
        </div>
      )}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-[11px]" style={{ color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-sans)' }}>
              {entry.name}
            </span>
          </div>
          <span
            className="text-[11px] font-semibold tabular-nums"
            style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-mono)' }}
          >
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}


interface ChartRendererProps {
  result: QueryResult
  config: ChartConfig
}

const labelStyle = {
  fontSize: 10,
  fill: 'var(--color-muted-foreground)',
  fontFamily: 'var(--font-mono)',
}

const axisStyle = {
  stroke: 'var(--color-border)',
}

function formatTick(value: unknown): string {
  if (typeof value === 'string' && value.length > 14) return value.slice(0, 12) + '…'
  return String(value)
}

function formatNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function ChartRenderer({ result, config }: ChartRendererProps) {
  const [, setActivePieIndex] = useState(0)
  const { rows } = result
  const { chartType, xAxis, yAxes } = config

  if (!xAxis || yAxes.length === 0 || rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-muted-foreground)] text-sm">
        Select X and Y axes to render chart
      </div>
    )
  }

  const commonProps = {
    data: rows,
    margin: { top: 8, right: 24, left: 8, bottom: 8 },
  }

  const xAxisProps = {
    dataKey: xAxis,
    tick: { ...labelStyle },
    tickLine: false,
    axisLine: axisStyle,
    tickFormatter: formatTick,
  }

  const yAxisProps = {
    tick: { ...labelStyle },
    tickLine: false,
    axisLine: false,
    tickFormatter: formatNumber,
    width: 64,
  }

  const gridProps = {
    strokeDasharray: '3 3',
    stroke: 'var(--color-border)',
    vertical: false,
  }

  const legendProps = {
    wrapperStyle: { fontSize: 11, paddingTop: 8 },
  }

  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart {...commonProps}>
          <CartesianGrid {...gridProps} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }} />
          <Legend {...legendProps} />
          {yAxes.map((key, i) => (
            <Bar key={key} dataKey={key} fill={PALETTE[i % PALETTE.length]} radius={[3, 3, 0, 0]} maxBarSize={48} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart {...commonProps}>
          <CartesianGrid {...gridProps} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Legend {...legendProps} />
          {yAxes.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={2}
              dot={rows.length <= 30 ? { r: 3, fill: PALETTE[i % PALETTE.length] } : false}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (chartType === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart {...commonProps}>
          <defs>
            {yAxes.map((key, i) => (
              <linearGradient key={key} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.2} />
                <stop offset="95%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Legend {...legendProps} />
          {yAxes.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={2}
              fill={`url(#grad-${i})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  // Pie
  const nameKey = xAxis
  const valueKey = yAxes[0]
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={rows}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius="30%"
          outerRadius="60%"
          onMouseEnter={(_, index) => setActivePieIndex(index)}
        >
          {rows.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend {...legendProps} />
      </PieChart>
    </ResponsiveContainer>
  )
}
