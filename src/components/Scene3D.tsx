import React, { useEffect } from 'react'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import TrajectoryLineSimple from './TrajectoryLineSimple'
import Grid from './Grid'
import CurveEditor from './CurveEditor'
import { useWaypoints, Waypoint } from '../contexts/WaypointContext'
import { useDrones } from '../contexts/DroneContext'

interface Scene3DProps {
  selectedAltitude: number
  onWaypointsChange?: (waypoints: Waypoint[]) => void
  snapToGrid?: boolean
  waypointType?: 'takeoff' | 'waypoint' | 'hover' | 'landing' | 'return'
  clearTrigger?: boolean
}

const Scene3D: React.FC<Scene3DProps> = ({ 
  selectedAltitude, 
  onWaypointsChange, 
  snapToGrid = true, 
  waypointType = 'waypoint', 
  clearTrigger 
}) => {
  const {
    waypoints,
    addWaypoint,
    updateWaypoint,
    removeWaypoint,
    clearAllWaypoints,
    curveEditMode
  } = useWaypoints();
  
  // Get drone information from DroneContext
  const { drones, selectedDroneId } = useDrones();

  const gridSize = 0.5 // Fixed grid size for snap functionality
      // Return waypoint logic - run immediately when button is pressed
  useEffect(() => {
    if (waypointType === 'return' && waypoints.length > 1) {
      // Get the first and last waypoints
      const firstWaypoint = waypoints[0]
      const lastWaypoint = waypoints[waypoints.length - 1]
      
      // Create a direct connection from last waypoint to the first waypoint (one way only)
      // This ensures the arrow points correctly from last to first waypoint
      const updatedConnections = [...lastWaypoint.connections]
      
      // Only add connection if it doesn't already exist
      if (!updatedConnections.includes(firstWaypoint.index)) {
        updatedConnections.push(firstWaypoint.index)
        
        // Update the last waypoint with new connection
        updateWaypoint(lastWaypoint.id, {
          connections: updatedConnections
        })
        
        // Notify parent component about waypoint changes
        onWaypointsChange?.(waypoints)
      }
    }
  }, [waypointType, waypoints])
  
  // Clear trigger effect
  useEffect(() => {
    if (clearTrigger) {
      clearAllWaypoints()
    }
  }, [clearTrigger])
    // waypoints state'ini dışarıdan güncelleyebilmek için
  useEffect(() => {
    if (onWaypointsChange) {
      onWaypointsChange(waypoints)
    }
  }, [waypoints, onWaypointsChange])
    const handleGroundDoubleClick = (event: any) => {
    // Don't add waypoints if in curve edit mode or return mode
    if (waypointType === 'return' || curveEditMode.active) {
      return
    }
    
    // Only add waypoints if a drone is selected
    if (!selectedDroneId) {
      alert('Önce bir drone seçmelisiniz!');
      return;
    }
    
    // Get the clicked position
    const point = event.point
    // Snap to grid if enabled
    let x = point.x
    let z = point.z
    
    if (snapToGrid) {
      x = Math.round(point.x / gridSize) * gridSize
      z = Math.round(point.z / gridSize) * gridSize
      console.log(`Grid Snap ON: Original(${point.x.toFixed(2)}, ${point.z.toFixed(2)}) -> Snapped(${x}, ${z})`)
    } else {
      console.log(`Grid Snap OFF: Using original position(${x.toFixed(2)}, ${z.toFixed(2)})`)
    }
    
    // Get waypoints for this drone to calculate proper naming
    const droneWaypoints = waypoints.filter(wp => wp.droneId === selectedDroneId);
      // Add the new waypoint through context
    addWaypoint({
      name: `Waypoint ${droneWaypoints.length + 1}`,
      position: new THREE.Vector3(x, selectedAltitude, z),
      type: waypointType,
      altitude: selectedAltitude,
      speed: 5,
      index: 0, // This will be set correctly in the context
      connections: [] // This will be set correctly in the context
    })
  }
  
  const handleWaypointRightClick = (waypointId: string) => {
    // Don't remove waypoints if in curve edit mode
    if (curveEditMode.active) {
      return
    }
    // Simply use the removeWaypoint function from the context
    removeWaypoint(waypointId)
  }
  
  const getWaypointColor = (type: 'takeoff' | 'waypoint' | 'hover' | 'landing' | 'return') => {
    switch (type) {
      case 'takeoff': return '#00ff00'  // Green
      case 'waypoint': return '#ff0000' // Red
      case 'hover': return '#ffff00'    // Yellow
      case 'landing': return '#0000ff'  // Blue
      case 'return': return '#ff6600'   // Orange
      default: return '#ff0000'
    }
  }
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Controls */}
      <OrbitControls enablePan enableZoom enableRotate />
      
      {/* Grid */}
      <Grid size={50} divisions={50} visible={true} />
      
      {/* Center Line - Z ekseni boyunca kırmızı çizgi */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.05, 0.1, 25]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      
      {/* Center Line - X ekseni boyunca kırmızı çizgi */}
      <mesh position={[0, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.05, 0.1, 25]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
        {/* Trajectory Lines - One per drone */}
      {drones.filter(drone => drone.isVisible).map(drone => {
        // Get waypoints for this drone
        const droneWaypoints = waypoints.filter(wp => wp.droneId === drone.id);
        return (
          <TrajectoryLineSimple 
            key={drone.id} 
            waypoints={droneWaypoints} 
            droneColor={drone.color} 
          />
        );
      })}
      
      {/* Ground plane */}
      <mesh 
        position={[0, 0, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onDoubleClick={handleGroundDoubleClick}
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="lightgreen" transparent opacity={0.8} />
      </mesh>      {/* Waypoints - Only render waypoints for visible drones */}
      {waypoints
        .filter(waypoint => {
          // Find the drone this waypoint belongs to
          const drone = drones.find(d => d.id === waypoint.droneId);
          // Only show waypoints for visible drones and selected drone
          return drone && drone.isVisible;
        })
        .map((waypoint) => {
          // Find the drone this waypoint belongs to (for color)
          const drone = drones.find(d => d.id === waypoint.droneId);
          const droneColor = drone?.color || '#ffffff';
          
          // Find all incoming and outgoing connections
          const outgoingConnections = waypoint.connections || [];
          
          // Find incoming connections (waypoints that connect to this one)
          const incomingConnections = waypoints
            .filter(wp => wp.id !== waypoint.id && 
                    wp.droneId === waypoint.droneId && // Only connect within same drone
                    wp.connections.includes(waypoint.index))
            .map(wp => wp.index);
          
          // Combine unique connections for display
          const allConnections = Array.from(new Set([...outgoingConnections, ...incomingConnections])).sort((a, b) => a - b);
          
          const connectionsText = allConnections.length > 0 
            ? `(${allConnections.join(', ')})` 
            : '';
            
          // Highlight waypoints of selected drone with more opacity
          const isSelectedDrone = waypoint.droneId === selectedDroneId;
          const waypointOpacity = isSelectedDrone ? 1.0 : 0.6;
            
          return (
          <group key={waypoint.id}>
            {/* Waypoint sphere */}
            <mesh 
              position={waypoint.position}
              onContextMenu={(e) => {
                e.stopPropagation()
                handleWaypointRightClick(waypoint.id)
              }}
            >
              <sphereGeometry args={[0.3]} />
              <meshStandardMaterial 
                color={getWaypointColor(waypoint.type)} 
                opacity={waypointOpacity}
                transparent={!isSelectedDrone}
              />
            </mesh>
            
            {/* Drone color indicator ring */}
            <mesh 
              position={waypoint.position}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[0.32, 0.36, 16]} />
              <meshBasicMaterial color={droneColor} />
            </mesh>
            
            {/* Large ID number directly above sphere - more visible */}
            <Text
              position={[waypoint.position.x, waypoint.position.y + 0.5, waypoint.position.z]}
              fontSize={0.4}
              color="white"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              renderOrder={1}
              depthOffset={-10} // Ensure text renders above everything else
            >
              {waypoint.index}
            </Text>
            
            {/* Connections text - Display above ID for first waypoint, else on top */}
            <Text
              position={[
                waypoint.position.x, 
                waypoint.position.y + (waypoint.index === 1 ? 1.0 : 1.0), 
                waypoint.position.z
              ]}
              fontSize={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {connectionsText}
            </Text>
          </group>
        )})}
      
      {/* Add the Curve Editor component */}
      <CurveEditor />
    </>
  )
}

export default Scene3D
