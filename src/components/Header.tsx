import { useState, useRef } from 'react'
import { Moon, Sun, HelpCircle, Upload } from 'lucide-react'
import type { Theme } from '@/hooks/useTheme'
import type { UploadedTable } from '@/types'
import { QuickStartModal } from '@/components/QuickStartModal'

interface HeaderProps {
  theme: Theme
  onToggleTheme: () => void
  rowCount: number
  uploadedCount: number
  onUpload: (file: File) => void
  uploadedTables: UploadedTable[]
}

export function Header({ theme, onToggleTheme, rowCount, uploadedCount, onUpload, uploadedTables }: HeaderProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isDark  = theme === 'dark'
  const bg      = isDark ? 'rgba(11,18,32,0.95)' : 'rgba(245,248,240,0.95)'
  const border  = isDark ? '#142030' : '#ccd9b8'
  const fg      = isDark ? '#cdd8ee' : '#0d1a06'
  const muted   = isDark ? '#3e5a7a' : '#5a7240'
  const primary = isDark ? '#a3e635' : '#4d7c0f'
  const pill    = isDark ? '#0e1928' : '#e2ebd6'
  const success = isDark ? '#34d399' : '#15803d'

  const tableCount = 7 + uploadedCount
  const pillLabel  = uploadedCount > 0 ? `${tableCount} tables` : '7 tables'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
      // reset so the same file can be re-selected if needed
      e.target.value = ''
    }
  }

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-5 h-[52px] shrink-0 backdrop-blur-md"
      style={{ background: bg, borderBottom: `1px solid ${border}` }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-3">
        <span
          className="text-xl font-bold uppercase"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em', lineHeight: 1 }}
        >
          <span style={{ color: primary }}>Query</span>
          <span style={{ color: fg }}>Lens</span>
        </span>

        {/* Dataset pill */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: pill, border: `1px solid ${border}` }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: success }} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: success }} />
          </span>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-display)', color: muted }}
          >
            {pillLabel}
          </span>
          <span style={{ color: border, fontSize: 10 }}>·</span>
          <span className="text-[10px]" style={{ color: muted, fontFamily: 'var(--font-mono)' }}>
            {rowCount > 0 ? rowCount.toLocaleString() : '…'} rows
          </span>
        </div>
      </div>

      {/* Center subtitle */}
      <p
        className="hidden md:block text-[11px] uppercase tracking-widest select-none absolute left-1/2 -translate-x-1/2"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: muted, letterSpacing: '0.25em' }}
      >
        NFL Draft Analytics · 1980 – Present
      </p>

      {/* Right controls */}
      <div className="flex items-center gap-1">

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg transition-colors"
          style={{ color: muted }}
          onMouseEnter={e => { e.currentTarget.style.background = pill; e.currentTarget.style.color = fg }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = muted }}
          title="Upload CSV"
        >
          <Upload size={15} strokeWidth={2} />
        </button>

        {/* Quick Start button */}
        <button
          onClick={() => setModalOpen(true)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: muted }}
          onMouseEnter={e => { e.currentTarget.style.background = pill; e.currentTarget.style.color = fg }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = muted }}
          title="Quick Start"
        >
          <HelpCircle size={15} strokeWidth={2} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg transition-colors"
          style={{ color: muted }}
          onMouseEnter={e => { e.currentTarget.style.background = pill; e.currentTarget.style.color = fg }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = muted }}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />}
        </button>
      </div>

      <QuickStartModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        theme={theme}
        uploadedTables={uploadedTables}
        onUpload={onUpload}
      />
    </header>
  )
}
