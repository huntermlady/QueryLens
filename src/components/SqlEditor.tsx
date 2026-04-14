import { useRef, useCallback, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { EditorView, keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'
import { ChevronDown, Loader2, Zap } from 'lucide-react'
import { exampleQueries } from '@/data/exampleQueries'
import type { QueryStatus } from '@/hooks/useQueryRunner'
import type { QueryResult } from '@/types'

interface SqlEditorProps {
  value: string
  onChange: (value: string) => void
  onRun: () => void
  status: QueryStatus
  result: QueryResult | null
  theme: 'light' | 'dark'
  onSelectExample: (sql: string) => void
}

// Dark theme — navy + lime
const darkEditorTheme = EditorView.theme({
  '&': { backgroundColor: '#04080f !important', color: '#bdd0ec', height: '100%' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { backgroundColor: '#04080f !important' },
  '.cm-content': { caretColor: '#a3e635', color: '#bdd0ec', backgroundColor: '#04080f !important' },
  '.cm-cursor': { borderLeftColor: '#a3e635 !important', borderLeftWidth: '2px !important' },
  '.cm-activeLine': { backgroundColor: 'rgba(163,230,53,0.04) !important' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(163,230,53,0.04) !important' },
  '.cm-gutters': { backgroundColor: '#070d18 !important', borderRight: '1px solid #182338 !important', color: '#2e4a6e' },
  '.cm-gutterElement': { color: '#2e4a6e !important', paddingLeft: '6px !important', paddingRight: '10px !important' },
  '.cm-selectionBackground': { backgroundColor: 'rgba(163,230,53,0.12) !important' },
  '.cm-focused .cm-selectionBackground': { backgroundColor: 'rgba(163,230,53,0.12) !important' },
  '.cm-line': { paddingLeft: '6px' },
  '.tok-keyword': { color: '#a3e635 !important', fontWeight: '500' },
  '.tok-number': { color: '#fbbf24 !important' },
  '.tok-string': { color: '#34d399 !important' },
  '.tok-comment': { color: '#2e4a6e !important', fontStyle: 'italic' },
  '.tok-operator': { color: '#7dd3fc !important' },
  '.tok-name': { color: '#bdd0ec !important' },
}, { dark: true })

// Light theme — earthy sage
const lightEditorTheme = EditorView.theme({
  '&': { backgroundColor: '#f0f4eb !important', color: '#1a2e08', height: '100%' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { backgroundColor: '#f0f4eb !important' },
  '.cm-content': { caretColor: '#4d7c0f', color: '#1a2e08', backgroundColor: '#f0f4eb !important' },
  '.cm-cursor': { borderLeftColor: '#4d7c0f !important', borderLeftWidth: '2px !important' },
  '.cm-activeLine': { backgroundColor: 'rgba(77,124,15,0.07) !important' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(77,124,15,0.07) !important' },
  '.cm-gutters': { backgroundColor: '#e2edda !important', borderRight: '1px solid #c4d8a8 !important', color: '#7a9a58' },
  '.cm-gutterElement': { color: '#7a9a58 !important', paddingLeft: '6px !important', paddingRight: '10px !important' },
  '.cm-selectionBackground': { backgroundColor: 'rgba(77,124,15,0.18) !important' },
  '.cm-focused .cm-selectionBackground': { backgroundColor: 'rgba(77,124,15,0.18) !important' },
  '.cm-line': { paddingLeft: '6px' },
  '.tok-keyword': { color: '#3a6b08 !important', fontWeight: '600' },
  '.tok-number': { color: '#b45309 !important' },
  '.tok-string': { color: '#0d6b45 !important' },
  '.tok-comment': { color: '#8a9a70 !important', fontStyle: 'italic' },
  '.tok-operator': { color: '#1d4e8f !important' },
  '.tok-name': { color: '#1a2e08 !important' },
}, { dark: false })

export function SqlEditor({
  value,
  onChange,
  onRun,
  status,
  result,
  theme,
  onSelectExample,
}: SqlEditorProps) {
  const dropdownRef = useRef<HTMLDetailsElement>(null)
  const isDark = theme === 'dark'

  const handleRun = useCallback(() => {
    if (status === 'running') return
    onRun()
  }, [status, onRun])

  const runKeymap = useMemo(() => Prec.highest(
    keymap.of([{
      key: 'Mod-Enter',
      run: () => { handleRun(); return true },
    }])
  ), [handleRun])

  const extensions = useMemo(
    () => [sql(), runKeymap, isDark ? darkEditorTheme : lightEditorTheme],
    [runKeymap, isDark]
  )

  // ── Panel colors swap with theme ──
  const panelBg     = isDark ? '#070d18' : '#e8eddf'
  const panelBorder = isDark ? '#182338' : '#ccd9b8'
  const editorBg    = isDark ? '#04080f' : '#f0f4eb'
  const labelColor  = isDark ? '#3e5a7a' : '#7a9a58'
  const statusColor = isDark ? '#2e4a6e' : '#9ab077'

  return (
    <div className="flex flex-col h-full" style={{ background: editorBg }}>

      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ background: panelBg, borderBottom: `1px solid ${panelBorder}` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 rounded-full" style={{ background: isDark ? '#a3e635' : '#4d7c0f' }} />
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)', color: labelColor, letterSpacing: '0.18em' }}
          >
            SQL Editor
          </span>
        </div>

        {/* Examples dropdown */}
        <details ref={dropdownRef} className="relative">
          <summary
            className="list-none cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors select-none"
            style={{ fontFamily: 'var(--font-display)', color: labelColor, letterSpacing: '0.12em' }}
          >
            Examples
            <ChevronDown size={11} />
          </summary>
          <div
            className="absolute right-0 top-full mt-1.5 z-50 w-80 py-1.5 overflow-hidden rounded-xl"
            style={{
              background: isDark ? '#0b1422' : '#f5f8f0',
              border: `1px solid ${panelBorder}`,
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
            }}
          >
            <div className="px-3 pb-1.5 mb-1" style={{ borderBottom: `1px solid ${panelBorder}` }}>
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-display)', color: labelColor }}
              >
                Example Queries
              </span>
            </div>
            {exampleQueries.map((q) => (
              <button
                key={q.label}
                onClick={() => {
                  onSelectExample(q.sql)
                  dropdownRef.current?.removeAttribute('open')
                }}
                className="w-full text-left px-3 py-2.5 transition-colors"
                style={{ background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(163,230,53,0.05)' : 'rgba(77,124,15,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  className="text-xs font-semibold mb-0.5"
                  style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: isDark ? '#7ea8cc' : '#2d4a0e', letterSpacing: '0.02em' }}
                >
                  {q.label}
                </div>
                <div className="text-[11px]" style={{ color: labelColor, fontFamily: 'var(--font-mono)' }}>
                  {q.description}
                </div>
              </button>
            ))}
          </div>
        </details>
      </div>

      {/* CodeMirror */}
      <div
        className="flex-1 overflow-hidden"
        style={{ background: isDark ? '#04080f' : '#f0f4eb' }}
      >
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extensions}
          theme='none'
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: false,
            drawSelection: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: false,
            crosshairCursor: false,
            highlightActiveLine: true,
            highlightSelectionMatches: false,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: false,
            historyKeymap: true,
            foldKeymap: false,
            completionKeymap: true,
            lintKeymap: false,
          }}
          style={{ height: '100%' }}
        />
      </div>

      {/* Status bar */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ background: panelBg, borderTop: `1px solid ${panelBorder}` }}
      >
        <div className="flex items-center gap-3 h-5">
          {status === 'success' && result && (
            <div className="flex items-center gap-3 animate-fade-in">
              <span className="flex items-center gap-1.5 text-[11px]" style={{ color: isDark ? '#34d399' : '#15803d', fontFamily: 'var(--font-mono)' }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: isDark ? '#34d399' : '#15803d' }} />
                {result.rows.length.toLocaleString()} rows
              </span>
              <span className="text-[11px]" style={{ color: statusColor, fontFamily: 'var(--font-mono)' }}>
                {result.duration}ms
              </span>
            </div>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1.5 text-[11px] animate-fade-in" style={{ color: '#f87171', fontFamily: 'var(--font-mono)' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#f87171' }} />
              Query error
            </span>
          )}
          {(status === 'idle' || status === 'running') && (
            <span className="text-[11px]" style={{ color: statusColor, fontFamily: 'var(--font-mono)' }}>
              {status === 'running' ? 'Running…' : '⌘↵ to run'}
            </span>
          )}
        </div>

        <button
          onClick={handleRun}
          disabled={status === 'running'}
          className="run-btn flex items-center gap-2 px-5 py-1.5"
        >
          {status === 'running'
            ? <Loader2 size={13} className="animate-spin" />
            : <Zap size={13} className="fill-current" />
          }
          {status === 'running' ? 'Running' : 'Run Query'}
        </button>
      </div>
    </div>
  )
}
