// 2026 F1 Team Colors
export const TEAM_COLORS: Record<string, string> = {
  'McLaren': '#F47600',
  'Red Bull Racing': '#4781D7',
  'Audi': '#F50537',
  'Alpine': '#00A1E8',
  'Cadillac': '#909090',
  'Mercedes': '#00D7B6',
  'Aston Martin': '#229971',
  'Ferrari': '#ED1131',
  'Williams': '#1868DB',
  'Racing Bulls': '#6C98FF',
  'Haas F1 Team': '#9C9FA2',
  // Legacy names for compatibility
  'RB': '#6692FF',
  'Kick Sauber': '#52E252',
}

export const DEFAULT_TEAM_COLOR = '#666666'

export function getTeamColor(teamName?: string | null): string {
  if (!teamName) return DEFAULT_TEAM_COLOR
  return TEAM_COLORS[teamName] ?? DEFAULT_TEAM_COLOR
}

// 2026 driver number → team mapping
export const DRIVER_TEAM_MAP: Record<number, string> = {
  1: 'McLaren',        // NOR
  81: 'McLaren',       // PIA
  3: 'Red Bull Racing',// VER
  6: 'Red Bull Racing',// HAD
  5: 'Audi',           // BOR
  27: 'Audi',          // HUL
  10: 'Alpine',        // GAS
  43: 'Alpine',        // COL
  11: 'Cadillac',      // PER
  77: 'Cadillac',      // BOT
  12: 'Mercedes',      // ANT
  63: 'Mercedes',      // RUS
  14: 'Aston Martin',  // ALO
  18: 'Aston Martin',  // STR
  16: 'Ferrari',       // LEC
  44: 'Ferrari',       // HAM
  23: 'Williams',      // ALB
  55: 'Williams',      // SAI
  30: 'Racing Bulls',  // LAW
  41: 'Racing Bulls',  // LIN
  31: 'Haas F1 Team',  // OCO
  87: 'Haas F1 Team',  // BEA
}
