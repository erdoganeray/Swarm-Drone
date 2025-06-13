import React from 'react'
import { useWaypoints } from '../contexts/WaypointContext'

const StatusBar: React.FC = () => {
  const { waypoints, selectedWaypoint, isAddingWaypoint } = useWaypoints()
  
  // Calculate total trajectory distance
  const totalDistance = waypoints.reduce((total, waypoint, index) => {
    if (index === 0) return 0
    const prevWaypoint = waypoints[index - 1]
    return total + waypoint.position.distanceTo(prevWaypoint.position)
  }, 0)

  // Calculate estimated flight time (assuming average speed)
  const avgSpeed = waypoints.reduce((sum, wp) => sum + (wp.speed || 5), 0) / (waypoints.length || 1)
  const estimatedTime = totalDistance / avgSpeed

  const selectedWaypointData = waypoints.find(wp => wp.id === selectedWaypoint)

  return (
    <div className="status-bar">
      <div>
        <strong>Status:</strong> {
          isAddingWaypoint 
            ? 'Click on ground to add waypoint' 
            : selectedWaypoint 
              ? `Waypoint "${selectedWaypointData?.name}" selected`
              : 'Ready'
        }
      </div>
      
      <div>
        <strong>Waypoints:</strong> {waypoints.length}
      </div>
      
      <div>
        <strong>Distance:</strong> {totalDistance.toFixed(1)}m
      </div>
      
      <div>
        <strong>Est. Time:</strong> {estimatedTime.toFixed(1)}s
      </div>
      
      <div>
        <strong>Controls:</strong> Mouse to orbit • Scroll to zoom • Right-click to pan
      </div>
    </div>
  )
}

export default StatusBar
