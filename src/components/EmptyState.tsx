interface EmptyStateProps {
  onRunExample: () => void
  theme: 'light' | 'dark'
}

export function EmptyState({ onRunExample, theme }: EmptyStateProps) {
  const isDark = theme === 'dark'
  const fg     = isDark ? '#cdd8ee' : '#0d1a06'
  const muted  = isDark ? '#3e5a7a' : '#5a7240'
  const cardBg = isDark ? '#0b1220' : '#f5f8f0'
  const border = isDark ? '#142030' : '#ccd9b8'

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-8 text-center select-none">

      {/* Football field art */}
      <div className="relative w-56 h-28 opacity-30" style={{ borderRadius: 10, overflow: 'hidden' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #166534 0%, #15803d 100%)' }} />
        {[20, 35, 50, 65, 80].map((pct) => (
          <div key={pct} className="absolute top-0 bottom-0 w-px" style={{ left: `${pct}%`, background: 'rgba(255,255,255,0.35)' }} />
        ))}
        <div className="absolute inset-y-0 left-0 w-[12%]" style={{ background: 'rgba(0,0,0,0.3)' }} />
        <div className="absolute inset-y-0 right-0 w-[12%]" style={{ background: 'rgba(0,0,0,0.3)' }} />
        {[30, 40, 50, 60, 70].map((pct) => (
          <div key={pct} className="absolute" style={{ left: `${pct}%`, top: '35%', transform: 'translateX(-50%)' }}>
            <div className="w-2 h-px" style={{ background: 'rgba(255,255,255,0.5)' }} />
          </div>
        ))}
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold" style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.1em' }}>
          50
        </div>
      </div>

      <div className="space-y-2.5">
        <h3
          className="text-2xl font-bold uppercase tracking-wide"
          style={{ fontFamily: 'var(--font-display)', color: fg, letterSpacing: '0.06em' }}
        >
          Ready for Kickoff
        </h3>
        <p className="text-sm leading-relaxed max-w-xs" style={{ color: muted }}>
          Write a SQL query against{' '}
          <code
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ fontFamily: 'var(--font-mono)', background: cardBg, border: `1px solid ${border}`, color: fg }}
          >
            draft_picks
          </code>{' '}
          and press{' '}
          <kbd
            className="px-1.5 py-0.5 text-xs rounded"
            style={{ fontFamily: 'var(--font-mono)', background: cardBg, border: `1px solid ${border}`, color: fg }}
          >
            ⌘↵
          </kbd>{' '}
          to run.
        </p>
      </div>

      <button onClick={onRunExample} className="run-btn px-6 py-2.5 text-sm">
        Try an Example
      </button>
    </div>
  )
}
