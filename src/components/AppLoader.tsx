import { useState, useEffect, type ReactNode } from 'react'
import { initDataset, TABLES } from '@/utils/queryEngine'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface AppLoaderProps {
  children: ReactNode
}

type LoadState = 'loading' | 'ready' | 'error'

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-1 h-1 rounded-full"
          style={{ background: '#a3e635', animation: `dot-pulse 1.4s ease-in-out ${i * 0.16}s infinite` }}
        />
      ))}
    </span>
  )
}

export function AppLoader({ children }: AppLoaderProps) {
  const [state, setState] = useState<LoadState>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [visible, setVisible] = useState(true)
  const [loaded, setLoaded] = useState(0)
  const [currentLabel, setCurrentLabel] = useState(TABLES[0].label)

  const total = TABLES.length
  const pct = Math.round((loaded / total) * 100)

  useEffect(() => {
    initDataset((done, _total, label) => {
      setLoaded(done)
      setCurrentLabel(label)
    })
      .then(() => {
        setLoaded(total)
        setState('ready')
        setTimeout(() => setVisible(false), 420)
      })
      .catch((err: unknown) => {
        setErrorMsg(err instanceof Error ? err.message : String(err))
        setState('error')
      })
  }, [total])

  if (!visible && state === 'ready') return <>{children}</>

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: '#060b15' }}
    >
      {/* Dot-grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #1a2f4a 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, #060b15 100%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-8 px-8 text-center">
        {/* Logo */}
        <div className="space-y-1">
          <h1
            className="text-6xl font-bold uppercase"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.1em', lineHeight: 1 }}
          >
            <span style={{ color: '#a3e635' }}>Query</span>
            <span style={{ color: '#cdd8ee' }}>Lens</span>
          </h1>
          <p
            className="text-xs uppercase tracking-[0.3em] font-semibold"
            style={{ fontFamily: 'var(--font-display)', color: '#3e5a7a' }}
          >
            NFL Draft Analytics
          </p>
        </div>

        {state === 'loading' && (
          <div className="w-72 space-y-4">
            {/* Overall progress bar */}
            <div className="space-y-1.5">
              <div className="w-full h-0.5 rounded-full overflow-hidden" style={{ background: '#142030' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, #4d7c0f, #a3e635, #bef264)',
                    boxShadow: '0 0 8px rgba(163,230,53,0.6)',
                    transition: 'width 0.35s ease',
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: '#3e5a7a' }}>
                  {loaded < total ? (
                    <span>
                      Loading {currentLabel}
                      <LoadingDots />
                    </span>
                  ) : (
                    <span style={{ color: '#a3e635' }}>Ready</span>
                  )}
                </p>
                <p className="text-[11px] tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: '#3e5a7a' }}>
                  {loaded}/{total}
                </p>
              </div>
            </div>

            {/* Per-table checklist */}
            <div
              className="rounded-xl overflow-hidden text-left"
              style={{ border: '1px solid #142030', background: '#070d18' }}
            >
              {TABLES.map((t, i) => {
                const done = i < loaded
                const active = i === loaded
                return (
                  <div
                    key={t.name}
                    className="flex items-center gap-2.5 px-3 py-2"
                    style={{
                      borderBottom: i < TABLES.length - 1 ? '1px solid #0e1928' : 'none',
                      opacity: done || active ? 1 : 0.35,
                    }}
                  >
                    {done ? (
                      <CheckCircle2 size={11} style={{ color: '#a3e635', flexShrink: 0 }} />
                    ) : (
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 border"
                        style={{ borderColor: active ? '#a3e635' : '#142030', background: 'transparent' }}
                      />
                    )}
                    <code
                      className="text-[11px]"
                      style={{ fontFamily: 'var(--font-mono)', color: done ? '#a3e635' : active ? '#cdd8ee' : '#3e5a7a' }}
                    >
                      {t.name}
                    </code>
                    <span className="text-[10px] ml-auto" style={{ color: '#2e4a6e', fontFamily: 'var(--font-sans)' }}>
                      {t.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Yard markers */}
            <div className="flex items-center justify-center gap-3 opacity-20">
              {['10', '20', '30', '40', '50', '40', '30', '20', '10'].map((n, i) => (
                <span
                  key={i}
                  className="text-[9px] font-bold"
                  style={{ fontFamily: 'var(--font-display)', color: '#a3e635' }}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center gap-4 max-w-sm">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(248,113,113,0.1)' }}
            >
              <AlertCircle size={22} style={{ color: '#f87171' }} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold" style={{ color: '#cdd8ee' }}>Failed to load datasets</p>
              <p className="text-xs" style={{ color: '#3e5a7a', fontFamily: 'var(--font-mono)' }}>
                CSV files must be in the data/ folder
              </p>
            </div>
            {errorMsg && (
              <pre
                className="w-full text-left text-xs px-3 py-2 rounded-lg whitespace-pre-wrap break-all"
                style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', fontFamily: 'var(--font-mono)' }}
              >
                {errorMsg}
              </pre>
            )}
            <button onClick={() => window.location.reload()} className="run-btn px-6 py-2 text-sm">
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
