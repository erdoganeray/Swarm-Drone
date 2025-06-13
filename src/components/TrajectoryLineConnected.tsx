import React from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

interface Waypoint {
  id: number | string
  index: number
  position: [number, number, number] | THREE.Vector3
  type: string
  connections: number[]
}

interface TrajectoryLineProps {
  waypoints: Waypoint[]
}

const TrajectoryLineConnected: React.FC<TrajectoryLineProps> = ({ waypoints }) => {
  if (waypoints.length < 2) return null

  // Create direct connections between connected waypoints
  const lineSegments = [] as React.ReactNode[]
    waypoints.forEach((waypoint) => {
    // Get the position as a Vector3
    const position = Array.isArray(waypoint.position) 
      ? new THREE.Vector3(...waypoint.position)
      : waypoint.position
      
    // For each connection, draw a line to the connected waypoint
    waypoint.connections.forEach(connIndex => {
      // Find the connected waypoint
      const connectedWp = waypoints.find(wp => wp.index === connIndex)
      if (!connectedWp) return
      
      // Get the position of the connected waypoint
      const connPosition = Array.isArray(connectedWp.position) 
        ? new THREE.Vector3(...connectedWp.position)
        : connectedWp.position
        
      // Create a line between the waypoints
      const key = `line-${waypoint.index}-${connectedWp.index}`
      lineSegments.push(
        <Line
          key={key}
          points={[position, connPosition]}
          color="#00aaff"
          lineWidth={2}
          transparent
          opacity={0.7}
        />
      )
    })
  })
  
  return <group>{lineSegments}</group>
}

export default TrajectoryLineConnected
