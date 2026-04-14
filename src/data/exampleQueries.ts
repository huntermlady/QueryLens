import type { ExampleQuery } from '@/types'

export const exampleQueries: ExampleQuery[] = [
  {
    label: 'Browse picks',
    description: 'Preview the raw draft picks data',
    sql: `SELECT season, round, pick, team, pfr_name AS player, position
FROM draft_picks
ORDER BY season DESC, pick ASC
LIMIT 50`,
  },
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
    label: 'Picks by team',
    description: 'All-time draft pick count per franchise',
    sql: `SELECT team, COUNT(*) AS total_picks,
  SUM(CASE WHEN round = 1 THEN 1 ELSE 0 END) AS first_rounders
FROM draft_picks
GROUP BY team
ORDER BY total_picks DESC`,
  },
  {
    label: 'First-rounders by year',
    description: 'How many players were drafted in round 1 each season',
    sql: `SELECT season, COUNT(*) AS picks
FROM draft_picks
WHERE round = 1
GROUP BY season
ORDER BY season ASC`,
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
    label: 'Offense vs defense',
    description: 'Breakdown of offensive vs defensive picks by era',
    sql: `SELECT
  CASE
    WHEN season BETWEEN 1980 AND 1989 THEN '1980s'
    WHEN season BETWEEN 1990 AND 1999 THEN '1990s'
    WHEN season BETWEEN 2000 AND 2009 THEN '2000s'
    WHEN season BETWEEN 2010 AND 2019 THEN '2010s'
    ELSE '2020s'
  END AS era,
  side,
  COUNT(*) AS picks
FROM draft_picks
WHERE side IS NOT NULL
GROUP BY era, side
ORDER BY era, side`,
  },
]

export const DEFAULT_QUERY = exampleQueries[1].sql
