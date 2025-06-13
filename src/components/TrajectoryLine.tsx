import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'

interface Waypoint {
  id: number
  index: number
  position: [number, number, number]
  connections: number[]
}

interface TrajectoryLineProps {
  waypoints: Waypoint[]
}

const TrajectoryLine: React.FC<TrajectoryLineProps> = ({ waypoints }) => {
  const points = useMemo(() => {
    return waypoints
      .sort((a, b) => a.index - b.index) // Sort by the new index property
      .map(wp => new THREE.Vector3(...wp.position)) // Convert to Vector3
  }, [waypoints])

  if (points.length < 2) return null

  // Create smooth curve through waypoints
  const curve = useMemo(() => {
    if (points.length === 2) {
      return new THREE.LineCurve3(points[0], points[1])
    }
    
    // Create a smooth curve through all points
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1)
  }, [points])

  const curvePoints = useMemo(() => {
    return curve.getPoints(Math.max(50, points.length * 10))
  }, [curve, points.length])
  return (
    <group>
      {/* Main trajectory line */}
      <Line
        points={curvePoints}
        color="#00aaff"
        lineWidth={3}
        transparent
        opacity={0.8}
      />
      
      {/* Direction arrows */}
      {points.slice(0, -1).map((point, index) => {
        const nextPoint = points[index + 1]
        const direction = new THREE.Vector3()
          .subVectors(nextPoint, point)
          .normalize()
        
        const arrowPosition = new THREE.Vector3()
          .addVectors(point, nextPoint)
          .multiplyScalar(0.5)
        
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
        
        return (
          <mesh
            key={`arrow-${index}`}
            position={[arrowPosition.x, arrowPosition.y, arrowPosition.z]}
            quaternion={[quaternion.x, quaternion.y, quaternion.z, quaternion.w]}
          >
            <coneGeometry args={[0.1, 0.3, 4]} />
            <meshBasicMaterial color="#ff6600" />
          </mesh>
        )
      })}
      
      {/* Waypoint connections (straight lines for reference) */}
      {points.slice(0, -1).map((point, index) => {
        const nextPoint = points[index + 1]
        
        return (
          <Line
            key={`connection-${index}`}
            points={[point, nextPoint]}
            color="#555555"
            lineWidth={1}
            transparent
            opacity={0.3}
            dashed
            dashSize={0.2}
            gapSize={0.1}
          />
        )
      })}
    </group>
  )
}

export default TrajectoryLine
