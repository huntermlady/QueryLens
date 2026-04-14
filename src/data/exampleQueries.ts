import type { ExampleQuery } from '@/types'

export const exampleQueries: ExampleQuery[] = [
  // ── draft_picks ────────────────────────────────────────────────────────────
  {
    label: 'Picks by position',
    description: 'Total draft picks grouped by position',
    sql: `SELECT position, COUNT(*) AS picks
FROM draft_picks
WHERE position IS NOT NULL
GROUP BY position
ORDER BY picks DESC
LIMIT 20`,
  },
  {
    label: 'QB draft trends',
    description: 'Quarterbacks drafted per season since 2000',
    sql: `SELECT season, COUNT(*) AS qbs_drafted
FROM draft_picks
WHERE position = 'QB' AND season >= 2000
GROUP BY season
ORDER BY season ASC`,
  },
  {
    label: 'First-rounders by team',
    description: 'All-time first-round picks per franchise',
    sql: `SELECT team,
  COUNT(*) AS total_picks,
  SUM(CASE WHEN round = 1 THEN 1 ELSE 0 END) AS first_rounders
FROM draft_picks
GROUP BY team
ORDER BY first_rounders DESC`,
  },

  // ── games ──────────────────────────────────────────────────────────────────
  {
    label: 'Highest-scoring games',
    description: 'Top combined-score regular season games',
    sql: `SELECT season, week, away_team, home_team,
  away_score, home_score,
  away_score + home_score AS total_points
FROM games
WHERE game_type = 'REG'
  AND away_score IS NOT NULL
ORDER BY total_points DESC
LIMIT 20`,
  },
  {
    label: 'Average points by season',
    description: 'How scoring has changed over the years',
    sql: `SELECT season,
  ROUND(AVG(home_score + away_score), 1) AS avg_total_points,
  COUNT(*) AS games_played
FROM games
WHERE game_type = 'REG'
  AND home_score IS NOT NULL
GROUP BY season
ORDER BY season ASC`,
  },

  // ── standings ──────────────────────────────────────────────────────────────
  {
    label: 'Best win % by team',
    description: 'All-time regular season winning percentage',
    sql: `SELECT team,
  SUM(wins) AS total_wins,
  SUM(losses) AS total_losses,
  ROUND(SUM(wins * 1.0) / (SUM(wins) + SUM(losses) + SUM(ties)), 3) AS win_pct
FROM standings
GROUP BY team
ORDER BY win_pct DESC`,
  },

  // ── cross-table ────────────────────────────────────────────────────────────
  {
    label: 'Draft class vs wins',
    description: 'First-round picks a team made vs their wins that season',
    sql: `SELECT d.season, d.team,
  COUNT(*) AS first_round_picks,
  MAX(s.wins) AS wins
FROM draft_picks d
JOIN standings s ON d.team = s.team AND d.season = s.season
WHERE d.round = 1
GROUP BY d.season, d.team
ORDER BY d.season DESC, first_round_picks DESC
LIMIT 40`,
  },
  {
    label: 'Pick value by round',
    description: 'Average OTC pick value for each draft round',
    sql: `SELECT d.round,
  COUNT(*) AS picks,
  ROUND(AVG(v.otc), 0) AS avg_otc_value
FROM draft_picks d
JOIN draft_values v ON d.pick = v.pick
GROUP BY d.round
ORDER BY d.round ASC`,
  },

  // ── rosters ────────────────────────────────────────────────────────────────
  {
    label: 'Roster depth by position',
    description: 'Average roster spots per position group',
    sql: `SELECT position, category,
  COUNT(DISTINCT team) AS teams,
  COUNT(*) AS total_entries,
  ROUND(COUNT(*) * 1.0 / COUNT(DISTINCT team), 1) AS avg_per_team
FROM rosters
WHERE season = 2023
  AND position IS NOT NULL
GROUP BY position, category
ORDER BY total_entries DESC
LIMIT 20`,
  },

  // ── trades ─────────────────────────────────────────────────────────────────
  {
    label: 'Most active traders',
    description: 'Teams involved in the most trades since 2010',
    sql: `SELECT team, COUNT(*) AS trade_count
FROM (
  SELECT gave AS team FROM trades WHERE season >= 2010
  UNION ALL
  SELECT received AS team FROM trades WHERE season >= 2010
) t
WHERE team IS NOT NULL
GROUP BY team
ORDER BY trade_count DESC
LIMIT 20`,
  },
]

export const DEFAULT_QUERY = exampleQueries[0].sql
