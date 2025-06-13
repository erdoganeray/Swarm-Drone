import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { Waypoint, useWaypoints } from '../contexts/WaypointContext'

interface WaypointMarkerProps {
  waypoint: Waypoint
}

const WaypointMarker: React.FC<WaypointMarkerProps> = ({ waypoint }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const { selectedWaypoint, selectWaypoint } = useWaypoints()
  const [hovered, setHovered] = useState(false)
  
  const isSelected = selectedWaypoint === waypoint.id
  
  // Animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      if (isSelected) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1)
      }
    }
  })

  const getMarkerColor = () => {
    switch (waypoint.type) {
      case 'takeoff':
        return '#00ff00' // Green
      case 'landing':
        return '#ff0000' // Red
      case 'hover':
        return '#ffff00' // Yellow
      default:
        return '#0088ff' // Blue
    }
  }
  
  const handleClick = (e: any) => {
    e.stopPropagation()
    selectWaypoint(waypoint.id)
  }
  // Get all waypoints from context to find incoming connections
  const { waypoints } = useWaypoints()
  
  // Format connections for display
  const getConnectionsText = () => {
    // Get outgoing connections from this waypoint
    const outgoingConnections = waypoint.connections
    
    // Find incoming connections (waypoints that connect to this one)
    const incomingConnections = waypoints
      .filter(wp => wp.id !== waypoint.id && wp.connections.includes(waypoint.index))
      .map(wp => wp.index)
    
    // Combine unique connections for display
    const allConnections = Array.from(new Set([...outgoingConnections, ...incomingConnections])).sort((a, b) => a - b)
    
    return allConnections.length > 0 ? `(${allConnections.join(', ')})` : ''
  }
  
  const connectionsText = getConnectionsText()

  return (
    <group position={waypoint.position}>
      {/* Main marker sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        castShadow
      >
        <sphereGeometry args={[0.3]} />
        <meshLambertMaterial 
          color={getMarkerColor()} 
          transparent
          opacity={hovered ? 0.8 : 1.0}
        />
      </mesh>
      
      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
          <ringGeometry args={[0.5, 0.7, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      )}
      
      {/* Altitude line */}
      <mesh position={[0, -waypoint.position.y / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, waypoint.position.y]} />
        <meshBasicMaterial color="#666666" transparent opacity={0.3} />
      </mesh>
        {/* ID Number on the sphere */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {waypoint.displayIndex || 
          (Number.isInteger(waypoint.index) ? waypoint.index : Math.floor(waypoint.index))}
      </Text>
      
      {/* Connections text */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {connectionsText}
      </Text>
      
      {/* Name text */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {waypoint.name}
      </Text>
      
      {/* Altitude text */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color="#cccccc"
        anchorX="center"
        anchorY="middle"
      >
        {waypoint.altitude?.toFixed(1)}m
      </Text>
    </group>
  )
}

export default WaypointMarker
