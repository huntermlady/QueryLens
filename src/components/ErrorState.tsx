import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  error: string
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center animate-slide-up">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}
      >
        <AlertTriangle size={20} style={{ color: 'var(--color-destructive)' }} />
      </div>

      <div className="space-y-1.5">
        <h3
          className="text-lg font-bold uppercase tracking-wide"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)', letterSpacing: '0.06em' }}
        >
          Query Error
        </h3>
        <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
          Your SQL couldn't be executed. Check the syntax and try again.
        </p>
      </div>

      <div
        className="w-full max-w-md rounded-xl px-4 py-3 text-left"
        style={{
          background: 'rgba(248,113,113,0.06)',
          border: '1px solid rgba(248,113,113,0.15)',
        }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-destructive)' }} />
          <span
            className="text-[10px] uppercase tracking-widest font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-destructive)', letterSpacing: '0.15em' }}
          >
            Error Message
          </span>
        </div>
        <pre
          className="text-xs whitespace-pre-wrap break-all leading-relaxed"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-destructive)' }}
        >
          {error}
        </pre>
      </div>
    </div>
  )
}
