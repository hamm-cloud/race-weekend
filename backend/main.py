"""
Race Weekend FastAPI Backend
Powers real telemetry, lap times, tyre strategy, and weather data for the Race Weekend app.

Endpoints:
- /api/session/{year}/{gp}/{session_type} - Fetch session data
- /api/telemetry/{year}/{gp}/{session_type}/{driver} - Fetch driver telemetry
- /api/live - Placeholder for live timing (when available)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import fastf1
import logging
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Race Weekend Backend",
    description="F1 telemetry and race data API",
    version="0.1.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure FastF1 caching
fastf1.Cache.enable_cache('/tmp/fastf1_cache')

logger = logging.getLogger(__name__)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "online", "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/session/{year}/{gp}/{session_type}")
async def get_session(year: int, gp: str, session_type: str):
    """
    Fetch session data (FP1, FP2, FP3, Q, R).
    
    Args:
        year: F1 season (e.g., 2026)
        gp: Grand Prix identifier (e.g., "Suzuka", "Melbourne")
        session_type: Session type (FP1, FP2, FP3, Q, R)
    
    Returns:
        Session metadata: date, location, session status, participants
    """
    try:
        # Load session using FastF1
        session = fastf1.get_session(year, gp, session_type)
        session.load()
        
        # Extract metadata
        return {
            "year": year,
            "gp": gp,
            "session_type": session_type,
            "date": session.date.isoformat() if session.date else None,
            "circuit": session.circuit_name if hasattr(session, 'circuit_name') else None,
            "status": "loaded",
            "drivers_count": len(session.drivers) if hasattr(session, 'drivers') else 0,
        }
    except Exception as e:
        logger.error(f"Error fetching session {year}/{gp}/{session_type}: {str(e)}")
        raise HTTPException(status_code=404, detail=f"Session not found: {str(e)}")


@app.get("/api/telemetry/{year}/{gp}/{session_type}/{driver}")
async def get_telemetry(year: int, gp: str, session_type: str, driver: str):
    """
    Fetch driver telemetry for a given session.
    
    Args:
        year: F1 season
        gp: Grand Prix
        session_type: Session type
        driver: Driver abbreviation (e.g., "VER", "LEC")
    
    Returns:
        Telemetry data: lap times, speed, throttle, brake, DRS
    """
    try:
        session = fastf1.get_session(year, gp, session_type)
        session.load()
        
        # Get driver laps
        driver_laps = session.laps.pick_driver(driver)
        
        if driver_laps.empty:
            raise ValueError(f"No data for driver {driver}")
        
        # Aggregate lap times and tyre data
        lap_data = []
        for idx, lap in driver_laps.iterrows():
            lap_data.append({
                "lap_number": int(lap['LapNumber']) if 'LapNumber' in lap else None,
                "lap_time": float(lap['LapTime'].total_seconds()) if 'LapTime' in lap and lap['LapTime'] else None,
                "compound": lap['Compound'] if 'Compound' in lap else None,
                "tyre_age": int(lap['TyreLife']) if 'TyreLife' in lap and lap['TyreLife'] else None,
            })
        
        return {
            "year": year,
            "gp": gp,
            "session_type": session_type,
            "driver": driver,
            "laps": lap_data[:20],  # Limit to last 20 laps for response size
            "total_laps": len(lap_data),
        }
    except Exception as e:
        logger.error(f"Error fetching telemetry {year}/{gp}/{session_type}/{driver}: {str(e)}")
        raise HTTPException(status_code=404, detail=f"Telemetry not found: {str(e)}")


@app.get("/api/live")
async def get_live():
    """
    Placeholder for live timing.
    Currently returns mock data; will integrate OpenF1 API when available.
    """
    return {
        "status": "coming_soon",
        "message": "Live timing integration in progress",
        "timestamp": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = "0.0.0.0"  # Listen on all interfaces for production
    uvicorn.run(app, host=host, port=port, log_level="info")
