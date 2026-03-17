export const TEAM_COLORS: Record<string, string> = {
  'Mercedes': '#00D2BE',
  'Red Bull Racing': '#3671C6',
  'Ferrari': '#E8002D',
  'McLaren': '#FF8000',
  'Aston Martin': '#358C75',
  'Alpine': '#FF87BC',
  'Williams': '#64C4FF',
  'RB': '#6692FF',
  'Kick Sauber': '#52E252',
  'Haas F1 Team': '#B6BABD',
}

export const DEFAULT_TEAM_COLOR = '#666666'

export function getTeamColor(teamName?: string | null): string {
  if (!teamName) return DEFAULT_TEAM_COLOR
  return TEAM_COLORS[teamName] ?? DEFAULT_TEAM_COLOR
}

// Map driver numbers to teams (fallback when API data incomplete)
export const DRIVER_TEAM_MAP: Record<number, string> = {
  1: 'Red Bull Racing',
  11: 'Red Bull Racing',
  4: 'McLaren',
  81: 'McLaren',
  16: 'Ferrari',
  55: 'Ferrari',
  44: 'Mercedes',
  63: 'Mercedes',
  14: 'Aston Martin',
  18: 'Aston Martin',
  10: 'Alpine',
  31: 'Alpine',
  23: 'Williams',
  2: 'Williams',
  22: 'RB',
  3: 'RB',
  77: 'Kick Sauber',
  24: 'Kick Sauber',
  20: 'Haas F1 Team',
  27: 'Haas F1 Team',
}
