# QueryLens

**In-browser SQL analytics for NFL draft data — and any CSV you bring.**

QueryLens is a portfolio-quality, frontend-only SQL query visualizer. Write SQL against 7 built-in NFL datasets, visualize results as interactive charts, and switch chart types and axes in real time. Drop in any CSV to register it as a queryable table for the session. No backend, no server, no sign-in required.

---

## Features

### Query Engine
- **AlaSQL** powers in-browser SQL — `SELECT`, `WHERE`, `GROUP BY`, `ORDER BY`, `LIMIT`, `JOIN`, and aggregate functions (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `CASE WHEN`)
- **7 built-in NFL tables** pre-loaded at startup (`draft_picks`, `games`, `standings`, `rosters`, `trades`, `draft_values`, `win_totals`) covering 1980–present
- **CSV upload** — drag-and-drop or browse to register any CSV as a queryable table for the session; table name is auto-derived from the filename

### Editor
- **CodeMirror 6** with SQL syntax highlighting, line numbers, bracket matching, and autocompletion
- `⌘↵` (Mac) / `Ctrl+↵` (Windows) run shortcut
- 10 curated example queries including cross-table JOINs

### Visualization
- **Bar, Line, Area, and Pie** charts via Recharts with a custom NFL-palette tooltip
- **Smart defaults** — automatically picks sensible X/Y axes based on column types (temporal → line, one categorical + one numeric → pie, etc.)
- **Axis controls** — override X axis, primary Y axis, and optional second Y axis

### Data Table
- Paginated result table with column-type indicators (numeric / categorical / temporal)
- Monospace right-aligned numbers, alternating row shading

### Export
- **PNG** — chart snapshot via `html-to-image`
- **CSV** — raw result set as a downloadable file
- Toast confirmation on both

### UX
- **Quick Start modal** — table schemas, how-it-works guide, SQL tips, chart type reference, and an in-modal CSV upload zone
- **Light / dark theme** — smooth CSS transitions, preference persisted to `localStorage`
- Animated per-table loading screen at startup
- Empty, loading, and error states throughout
- Smooth theme transition on toggle (all inline styles animated via CSS `transition`)

---

## Built-in Tables

| Table | Rows (approx.) | Description |
|---|---|---|
| `draft_picks` | 12,253 | NFL Draft selections 1980–present (round, pick, team, player, position) |
| `games` | ~6,500 | Game results, scores, weather, QB matchups, betting lines |
| `standings` | ~800 | Season W/L records, division rank, playoff seed |
| `rosters` | ~30,000 | Player roster entries by season and team; linkable to `draft_picks` via `pfr_id` |
| `trades` | ~5,000 | Trade history — which teams swapped picks and players |
| `draft_values` | ~261 | Pick value models (Stuart, Johnson, Hill, OTC, PFF) keyed on pick number |
| `win_totals` | ~400 | Preseason over/under win total lines by team and season |

---

## Example Queries

```sql
-- Picks by position (great bar chart)
SELECT position, COUNT(*) AS picks
FROM draft_picks
WHERE position IS NOT NULL
GROUP BY position
ORDER BY picks DESC LIMIT 20

-- Scoring trends over time (line chart)
SELECT season,
  ROUND(AVG(home_score + away_score), 1) AS avg_total_points
FROM games
WHERE game_type = 'REG' AND home_score IS NOT NULL
GROUP BY season ORDER BY season ASC

-- Draft class vs wins that season (cross-table JOIN)
SELECT d.season, d.team,
  COUNT(*) AS first_round_picks,
  MAX(s.wins) AS wins
FROM draft_picks d
JOIN standings s ON d.team = s.team AND d.season = s.season
WHERE d.round = 1
GROUP BY d.season, d.team
ORDER BY d.season DESC LIMIT 40

-- Pick value by round
SELECT d.round,
  COUNT(*) AS picks,
  ROUND(AVG(v.otc), 0) AS avg_otc_value
FROM draft_picks d
JOIN draft_values v ON d.pick = v.pick
GROUP BY d.round ORDER BY d.round ASC
```

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | React + TypeScript | 18 / 5 |
| Build | Vite | 6 |
| Styling | Tailwind CSS | v4 |
| SQL engine | AlaSQL | latest |
| CSV parsing | PapaParse | latest |
| Editor | CodeMirror 6 (`@uiw/react-codemirror`) | 4 |
| Charts | Recharts | 2 |
| PNG export | html-to-image | latest |
| Icons | Lucide React | latest |
| Toasts | Sonner | latest |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npx tsc --noEmit

# Production build
npm run build
```

Open [http://localhost:5173](http://localhost:5173). The app fetches and parses all 7 CSV datasets at startup — expect a 1–3 second load depending on connection speed.

---

## Project Structure

```
/data                         ← CSV source files (served as static assets)
  draft_picks.csv
  games.csv
  standings.csv
  rosters.csv
  trades.csv
  draft_values.csv
  win_totals.csv

/src
  /components
    AppLoader.tsx             ← Startup splash with per-table progress checklist
    Header.tsx                ← Wordmark, dataset pill, upload, quick start, theme toggle
    SqlEditor.tsx             ← CodeMirror editor, examples dropdown, run button
    ResultsPanel.tsx          ← Chart / Table / JSON tabs
    ChartRenderer.tsx         ← Recharts switch (Bar / Line / Area / Pie)
    ChartControls.tsx         ← Chart type switcher, axis pickers, export menu
    DataTable.tsx             ← Paginated result table
    EmptyState.tsx            ← Pre-run illustration + CTA
    ErrorState.tsx            ← SQL error display
    QuickStartModal.tsx       ← Schema reference, upload zone, tips, chart guide
    DropOverlay.tsx           ← Full-screen drag-and-drop overlay
  /hooks
    useQueryRunner.ts         ← Query lifecycle state machine
    useTheme.ts               ← Light/dark toggle with localStorage persistence
  /utils
    queryEngine.ts            ← AlaSQL bootstrap, table registry, upload handler
  /data
    exampleQueries.ts         ← 10 curated SQL examples
  /types
    index.ts
  App.tsx                     ← Layout shell, drag detection, upload wiring
  index.css                   ← Design tokens, fonts, animations
```

---

## Known Limitations

- **No window functions or CTEs** — AlaSQL does not support `OVER()`, `WITH`, or `PARTITION BY`
- **Main-thread CSV parsing** — very large uploads (> ~20 MB) may briefly freeze the UI
- **Session-only uploads** — CSV tables uploaded by the user are not persisted; refreshing the page clears them
- **Modern browsers only** — requires a browser with ES2020+ support (Chrome 88+, Firefox 78+, Safari 14+)
