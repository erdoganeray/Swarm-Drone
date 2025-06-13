import React, { useState } from 'react'
import { useWaypoints } from '../contexts/WaypointContext'

const UIPanel: React.FC = () => {
  const {
    waypoints,
    selectedWaypoint,
    isAddingWaypoint,
    gridEnabled,
    gridSize,
    snapToGrid,
    setIsAddingWaypoint,
    removeWaypoint,
    updateWaypoint,
    selectWaypoint,
    toggleGrid,
    setGridSize,
    toggleSnapToGrid,
    clearAllWaypoints,
    exportTrajectory,
    importTrajectory
  } = useWaypoints()

  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importText, setImportText] = useState('')

  const selectedWaypointData = waypoints.find(wp => wp.id === selectedWaypoint)

  const handleExport = () => {
    const data = exportTrajectory()
    navigator.clipboard.writeText(data)
    alert('Trajectory exported to clipboard!')
  }

  const handleImport = () => {
    importTrajectory(importText)
    setImportText('')
    setShowImportDialog(false)
  }

  const formatPosition = (pos: any) => {
    return `(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`
  }

  return (
    <div className="ui-panel">
      <h3>Drone Trajectory Planner</h3>
      
      {/* Main Controls */}
      <div className="controls">
        <button
          onClick={() => setIsAddingWaypoint(!isAddingWaypoint)}
          style={{
            backgroundColor: isAddingWaypoint ? '#ff6600' : '#1a1a1a',
            color: isAddingWaypoint ? 'white' : 'inherit'
          }}
        >
          {isAddingWaypoint ? 'Stop Adding' : 'Add Waypoint'}
        </button>
        
        <button onClick={clearAllWaypoints}>
          Clear All
        </button>
      </div>

      {/* Grid Controls */}
      <div style={{ marginTop: '15px' }}>
        <h4>Grid Settings</h4>
        <div className="controls">
          <button onClick={toggleGrid}>
            Grid: {gridEnabled ? 'ON' : 'OFF'}
          </button>
          <button onClick={toggleSnapToGrid}>
            Snap: {snapToGrid ? 'ON' : 'OFF'}
          </button>
        </div>
        
        <div style={{ margin: '10px 0' }}>
          <label>Grid Size: </label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={gridSize}
            onChange={(e) => setGridSize(parseFloat(e.target.value))}
            style={{ width: '100px' }}
          />
          <span> {gridSize}m</span>
        </div>
      </div>

      {/* Waypoint List */}
      <div className="waypoint-list">
        <h4>Waypoints ({waypoints.length})</h4>
        {waypoints.map((waypoint, index) => (
          <div
            key={waypoint.id}
            className="waypoint-item"
            style={{
              backgroundColor: selectedWaypoint === waypoint.id 
                ? 'rgba(0, 136, 255, 0.3)' 
                : 'rgba(255, 255, 255, 0.1)'
            }}
            onClick={() => selectWaypoint(waypoint.id)}
          >
            <div>
              <strong>{index + 1}. {waypoint.name}</strong>
              <br />
              <small>{waypoint.type} - {formatPosition(waypoint.position)}</small>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeWaypoint(waypoint.id)
              }}
              style={{ background: '#ff4444', color: 'white', padding: '5px 8px' }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Selected Waypoint Details */}
      {selectedWaypointData && (
        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(0, 136, 255, 0.2)', borderRadius: '5px' }}>
          <h4>Edit Waypoint</h4>
          
          <div style={{ margin: '5px 0' }}>
            <label>Name: </label>
            <input
              type="text"
              value={selectedWaypointData.name}
              onChange={(e) => updateWaypoint(selectedWaypointData.id, { name: e.target.value })}
              style={{ background: '#333', color: 'white', border: '1px solid #555', padding: '3px' }}
            />
          </div>
          
          <div style={{ margin: '5px 0' }}>
            <label>Type: </label>
            <select
              value={selectedWaypointData.type}
              onChange={(e) => updateWaypoint(selectedWaypointData.id, { type: e.target.value as any })}
              style={{ background: '#333', color: 'white', border: '1px solid #555', padding: '3px' }}
            >
              <option value="takeoff">Takeoff</option>
              <option value="waypoint">Waypoint</option>
              <option value="hover">Hover</option>
              <option value="landing">Landing</option>
            </select>
          </div>
          
          <div style={{ margin: '5px 0' }}>
            <label>Altitude: </label>
            <input
              type="number"
              step="0.1"
              value={selectedWaypointData.altitude || 0}
              onChange={(e) => {
                const altitude = parseFloat(e.target.value)
                updateWaypoint(selectedWaypointData.id, { 
                  altitude,
                  position: selectedWaypointData.position.clone().setY(altitude)
                })
              }}
              style={{ background: '#333', color: 'white', border: '1px solid #555', padding: '3px', width: '70px' }}
            />
            m
          </div>
          
          <div style={{ margin: '5px 0' }}>
            <label>Speed: </label>
            <input
              type="number"
              step="0.5"
              value={selectedWaypointData.speed || 5}
              onChange={(e) => updateWaypoint(selectedWaypointData.id, { speed: parseFloat(e.target.value) })}
              style={{ background: '#333', color: 'white', border: '1px solid #555', padding: '3px', width: '70px' }}
            />
            m/s
          </div>
        </div>
      )}

      {/* Import/Export */}
      <div style={{ marginTop: '15px' }}>
        <h4>Import/Export</h4>
        <div className="controls">
          <button onClick={handleExport}>Export</button>
          <button onClick={() => setShowImportDialog(true)}>Import</button>
        </div>
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#222',
          padding: '20px',
          borderRadius: '10px',
          zIndex: 2000
        }}>
          <h4>Import Trajectory</h4>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={10}
            cols={50}
            style={{ background: '#333', color: 'white', border: '1px solid #555' }}
            placeholder="Paste trajectory JSON here..."
          />
          <div style={{ marginTop: '10px' }}>
            <button onClick={handleImport}>Import</button>
            <button onClick={() => setShowImportDialog(false)} style={{ marginLeft: '10px' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UIPanel
