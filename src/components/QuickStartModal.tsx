import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Table2, Keyboard, BarChart2, Lightbulb } from 'lucide-react'

interface QuickStartModalProps {
  open: boolean
  onClose: () => void
  theme: 'light' | 'dark'
}

interface ColDef { name: string; type: 'number' | 'text'; desc: string }
interface TableDef { name: string; rows: string; desc: string; cols: ColDef[] }

const SCHEMA: TableDef[] = [
  {
    name: 'draft_picks', rows: '~12,253', desc: 'NFL Draft selections 1980 – present',
    cols: [
      { name: 'season',    type: 'number', desc: 'Draft year' },
      { name: 'round',     type: 'number', desc: 'Round number (1–7)' },
      { name: 'pick',      type: 'number', desc: 'Overall pick number' },
      { name: 'team',      type: 'text',   desc: 'Team abbreviation' },
      { name: 'pfr_name',  type: 'text',   desc: 'Player name' },
      { name: 'position',  type: 'text',   desc: 'Position code (QB, WR…)' },
      { name: 'side',      type: 'text',   desc: '"offense" or "defense"' },
      { name: 'category',  type: 'text',   desc: 'Position group' },
      { name: 'pfr_id',    type: 'text',   desc: 'Pro-Football-Reference ID' },
    ],
  },
  {
    name: 'games', rows: '~6,500', desc: 'Game results, scores & betting lines',
    cols: [
      { name: 'season',        type: 'number', desc: 'Season year' },
      { name: 'week',          type: 'number', desc: 'Week number' },
      { name: 'game_type',     type: 'text',   desc: 'REG, WC, DIV, CON, SB' },
      { name: 'away_team',     type: 'text',   desc: 'Away team abbreviation' },
      { name: 'home_team',     type: 'text',   desc: 'Home team abbreviation' },
      { name: 'away_score',    type: 'number', desc: 'Away team score' },
      { name: 'home_score',    type: 'number', desc: 'Home team score' },
      { name: 'spread_line',   type: 'number', desc: 'Opening spread' },
      { name: 'total_line',    type: 'number', desc: 'Over/under total' },
      { name: 'away_qb_name',  type: 'text',   desc: 'Starting QB (away)' },
      { name: 'home_qb_name',  type: 'text',   desc: 'Starting QB (home)' },
    ],
  },
  {
    name: 'standings', rows: '~800', desc: 'Season W/L records by team',
    cols: [
      { name: 'season',   type: 'number', desc: 'Season year' },
      { name: 'team',     type: 'text',   desc: 'Team abbreviation' },
      { name: 'conf',     type: 'text',   desc: 'AFC or NFC' },
      { name: 'division', type: 'text',   desc: 'Division name' },
      { name: 'wins',     type: 'number', desc: 'Regular season wins' },
      { name: 'losses',   type: 'number', desc: 'Regular season losses' },
      { name: 'ties',     type: 'number', desc: 'Ties' },
      { name: 'pct',      type: 'number', desc: 'Win percentage' },
      { name: 'seed',     type: 'number', desc: 'Playoff seed (if applicable)' },
    ],
  },
  {
    name: 'rosters', rows: '~30,000', desc: 'Player roster entries by season & team',
    cols: [
      { name: 'season',    type: 'number', desc: 'Season year' },
      { name: 'team',      type: 'text',   desc: 'Team abbreviation' },
      { name: 'full_name', type: 'text',   desc: 'Player full name' },
      { name: 'position',  type: 'text',   desc: 'Position code' },
      { name: 'side',      type: 'text',   desc: '"O" (offense) or "D" (defense)' },
      { name: 'category',  type: 'text',   desc: 'Position group' },
      { name: 'games',     type: 'number', desc: 'Games played' },
      { name: 'starts',    type: 'number', desc: 'Games started' },
      { name: 'av',        type: 'number', desc: 'Approximate Value (PFR)' },
      { name: 'pfr_id',    type: 'text',   desc: 'Pro-Football-Reference ID (join key)' },
    ],
  },
  {
    name: 'trades', rows: '~5,000', desc: 'Trade history between franchises',
    cols: [
      { name: 'season',     type: 'number', desc: 'Season of trade' },
      { name: 'trade_date', type: 'text',   desc: 'Date of transaction' },
      { name: 'gave',       type: 'text',   desc: 'Team that gave the asset' },
      { name: 'received',   type: 'text',   desc: 'Team that received the asset' },
      { name: 'pfr_name',   type: 'text',   desc: 'Player traded (if applicable)' },
      { name: 'pick_season',type: 'number', desc: 'Year of pick traded' },
      { name: 'pick_round', type: 'number', desc: 'Round of pick traded' },
    ],
  },
  {
    name: 'draft_values', rows: '~261', desc: 'Pick value models keyed on pick number',
    cols: [
      { name: 'pick',    type: 'number', desc: 'Overall pick number (JOIN key)' },
      { name: 'stuart',  type: 'number', desc: 'Stuart pick value model' },
      { name: 'johnson', type: 'number', desc: 'Johnson pick value model' },
      { name: 'hill',    type: 'number', desc: 'Hill pick value model' },
      { name: 'otc',     type: 'number', desc: 'Over The Cap value model' },
      { name: 'pff',     type: 'number', desc: 'PFF pick value model' },
    ],
  },
  {
    name: 'win_totals', rows: '~400', desc: 'Preseason over/under win total lines',
    cols: [
      { name: 'season',     type: 'number', desc: 'Season year' },
      { name: 'team',       type: 'text',   desc: 'Team abbreviation' },
      { name: 'line',       type: 'number', desc: 'Projected win total' },
      { name: 'over_odds',  type: 'number', desc: 'Moneyline odds for the over' },
      { name: 'under_odds', type: 'number', desc: 'Moneyline odds for the under' },
    ],
  },
]

const STEPS = [
  { n: '01', title: 'Write SQL', body: 'Query any of the 7 tables using standard SQL — SELECT, WHERE, GROUP BY, ORDER BY, LIMIT, JOIN, and aggregate functions are all supported.' },
  { n: '02', title: 'Run it',    body: 'Press ⌘↵ (Mac) or Ctrl+↵ (Windows) to execute, or click the Run Query button at the bottom of the editor.' },
  { n: '03', title: 'Visualize', body: 'Results appear instantly as a chart and a paginated table. Switch between Bar, Line, Area, and Pie charts and adjust the X / Y axes.' },
  { n: '04', title: 'Export',    body: 'Download your chart as a PNG image or export the raw result set as a CSV — use the Export menu in the chart controls toolbar.' },
]

const TIPS = [
  { code: "JOIN standings s ON d.team = s.team AND d.season = s.season", hint: 'Join across tables on team + season' },
  { code: "JOIN draft_values v ON d.pick = v.pick",                       hint: 'Enrich picks with value models' },
  { code: "GROUP BY season ORDER BY season ASC",                          hint: 'Time-series → Line or Area chart' },
  { code: "SUM(CASE WHEN round = 1 THEN 1 ELSE 0 END)",                   hint: 'Conditional aggregation' },
  { code: "LIMIT 15",                                                      hint: 'Keep charts readable' },
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
                Available Tables
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full ml-1"
                style={{ fontFamily: 'var(--font-mono)', background: pillNum, border: `1px solid ${pillBorder}`, color: muted }}
              >
                7 tables
              </span>
            </div>

            <div className="space-y-2">
              {SCHEMA.map((tbl) => (
                <details
                  key={tbl.name}
                  className="group rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${border}` }}
                >
                  {/* Table header row — click to expand */}
                  <summary
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer list-none select-none"
                    style={{ background: headerBg }}
                  >
                    {/* Chevron */}
                    <svg
                      width="10" height="10" viewBox="0 0 10 10" fill="none"
                      className="shrink-0 transition-transform duration-200 group-open:rotate-90"
                      style={{ color: muted }}
                    >
                      <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <code className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: primary }}>
                      {tbl.name}
                    </code>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ fontFamily: 'var(--font-mono)', background: pillNum, border: `1px solid ${pillBorder}`, color: muted }}
                    >
                      {tbl.rows} rows
                    </span>
                    <span className="text-[11px] ml-auto" style={{ color: muted, fontFamily: 'var(--font-sans)' }}>
                      {tbl.desc}
                    </span>
                  </summary>

                  {/* Column list */}
                  <table className="w-full text-xs" style={{ borderTop: `1px solid ${border}` }}>
                    <thead>
                      <tr style={{ background: headerBg, borderBottom: `1px solid ${border}` }}>
                        <th className="px-4 py-1.5 text-left" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: muted }}>Column</th>
                        <th className="px-4 py-1.5 text-left" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: muted }}>Type</th>
                        <th className="px-4 py-1.5 text-left" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: muted }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tbl.cols.map((col, i) => (
                        <tr
                          key={col.name}
                          style={{ background: i % 2 !== 0 ? rowAlt : 'transparent', borderBottom: i < tbl.cols.length - 1 ? `1px solid ${border}` : 'none' }}
                        >
                          <td className="px-4 py-1.5 whitespace-nowrap">
                            <code style={{ fontFamily: 'var(--font-mono)', color: fg, fontSize: 11 }}>{col.name}</code>
                          </td>
                          <td className="px-4 py-1.5 whitespace-nowrap">
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
                          <td className="px-4 py-1.5" style={{ color: muted, fontFamily: 'var(--font-sans)', fontSize: 11 }}>
                            {col.desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              ))}
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
