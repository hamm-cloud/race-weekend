import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'

interface TelemetryLap {
  lap_number: number
  lap_time: number
  compound: string
  tyre_age: number
}

interface TelemetryData {
  year: number
  gp: string
  session_type: string
  driver: string
  laps: TelemetryLap[]
  total_laps: number
}

interface Props {
  session: any
  sessionLoading: boolean
}

const BACKEND_URL = 'http://127.0.0.1:8000'

export default function TelemetryPage({ session, sessionLoading }: Props) {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<string>('63') // Kimi Antonelli

  useEffect(() => {
    if (!session) return

    const fetchTelemetry = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/telemetry/2026/${session.location || 'Melbourne'}/R/${selectedDriver}`
        )
        setTelemetry(response.data)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load telemetry data')
        console.error('Telemetry fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTelemetry()
  }, [session, selectedDriver])

  if (sessionLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
        Loading session...
      </div>
    )
  }

  if (!session) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
        No active session
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>Driver Telemetry</h2>

      {/* Driver Selector */}
      <motion.div
        style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          border: '1px solid #333',
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <label style={{ color: '#aaa', display: 'block', marginBottom: '10px' }}>
          Driver Number
        </label>
        <input
          type="text"
          value={selectedDriver}
          onChange={(e) => setSelectedDriver(e.target.value)}
          placeholder="Enter driver number"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#0a0a0a',
            border: '1px solid #444',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '14px',
          }}
        />
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
          Loading telemetry...
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          style={{
            padding: '15px',
            backgroundColor: '#3a1a1a',
            borderRadius: '8px',
            border: '1px solid #8b3a3a',
            color: '#ff6b6b',
            marginBottom: '20px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ❌ {error}
        </motion.div>
      )}

      {/* Telemetry Data */}
      {telemetry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div
            style={{
              padding: '15px',
              backgroundColor: '#1a1a1a',
              borderRadius: '8px',
              border: '1px solid #333',
              marginBottom: '20px',
            }}
          >
            <p style={{ color: '#aaa', margin: '5px 0' }}>
              <strong>{telemetry.gp} {telemetry.session_type}</strong> · Driver {telemetry.driver}
            </p>
            <p style={{ color: '#666', margin: '5px 0', fontSize: '12px' }}>
              {telemetry.total_laps} total laps ({telemetry.laps.length} shown)
            </p>
          </div>

          {/* Laps Table */}
          <div
            style={{
              overflowX: 'auto',
              backgroundColor: '#1a1a1a',
              borderRadius: '8px',
              border: '1px solid #333',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#888' }}>Lap</th>
                  <th style={{ padding: '10px', textAlign: 'right', color: '#888' }}>Time</th>
                  <th style={{ padding: '10px', textAlign: 'center', color: '#888' }}>
                    Compound
                  </th>
                  <th style={{ padding: '10px', textAlign: 'center', color: '#888' }}>
                    Tyre Age
                  </th>
                </tr>
              </thead>
              <tbody>
                {telemetry.laps.map((lap, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px solid #2a2a2a',
                      backgroundColor: i % 2 === 0 ? 'transparent' : '#0f0f0f',
                    }}
                  >
                    <td style={{ padding: '10px', color: '#fff' }}>{lap.lap_number}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#61dafb' }}>
                      {lap.lap_time.toFixed(3)}s
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#aaa' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          backgroundColor:
                            lap.compound === 'SOFT'
                              ? '#ff4444'
                              : lap.compound === 'MEDIUM'
                                ? '#ffff00'
                                : '#fff',
                          borderRadius: '3px',
                          fontSize: '11px',
                          color: lap.compound === 'MEDIUM' ? '#000' : '#fff',
                        }}
                      >
                        {lap.compound}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#aaa' }}>
                      {lap.tyre_age}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
