import { useState, useEffect, type ReactNode } from 'react'
import { initDataset } from '@/utils/queryEngine'
import { AlertCircle } from 'lucide-react'

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
          className="inline-block w-1 h-1 rounded-full bg-[var(--color-primary)]"
          style={{ animation: `dot-pulse 1.4s ease-in-out ${i * 0.16}s infinite` }}
        />
      ))}
    </span>
  )
}

export function AppLoader({ children }: AppLoaderProps) {
  const [state, setState] = useState<LoadState>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    initDataset()
      .then(() => {
        setState('ready')
        // Brief hold so the "100%" bar is visible before unmounting
        setTimeout(() => setVisible(false), 320)
      })
      .catch((err: unknown) => {
        setErrorMsg(err instanceof Error ? err.message : String(err))
        setState('error')
      })
  }, [])

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
            className="text-6xl font-display font-bold uppercase tracking-wider"
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
          <>
            {/* Progress bar */}
            <div className="w-64 space-y-3">
              <div className="w-full h-0.5 rounded-full overflow-hidden" style={{ background: '#142030' }}>
                <div
                  className="h-full rounded-full animate-progress-fill"
                  style={{ background: 'linear-gradient(90deg, #4d7c0f, #a3e635, #bef264)', boxShadow: '0 0 8px rgba(163,230,53,0.6)' }}
                />
              </div>
              <p
                className="text-xs"
                style={{ fontFamily: 'var(--font-mono)', color: '#3e5a7a', letterSpacing: '0.05em' }}
              >
                Loading draft picks since 1980
                <LoadingDots />
              </p>
            </div>

            {/* Yard markers decoration */}
            <div className="flex items-center gap-3 opacity-20">
              {['10', '20', '30', '40', '50', '40', '30', '20', '10'].map((n, i) => (
                <span
                  key={i}
                  className="text-[9px] font-bold"
                  style={{ fontFamily: 'var(--font-display)', color: '#a3e635', letterSpacing: '0.05em' }}
                >
                  {n}
                </span>
              ))}
            </div>
          </>
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
              <p className="text-sm font-semibold" style={{ color: '#cdd8ee' }}>Failed to load dataset</p>
              <p className="text-xs" style={{ color: '#3e5a7a', fontFamily: 'var(--font-mono)' }}>
                draft_picks.csv must be in the data/ folder
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
            <button
              onClick={() => window.location.reload()}
              className="run-btn px-6 py-2 text-sm"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
