import React, { useMemo } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { Waypoint } from '../contexts/WaypointContext'

interface TrajectoryLineProps {
  waypoints: Waypoint[]
}

const TrajectoryLineSimple: React.FC<TrajectoryLineProps> = ({ waypoints }) => {
  if (waypoints.length < 2) return null

  const connectionElements = useMemo(() => {
    const elements: JSX.Element[] = []
    
    // Track which lines we've already drawn to avoid duplicates
    const processedLines = new Set<string>()
    
    // First, create all the lines between connected waypoints
    waypoints.forEach(waypoint => {
      waypoint.connections.forEach(connIndex => {
        // Find the target waypoint
        const targetWaypoint = waypoints.find(wp => wp.index === connIndex)
        if (!targetWaypoint) return
        
        // Create an undirected key for the line (smaller index first)
        const minIndex = Math.min(waypoint.index, targetWaypoint.index)
        const maxIndex = Math.max(waypoint.index, targetWaypoint.index)
        const lineKey = `${minIndex}-${maxIndex}`
        
        // Skip if we've already drawn this line
        if (processedLines.has(lineKey)) return
        processedLines.add(lineKey)
        
        // Draw the line - use the Vector3 positions directly
        const pointA = waypoint.position.clone()
        const pointB = targetWaypoint.position.clone()
        
        elements.push(
          <Line
            key={`line-${lineKey}`}
            points={[pointA, pointB]}
            color="#00aaff"
            lineWidth={2}
            transparent
            opacity={0.7}
          />
        )
      })
    })
    
    // Create a collection of all unique connection pairs
    // For each pair we'll determine exactly one direction for the arrow
    const connectionPairs: {source: Waypoint, target: Waypoint}[] = []
    const processedPairs = new Set<string>()
    
    waypoints.forEach(wp1 => {
      wp1.connections.forEach(connIndex => {
        const wp2 = waypoints.find(wp => wp.index === connIndex)
        if (!wp2) return
        
        // Create a unique key for this pair (always ordered by min-max index)
        const minIndex = Math.min(wp1.index, wp2.index)
        const maxIndex = Math.max(wp1.index, wp2.index)
        const pairKey = `${minIndex}-${maxIndex}`
        
        if (!processedPairs.has(pairKey)) {
          processedPairs.add(pairKey)
          
          // Determine the direction of the arrow - always from smaller to larger index
          // EXCEPT for return connections (where the larger index connects to the smaller index)
          const isReturn = wp1.index > wp2.index
          
          if (isReturn) {
            // For return connections, direction is from larger to smaller index
            connectionPairs.push({ source: wp1, target: wp2 })
          } else {
            // For normal connections, direction is from smaller to larger index
            connectionPairs.push({ source: minIndex === wp1.index ? wp1 : wp2, target: maxIndex === wp2.index ? wp2 : wp1 })
          }
        }
      })
    })
      // Now draw exactly one arrow for each pair
    connectionPairs.forEach(({source, target}) => {
      const startPoint = source.position.clone()
      const endPoint = target.position.clone()
      
      // Calculate arrow position (middle of the line)
      const midPoint = new THREE.Vector3()
        .addVectors(startPoint, endPoint)
        .multiplyScalar(0.5)
      
      // Calculate arrow direction
      const dirVector = new THREE.Vector3()
        .subVectors(endPoint, startPoint)
      
      // Only add arrow if points aren't too close
      if (dirVector.length() > 0.5) {
        dirVector.normalize()
        
        // Calculate rotation to align arrow with direction
        const arrowDirection = dirVector.clone()
        const up = new THREE.Vector3(0, 1, 0)
        const quaternion = new THREE.Quaternion()
        
        // Handle special case where direction is parallel to up vector
        if (Math.abs(arrowDirection.y) > 0.99) {
          quaternion.setFromUnitVectors(up, arrowDirection)
        } else {
          quaternion.setFromUnitVectors(up, arrowDirection)
        }
        
        // Add the arrow cone
        elements.push(
          <mesh
            key={`arrow-${source.index}-${target.index}`}
            position={[midPoint.x, midPoint.y, midPoint.z]}
            quaternion={quaternion}
          >
            <coneGeometry args={[0.1, 0.3, 8]} />
            <meshBasicMaterial color="#ff6600" />
          </mesh>
        )
      }
    })
    
    return elements
  }, [waypoints])
  
  return <group>{connectionElements}</group>
}

export default TrajectoryLineSimple
