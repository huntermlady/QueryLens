import { createPortal } from 'react-dom'
import { Upload } from 'lucide-react'

interface DropOverlayProps {
  theme: 'light' | 'dark'
}

export function DropOverlay({ theme }: DropOverlayProps) {
  const isDark = theme === 'dark'
  const primary = isDark ? '#a3e635' : '#4d7c0f'
  const bg      = isDark ? 'rgba(6,11,21,0.92)' : 'rgba(238,242,232,0.92)'
  const border  = isDark ? 'rgba(163,230,53,0.4)' : 'rgba(77,124,15,0.4)'
  const fg      = isDark ? '#cdd8ee' : '#0d1a06'
  const muted   = isDark ? '#3e5a7a' : '#5a7240'

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: bg, backdropFilter: 'blur(6px)' }}
    >
      <div
        className="flex flex-col items-center gap-5 px-16 py-12 rounded-2xl"
        style={{
          border: `2px dashed ${border}`,
          background: isDark ? 'rgba(11,18,32,0.6)' : 'rgba(245,248,240,0.7)',
          boxShadow: isDark
            ? `0 0 60px rgba(163,230,53,0.08), inset 0 0 60px rgba(163,230,53,0.03)`
            : `0 0 60px rgba(77,124,15,0.1)`,
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: isDark ? 'rgba(163,230,53,0.1)' : 'rgba(77,124,15,0.08)',
            border: `1px solid ${border}`,
          }}
        >
          <Upload size={28} style={{ color: primary }} />
        </div>

        <div className="text-center space-y-1.5">
          <p
            className="text-2xl font-bold uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-display)', color: fg, letterSpacing: '0.08em' }}
          >
            Drop to Import
          </p>
          <p className="text-sm" style={{ color: muted }}>
            CSV will be registered as a queryable table
          </p>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px]"
          style={{
            fontFamily: 'var(--font-mono)',
            background: isDark ? 'rgba(163,230,53,0.06)' : 'rgba(77,124,15,0.06)',
            border: `1px solid ${border}`,
            color: primary,
          }}
        >
          <span style={{ opacity: 0.6 }}>SELECT * FROM</span>
          <span>your_file</span>
        </div>
      </div>
    </div>,
    document.body
  )
}
