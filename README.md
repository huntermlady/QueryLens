# QueryLens

**Visualize your SQL queries instantly.**

QueryLens is a browser-only SQL query visualizer built as a portfolio-quality developer tool. Write SQL against a built-in mock sales dataset, see results rendered as interactive charts, and switch between chart types and axes in real time — no backend required.

## Features

- **SQL Editor** — CodeMirror 6 with SQL syntax highlighting, bracket matching, and `⌘↵` run shortcut
- **In-browser query engine** — AlaSQL powers `SELECT`, `WHERE`, `GROUP BY`, `ORDER BY`, `LIMIT`, and aggregate functions
- **Interactive charts** — Bar, Line, Area, and Pie charts via Recharts with a custom tooltip
- **Smart axis defaults** — automatically picks sensible X/Y axes based on column types (temporal → line chart, categorical + numeric → pie, etc.)
- **Axis controls** — override X axis, primary Y axis, and optional second Y axis
- **Data table** — paginated result table with column-type indicators (numeric / categorical / temporal)
- **JSON view** — raw result preview
- **Export** — chart as PNG (via `html-to-image`) or data as CSV
- **Dark mode** — full light/dark theme with `localStorage` persistence
- **Example queries** — 6 curated starter queries in a dropdown
- **Polished UX** — loading shimmer, empty state, error state with SQL message, toast notifications

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| SQL engine | AlaSQL |
| Editor | CodeMirror 6 (`@uiw/react-codemirror`) |
| Charts | Recharts |
| Icons | Lucide React |
| PNG export | html-to-image |
| Toasts | Sonner |

## Mock Dataset

The built-in `sales` table has ~576 rows spanning 12 months, 4 regions (North / South / East / West), and 4 categories (Electronics / Clothing / Food & Beverage / Home & Garden).

**Schema:**
```
id, date, region, category, product, sales_rep, units, revenue, cost, profit
```

## Example Queries

```sql
-- Revenue by region
SELECT region, SUM(revenue) AS revenue, SUM(profit) AS profit
FROM sales GROUP BY region ORDER BY revenue DESC

-- Monthly trend
SELECT date, SUM(revenue) AS revenue
FROM sales GROUP BY date ORDER BY date

-- Top 10 products
SELECT product, SUM(revenue) AS revenue
FROM sales GROUP BY product ORDER BY revenue DESC LIMIT 10

-- Rep performance
SELECT sales_rep, SUM(units) AS units, SUM(revenue) AS revenue
FROM sales GROUP BY sales_rep ORDER BY revenue DESC
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/
│   ├── SqlEditor.tsx       # CodeMirror SQL editor with run button
│   ├── ResultsPanel.tsx    # Chart/Table/JSON tabs + controls
│   ├── ChartRenderer.tsx   # Recharts switch (Bar/Line/Area/Pie)
│   ├── ChartControls.tsx   # Chart type switcher, axis pickers, export menu
│   ├── DataTable.tsx       # Paginated result table
│   ├── Header.tsx          # App header with theme toggle
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   └── LoadingState.tsx
├── hooks/
│   ├── useQueryRunner.ts   # Query lifecycle state machine
│   └── useTheme.ts         # Light/dark toggle with persistence
├── utils/
│   ├── queryEngine.ts      # AlaSQL bootstrap + run() wrapper
│   ├── columnInference.ts  # Column kind detection + default axis picker
│   ├── exportCsv.ts
│   └── exportPng.ts
├── data/
│   ├── salesData.ts        # ~576 deterministic mock rows
│   └── exampleQueries.ts   # 6 curated SQL examples
└── types/
    └── index.ts
```
