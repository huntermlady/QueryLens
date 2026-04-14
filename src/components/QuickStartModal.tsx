import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Table2, Keyboard, BarChart2, Lightbulb } from 'lucide-react'

interface QuickStartModalProps {
  open: boolean
  onClose: () => void
  theme: 'light' | 'dark'
}

const COLUMNS = [
  { name: 'season',   type: 'number', desc: 'Draft year (1980 – present)' },
  { name: 'round',    type: 'number', desc: 'Round number (1 – 7)' },
  { name: 'pick',     type: 'number', desc: 'Overall pick number' },
  { name: 'team',     type: 'text',   desc: 'Team abbreviation, e.g. DAL' },
  { name: 'pfr_name', type: 'text',   desc: 'Player name (Pro-Football-Reference)' },
  { name: 'position', type: 'text',   desc: 'Position code (QB, WR, LB…)' },
  { name: 'side',     type: 'text',   desc: '"offense" or "defense"' },
  { name: 'category', type: 'text',   desc: 'Position group, e.g. "Skill Position"' },
  { name: 'pfr_id',   type: 'text',   desc: 'Pro-Football-Reference player ID' },
  { name: 'player_id',type: 'text',   desc: 'Internal player identifier' },
]

const STEPS = [
  { n: '01', title: 'Write SQL', body: 'Query the draft_picks table using standard SQL — SELECT, WHERE, GROUP BY, ORDER BY, LIMIT, and aggregate functions are all supported.' },
  { n: '02', title: 'Run it',    body: 'Press ⌘↵ (Mac) or Ctrl+↵ (Windows) to execute, or click the Run Query button at the bottom of the editor.' },
  { n: '03', title: 'Visualize', body: 'Results appear instantly as a chart and a paginated table. Switch between Bar, Line, Area, and Pie charts and adjust the X / Y axes.' },
  { n: '04', title: 'Export',    body: 'Download your chart as a PNG image or export the raw result set as a CSV — use the Export menu in the chart controls toolbar.' },
]

const TIPS = [
  { code: "GROUP BY season ORDER BY season ASC", hint: 'Time-series → use Line or Area chart' },
  { code: "GROUP BY position ORDER BY picks DESC", hint: 'Categorical breakdown → use Bar or Pie' },
  { code: "WHERE position = 'QB' AND season >= 2000", hint: 'Filter before aggregating' },
  { code: "SUM(CASE WHEN round = 1 THEN 1 ELSE 0 END)", hint: 'Conditional counts with CASE WHEN' },
  { code: "LIMIT 15", hint: 'Keep charts readable — cap results' },
]

export function QuickStartModal({ open, onClose, theme }: QuickStartModalProps) {
  const isDark = theme === 'dark'

  // Colors
  const overlay    = 'rgba(0,0,0,0.6)'
  const bg         = isDark ? '#0b1422' : '#ffffff'
  const headerBg   = isDark ? '#070d18' : '#f0f5e9'
  const border     = isDark ? '#182338' : '#ccd9b8'
  const fg         = isDark ? '#cdd8ee' : '#0d1a06'
  const muted      = isDark ? '#3e5a7a' : '#5a7240'
  const primary    = isDark ? '#a3e635' : '#4d7c0f'
  const codeBg     = isDark ? '#04080f' : '#e8eddf'
  const codeFg     = isDark ? '#a3e635' : '#2d5a08'
  const pillNum    = isDark ? '#0e1928' : '#dce8cc'
  const pillBorder = isDark ? '#142030' : '#b8ccA0'
  const rowAlt     = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)'
  const typeNum    = isDark ? '#fbbf24' : '#b45309'
  const typeText   = isDark ? '#34d399' : '#0d6b45'

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: overlay, backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: bg, border: `1px solid ${border}`, boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}
      >

        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ background: headerBg, borderBottom: `1px solid ${border}` }}
        >
          <div>
            <h2
              className="text-xl font-bold uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-display)', color: fg, letterSpacing: '0.08em', lineHeight: 1.1 }}
            >
              <span style={{ color: primary }}>Quick</span> Start
            </h2>
            <p className="text-[11px] mt-0.5 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)', color: muted }}>
              NFL Draft Analytics · 1980 – Present
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg"
            style={{ color: muted }}
            onMouseEnter={e => { e.currentTarget.style.background = pillNum; e.currentTarget.style.color = fg }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = muted }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          {/* ── Schema ────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Table2 size={13} style={{ color: primary }} />
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-display)', color: muted, letterSpacing: '0.18em' }}
              >
                Available Table
              </span>
            </div>

            <div
              className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${border}` }}
            >
              {/* Table name pill */}
              <div
                className="flex items-center gap-3 px-4 py-2.5"
                style={{ background: headerBg, borderBottom: `1px solid ${border}` }}
              >
                <code
                  className="text-sm font-bold"
                  style={{ fontFamily: 'var(--font-mono)', color: primary }}
                >
                  draft_picks
                </code>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ fontFamily: 'var(--font-mono)', background: pillNum, border: `1px solid ${pillBorder}`, color: muted }}
                >
                  12,253 rows
                </span>
              </div>

              {/* Column list */}
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${border}`, background: headerBg }}>
                    <th className="px-4 py-2 text-left" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: muted }}>Column</th>
                    <th className="px-4 py-2 text-left" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: muted }}>Type</th>
                    <th className="px-4 py-2 text-left" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: muted }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {COLUMNS.map((col, i) => (
                    <tr
                      key={col.name}
                      style={{ background: i % 2 !== 0 ? rowAlt : 'transparent', borderBottom: i < COLUMNS.length - 1 ? `1px solid ${border}` : 'none' }}
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                        <code style={{ fontFamily: 'var(--font-mono)', color: fg, fontSize: 11 }}>{col.name}</code>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase"
                          style={{
                            fontFamily: 'var(--font-mono)',
                            color: col.type === 'number' ? typeNum : typeText,
                            background: col.type === 'number'
                              ? (isDark ? 'rgba(251,191,36,0.1)' : 'rgba(180,83,9,0.08)')
                              : (isDark ? 'rgba(52,211,153,0.1)' : 'rgba(13,107,69,0.08)'),
                          }}
                        >
                          {col.type}
                        </span>
                      </td>
                      <td className="px-4 py-2" style={{ color: muted, fontFamily: 'var(--font-sans)', fontSize: 11 }}>
                        {col.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── How it works ──────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Keyboard size={13} style={{ color: primary }} />
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-display)', color: muted, letterSpacing: '0.18em' }}
              >
                How It Works
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {STEPS.map(step => (
                <div
                  key={step.n}
                  className="rounded-xl p-4"
                  style={{ background: headerBg, border: `1px solid ${border}` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ fontFamily: 'var(--font-mono)', background: pillNum, border: `1px solid ${pillBorder}`, color: primary }}
                    >
                      {step.n}
                    </span>
                    <span
                      className="text-sm font-bold uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-display)', color: fg, letterSpacing: '0.06em' }}
                    >
                      {step.title}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: muted }}>
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── SQL Tips ─────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={13} style={{ color: primary }} />
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-display)', color: muted, letterSpacing: '0.18em' }}
              >
                SQL Tips
              </span>
            </div>

            <div className="space-y-2">
              {TIPS.map(tip => (
                <div
                  key={tip.code}
                  className="flex items-start gap-3 rounded-lg px-3.5 py-2.5"
                  style={{ background: headerBg, border: `1px solid ${border}` }}
                >
                  <div
                    className="flex-1 rounded-md px-2.5 py-1.5 text-[11px] leading-relaxed"
                    style={{ fontFamily: 'var(--font-mono)', background: codeBg, color: codeFg, whiteSpace: 'pre' }}
                  >
                    {tip.code}
                  </div>
                  <span className="text-[11px] leading-relaxed mt-1 text-right" style={{ color: muted, minWidth: 160 }}>
                    {tip.hint}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Chart types ──────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 size={13} style={{ color: primary }} />
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-display)', color: muted, letterSpacing: '0.18em' }}
              >
                Chart Types
              </span>
            </div>

            <div
              className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${border}` }}
            >
              {[
                { type: 'Bar',  when: 'Comparing values across categories — best for ranked lists and team totals' },
                { type: 'Line', when: 'Trends over time — pair with a season or year on the X axis' },
                { type: 'Area', when: 'Same as Line but emphasises volume — good for cumulative picks' },
                { type: 'Pie',  when: 'Part-to-whole — works best with ≤ 8 slices and a count/sum Y axis' },
              ].map((c, i, arr) => (
                <div
                  key={c.type}
                  className="flex items-start gap-3 px-4 py-3"
                  style={{ borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none', background: i % 2 !== 0 ? rowAlt : 'transparent' }}
                >
                  <span
                    className="text-xs font-bold uppercase tracking-wide shrink-0 mt-px"
                    style={{ fontFamily: 'var(--font-display)', color: primary, width: 36 }}
                  >
                    {c.type}
                  </span>
                  <span className="text-[11px] leading-relaxed" style={{ color: muted }}>{c.when}</span>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 shrink-0 flex items-center justify-between"
          style={{ background: headerBg, borderTop: `1px solid ${border}` }}
        >
          <span className="text-[10px] uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)', color: muted }}>
            Powered by AlaSQL · in-browser SQL engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-display)', background: primary, color: isDark ? '#0a1400' : '#fff', border: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Got it
          </button>
        </div>

      </div>
    </div>,
    document.body
  )
}
