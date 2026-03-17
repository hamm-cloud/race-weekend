import { useState, useEffect } from 'react'
import axios from 'axios'
import { getTeamColor } from '../lib/teamColors'

interface DriverStanding {
  position: string
  positionText: string
  points: string
  wins: string
  Driver: {
    driverId: string
    givenName: string
    familyName: string
    nationality: string
    permanentNumber: string
  }
  Constructors: Array<{
    constructorId: string
    name: string
    nationality: string
  }>
}

interface ConstructorStanding {
  position: string
  positionText: string
  points: string
  wins: string
  Constructor: {
    constructorId: string
    name: string
    nationality: string
  }
}

type SubTab = 'drivers' | 'constructors'

export default function StandingsPage() {
  const [subTab, setSubTab] = useState<SubTab>('drivers')
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([])
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([])
  const [loadingDrivers, setLoadingDrivers] = useState(true)
  const [loadingConstructors, setLoadingConstructors] = useState(true)
  const [driverError, setDriverError] = useState(false)
  const [constructorError, setConstructorError] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoadingDrivers(true)
      setDriverError(false)
      try {
        const response = await axios.get(
          'https://api.jolpi.ca/ergast/f1/current/driverStandings.json',
          { timeout: 10000 }
        )
        const standings =
          response.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []
        setDriverStandings(standings)
      } catch (err) {
        console.warn('Failed to fetch driver standings:', err)
        setDriverError(true)
      }
      setLoadingDrivers(false)
    }
    load()
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoadingConstructors(true)
      setConstructorError(false)
      try {
        const response = await axios.get(
          'https://api.jolpi.ca/ergast/f1/current/constructorStandings.json',
          { timeout: 10000 }
        )
        const standings =
          response.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? []
        setConstructorStandings(standings)
      } catch (err) {
        console.warn('Failed to fetch constructor standings:', err)
        setConstructorError(true)
      }
      setLoadingConstructors(false)
    }
    load()
  }, [])

  const isLoading = subTab === 'drivers' ? loadingDrivers : loadingConstructors
  const hasError = subTab === 'drivers' ? driverError : constructorError

  return (
    <div>
      {/* Title */}
      <h2
        style={{
          fontFamily: '"Bebas Neue", cursive',
          fontSize: '2rem',
          color: '#F0F0F0',
          margin: '0 0 1rem 0',
          letterSpacing: '0.05em',
        }}
      >
        STANDINGS
      </h2>

      {/* Sub-tab toggle */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          marginBottom: '1.5rem',
          border: '1px solid #2A2A2A',
          borderRadius: '6px',
          overflow: 'hidden',
          width: 'fit-content',
        }}
      >
        {(['drivers', 'constructors'] as SubTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            style={{
              padding: '0.5rem 1.25rem',
              background: subTab === tab ? '#E8002D' : 'transparent',
              border: 'none',
              color: subTab === tab ? '#fff' : '#666',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              textTransform: 'uppercase',
            }}
          >
            {tab === 'drivers' ? 'DRIVERS' : 'CONSTRUCTORS'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ color: '#555', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}>
          Loading standings…
        </div>
      ) : hasError ? (
        <div
          style={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '6px',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#555' }}>
            Standings unavailable right now
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#333', marginTop: '0.25rem' }}>
            Check back during the season
          </div>
        </div>
      ) : subTab === 'drivers' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {driverStandings.map((standing) => {
            const teamName = standing.Constructors?.[0]?.name ?? ''
            const teamColor = getTeamColor(teamName)
            return (
              <div
                key={standing.Driver.driverId}
                style={{
                  backgroundColor: '#111111',
                  border: '1px solid #2A2A2A',
                  borderLeft: `3px solid ${teamColor}`,
                  borderRadius: '4px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                {/* Position */}
                <div
                  style={{
                    fontFamily: '"Bebas Neue", cursive',
                    fontSize: '1.75rem',
                    color: standing.position === '1' ? '#E8002D' : '#F0F0F0',
                    lineHeight: 1,
                    minWidth: '2rem',
                    textAlign: 'center',
                  }}
                >
                  {standing.position}
                </div>

                {/* Name + Team */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#F0F0F0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {standing.Driver.givenName} {standing.Driver.familyName}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.7rem',
                      color: '#555',
                      marginTop: '1px',
                    }}
                  >
                    {standing.Driver.nationality} · {teamName}
                  </div>
                </div>

                {/* Wins */}
                <div style={{ textAlign: 'center', minWidth: '2rem' }}>
                  <div
                    style={{
                      fontFamily: '"Bebas Neue", cursive',
                      fontSize: '1.25rem',
                      color: '#666',
                      lineHeight: 1,
                    }}
                  >
                    {standing.wins}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.6rem',
                      color: '#444',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    W
                  </div>
                </div>

                {/* Points */}
                <div style={{ textAlign: 'right', minWidth: '3rem' }}>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#F0F0F0',
                    }}
                  >
                    {standing.points}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.6rem',
                      color: '#444',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    PTS
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {constructorStandings.map((standing) => {
            const teamColor = getTeamColor(standing.Constructor.name)
            return (
              <div
                key={standing.Constructor.constructorId}
                style={{
                  backgroundColor: '#111111',
                  border: '1px solid #2A2A2A',
                  borderLeft: `3px solid ${teamColor}`,
                  borderRadius: '4px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                {/* Position */}
                <div
                  style={{
                    fontFamily: '"Bebas Neue", cursive',
                    fontSize: '1.75rem',
                    color: standing.position === '1' ? '#E8002D' : '#F0F0F0',
                    lineHeight: 1,
                    minWidth: '2rem',
                    textAlign: 'center',
                  }}
                >
                  {standing.position}
                </div>

                {/* Name + Nationality */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#F0F0F0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {standing.Constructor.name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.7rem',
                      color: '#555',
                      marginTop: '1px',
                    }}
                  >
                    {standing.Constructor.nationality}
                  </div>
                </div>

                {/* Wins */}
                <div style={{ textAlign: 'center', minWidth: '2rem' }}>
                  <div
                    style={{
                      fontFamily: '"Bebas Neue", cursive',
                      fontSize: '1.25rem',
                      color: '#666',
                      lineHeight: 1,
                    }}
                  >
                    {standing.wins}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.6rem',
                      color: '#444',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    W
                  </div>
                </div>

                {/* Points */}
                <div style={{ textAlign: 'right', minWidth: '3rem' }}>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#F0F0F0',
                    }}
                  >
                    {standing.points}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.6rem',
                      color: '#444',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    PTS
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
