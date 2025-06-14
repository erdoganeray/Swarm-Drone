import React, { useState } from 'react'
import { useWaypoints } from '../contexts/WaypointContext'
import { useGUIManager } from './GUIManager'
import { useDrones } from '../contexts/DroneContext'

const CurveEditorControls: React.FC = () => {
  const { 
    waypoints, 
    selectedWaypoint, 
    selectWaypoint,
    startCurveEdit,
    curveEditMode,
    showCurveControls,
    getWaypointsByDroneId
  } = useWaypoints()
  
  const { isPanelVisible } = useGUIManager();
  const { selectedDroneId } = useDrones();
  const [targetWaypointId, setTargetWaypointId] = useState<string | null>(null)
  
  // If we're already in curve edit mode, don't show the controls
  // Also don't show if the panel is hidden or curve controls are disabled
  if (curveEditMode.active || !showCurveControls || !isPanelVisible('curve-editor')) return null
  
  // Get only waypoints for the selected drone
  const droneWaypoints = selectedDroneId ? getWaypointsByDroneId(selectedDroneId) : [];
  
  // Function to check if two waypoints are connected
  const areWaypointsConnected = (wp1Id: string, wp2Id: string) => {
    const wp1 = waypoints.find(wp => wp.id === wp1Id)
    const wp2 = waypoints.find(wp => wp.id === wp2Id)
    
    if (!wp1 || !wp2) return false
    
    // Check if either waypoint has the other in its connections
    return wp1.connections.includes(wp2.index) || wp2.connections.includes(wp1.index)
  }
  
  // Get the connected waypoints to the selected waypoint
  const connectedWaypoints = selectedWaypoint 
    ? droneWaypoints.filter(wp => 
        wp.id !== selectedWaypoint && 
        areWaypointsConnected(wp.id, selectedWaypoint)
      )
    : []

  // Start curve editing between the selected waypoints
  const handleStartCurveEdit = () => {
    if (selectedWaypoint && targetWaypointId) {
      startCurveEdit(selectedWaypoint, targetWaypointId)
    }
  }

  // Reset selection when changing the source waypoint
  const handleSelectSourceWaypoint = (id: string) => {
    selectWaypoint(id)
    setTargetWaypointId(null)
  }  

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '12px',
      zIndex: 1000,
      width: '250px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#ffaa00' }}>
        🔄 Yol Düzenleme ({droneWaypoints.length} Waypoint)
      </h3>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>
          1️⃣ İlk Waypoint:
        </label>
        <select 
          value={selectedWaypoint || ''}
          onChange={e => handleSelectSourceWaypoint(e.target.value)}
          style={{
            width: '100%',
            padding: '6px',
            background: '#333',
            color: 'white',
            border: '1px solid #555',
            borderRadius: '4px'
          }}
        >
          <option value="">Waypoint Seçin</option>
          {droneWaypoints.map(wp => (
            <option key={wp.id} value={wp.id}>
              {wp.index}. {wp.name || wp.type} ({wp.position.x.toFixed(1)}, {wp.position.y.toFixed(1)}, {wp.position.z.toFixed(1)})
            </option>
          ))}
        </select>
      </div>
            
      {selectedWaypoint && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>
            2️⃣ İkinci Waypoint:
          </label>
          <select
            value={targetWaypointId || ''}
            onChange={e => setTargetWaypointId(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              background: '#333',
              color: 'white',
              border: '1px solid #555',
              borderRadius: '4px'
            }}
            disabled={connectedWaypoints.length === 0}
          >
            <option value="">Bağlantılı Waypoint Seçin</option>
            {connectedWaypoints.map(wp => (
              <option key={wp.id} value={wp.id}>
                {wp.index}. {wp.name || wp.type} ({wp.position.x.toFixed(1)}, {wp.position.y.toFixed(1)}, {wp.position.z.toFixed(1)})
              </option>
            ))}
          </select>
          
          {connectedWaypoints.length === 0 && (
            <p style={{ fontSize: '12px', color: '#ff5555', margin: '5px 0 0 0' }}>
              Seçilen waypoint'e bağlı waypoint bulunamadı.
            </p>
          )}
        </div>
      )}
      
      <button
        onClick={handleStartCurveEdit}
        disabled={!selectedWaypoint || !targetWaypointId}
        style={{
          width: '100%',
          padding: '8px',
          background: selectedWaypoint && targetWaypointId ? '#ffaa00' : '#555',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: selectedWaypoint && targetWaypointId ? 'pointer' : 'not-allowed',
          fontWeight: 'bold'
        }}
      >
        📝 Yolu Düzenle
      </button>
      
      <p style={{ fontSize: '12px', color: '#aaa', margin: '10px 0 0 0' }}>
        İki bağlantılı waypoint arasındaki yolu düzenleyerek kavisli bir rota oluşturabilirsiniz.
      </p>
    </div>
  )
}

export default CurveEditorControls
