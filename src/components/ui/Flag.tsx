interface FlagProps {
  countryCode?: string | null
  className?: string
}

const COUNTRY_FLAGS: Record<string, string> = {
  NED: '🇳🇱', GBR: '🇬🇧', MON: '🇲🇨', AUS: '🇦🇺', ESP: '🇪🇸',
  GER: '🇩🇪', MEX: '🇲🇽', FIN: '🇫🇮', FRA: '🇫🇷', CAN: '🇨🇦',
  THA: '🇹🇭', CHN: '🇨🇳', DEN: '🇩🇰', JPN: '🇯🇵', USA: '🇺🇸',
  ARG: '🇦🇷', BRA: '🇧🇷', ITA: '🇮🇹', NZL: '🇳🇿',
}

export default function Flag({ countryCode, className }: FlagProps) {
  if (!countryCode) return null
  const flag = COUNTRY_FLAGS[countryCode.toUpperCase()]
  if (!flag) return null
  return <span className={className}>{flag}</span>
}
