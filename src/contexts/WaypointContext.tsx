import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import * as THREE from 'three'
import { useDrones } from './DroneContext'

export interface Waypoint {
  id: string
  droneId: string  // Added droneId to associate waypoints with specific drones
  index: number    // Numerical ID used for connections (can be decimal for curve points)
  name: string
  position: THREE.Vector3
  type: 'takeoff' | 'waypoint' | 'hover' | 'landing'
  altitude?: number
  speed?: number
  heading?: number
  connections: number[]  // Array of indices this waypoint is connected to
  displayIndex?: string  // Optional formatted index for display (e.g. "2.01")
}

// Interface for the curve edit mode
interface CurveEditState {
  active: boolean;
  startWaypointId: string | null;
  endWaypointId: string | null;
  controlPoints: THREE.Vector3[];  // Control points for the curve
}

interface WaypointContextType {
  waypoints: Waypoint[]
  selectedWaypoint: string | null
  isAddingWaypoint: boolean
  gridEnabled: boolean
  gridSize: number
  snapToGrid: boolean
  curveEditMode: CurveEditState
  showCurveControls: boolean
  
  // Actions
  addWaypoint: (waypoint: Omit<Waypoint, 'id' | 'droneId'>) => void
  removeWaypoint: (id: string) => void
  updateWaypoint: (id: string, updates: Partial<Waypoint>) => void
  selectWaypoint: (id: string | null) => void
  setIsAddingWaypoint: (adding: boolean) => void
  toggleGrid: () => void
  setGridSize: (size: number) => void
  toggleSnapToGrid: () => void
  toggleCurveControls: () => void
  clearAllWaypoints: () => void
  clearDroneWaypoints: (droneId: string) => void
  exportTrajectory: (droneId?: string) => string
  importTrajectory: (data: string, droneId?: string) => void
  
  // Multi-drone functions
  getWaypointsByDroneId: (droneId: string) => Waypoint[]
  moveWaypointsToDrone: (waypointIds: string[], targetDroneId: string) => void
  
  // Curve editing functions
  startCurveEdit: (startId: string, endId: string) => void
  updateCurveControlPoints: (controlPoints: THREE.Vector3[]) => void
  cancelCurveEdit: () => void
  finishCurveEdit: () => void
}

const WaypointContext = createContext<WaypointContextType | undefined>(undefined)

interface WaypointProviderProps {
  children: ReactNode
}

export const WaypointProvider: React.FC<WaypointProviderProps> = ({ children }) => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [selectedWaypoint, setSelectedWaypoint] = useState<string | null>(null)
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false)
  const [gridEnabled, setGridEnabled] = useState(true)
  const [gridSize, setGridSize] = useState(1)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [showCurveControls, setShowCurveControls] = useState(false)
  
  // Get selected drone from DroneContext
  const { selectedDroneId } = useDrones()
  
  // State for curve editing
  const [curveEditMode, setCurveEditMode] = useState<CurveEditState>({
    active: false,
    startWaypointId: null,
    endWaypointId: null,
    controlPoints: []
  })
    // When selected drone changes, deselect any waypoint
  useEffect(() => {
    setSelectedWaypoint(null)
  }, [selectedDroneId]);
  
  const addWaypoint = (waypointData: Omit<Waypoint, 'id' | 'droneId' | 'index' | 'connections'>) => {
    // Only allow adding if a drone is selected
    if (!selectedDroneId) return
    
    // Get only waypoints for the selected drone for index calculation
    const droneWaypoints = waypoints.filter(wp => wp.droneId === selectedDroneId)
    
    // Find the next available integer index
    const usedIndices = droneWaypoints.map(wp => Math.floor(wp.index))
    let newIndex = 1
    
    if (usedIndices.length > 0) {
      // Find max integer index and increment by 1
      newIndex = Math.max(...usedIndices) + 1
    }
    
    // Create the new waypoint with connections to the previous waypoint (if any)
    const newWaypoint: Waypoint = {
      ...waypointData,
      id: `waypoint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      droneId: selectedDroneId,
      index: newIndex,
      connections: newIndex > 1 ? [newIndex - 1] : []
    }
    
    // Find previous waypoint (closest integer index less than newIndex)
    // This handles cases where curve points exist
    if (droneWaypoints.length > 0) {
      const sortedWaypoints = [...droneWaypoints].sort((a, b) => b.index - a.index)
      const prevWaypoint = sortedWaypoints.find(wp => Math.floor(wp.index) < newIndex)
      
      if (prevWaypoint) {
        setWaypoints(prev => prev.map(wp => 
          wp.id === prevWaypoint.id
            ? { ...wp, connections: [...wp.connections.filter(c => c !== newIndex), newIndex] }
            : wp
        ))
        
        // Set new waypoint to connect back to previous
        newWaypoint.connections = [prevWaypoint.index]
      }
    }
    
    setWaypoints(prev => [...prev, newWaypoint])
    setSelectedWaypoint(newWaypoint.id)
    setIsAddingWaypoint(false)
  }
  const removeWaypoint = (id: string) => {
    // Get the waypoint to be removed
    const waypointToRemove = waypoints.find(wp => wp.id === id)
    if (!waypointToRemove) return

    // Get remaining waypoints after removing the selected one
    const filteredWaypoints = waypoints.filter(wp => wp.id !== id)
    
    if (filteredWaypoints.length === 0) {
      // If we removed the last waypoint, just clear everything
      setWaypoints([])
      setSelectedWaypoint(null)
      return
    }

    // Rebuild the entire waypoint sequence with proper connections
    const updatedWaypoints = filteredWaypoints
      // First sort them by their current index to maintain sequence
      .sort((a, b) => a.index - b.index)
      // Then reassign indices and connections
      .map((wp, idx) => {
        const newIndex = idx + 1 // New index (1-based)
        
        // For connections:
        // - Each waypoint is connected to the previous one (if it exists)
        // - Each waypoint is connected to the next one (if it exists)
        const connections: number[] = []
        
        // Connect to previous waypoint (if not the first one)
        if (idx > 0) {
          connections.push(idx) // Previous waypoint's new index
        }
        
        // Connect to next waypoint (if not the last one)
        if (idx < filteredWaypoints.length - 1) {
          connections.push(idx + 2) // Next waypoint's new index
        }
        
        return {
          ...wp,
          index: newIndex,
          connections
        }
      })
    
    setWaypoints(updatedWaypoints)
    if (selectedWaypoint === id) {
      setSelectedWaypoint(null)
    }
  }

  const updateWaypoint = (id: string, updates: Partial<Waypoint>) => {
    setWaypoints(prev => prev.map(wp => 
      wp.id === id ? { ...wp, ...updates } : wp
    ))
  }

  const selectWaypoint = (id: string | null) => {
    setSelectedWaypoint(id)
  }

  const toggleGrid = () => {
    setGridEnabled(prev => !prev)
  }
  const toggleSnapToGrid = () => {
    setSnapToGrid(prev => !prev)
  }
  
  const toggleCurveControls = () => {
    setShowCurveControls(prev => !prev)
  }

  const clearAllWaypoints = () => {
    setWaypoints([])
    setSelectedWaypoint(null)
  }

  const exportTrajectory = () => {
    const exportData = {
      version: '1.0',
      waypoints: waypoints.map(wp => ({
        ...wp,
        position: { x: wp.position.x, y: wp.position.y, z: wp.position.z }
      })),
      metadata: {
        exportDate: new Date().toISOString(),
        gridSize,
        snapToGrid
      }
    }
    return JSON.stringify(exportData, null, 2)
  }

  const importTrajectory = (data: string) => {
    try {
      const parsed = JSON.parse(data)
      if (parsed.waypoints && Array.isArray(parsed.waypoints)) {
        // Create new waypoints with Vector3 positions and add index/connections if not present
        const importedWaypoints: Waypoint[] = parsed.waypoints.map((wp: any, idx: number) => ({
          ...wp,
          position: new THREE.Vector3(wp.position.x, wp.position.y, wp.position.z),
          index: wp.index || (idx + 1),
          connections: wp.connections || []
        }))
        
        setWaypoints(importedWaypoints)
        setSelectedWaypoint(null)
        
        // Apply metadata if available
        if (parsed.metadata) {
          if (typeof parsed.metadata.gridSize === 'number') {
            setGridSize(parsed.metadata.gridSize)
          }
          if (typeof parsed.metadata.snapToGrid === 'boolean') {
            setSnapToGrid(parsed.metadata.snapToGrid)
          }
        }
      }
    } catch (error) {
      alert('Invalid trajectory data format')
      console.error('Import error:', error)
    }
  }  // Multi-drone functions
  const getWaypointsByDroneId = (droneId: string) => {
    return waypoints.filter(wp => wp.droneId === droneId);
  }
  
  const clearDroneWaypoints = (droneId: string) => {
    setWaypoints(prev => prev.filter(wp => wp.droneId !== droneId));
    setSelectedWaypoint(null);
  }
  
  const moveWaypointsToDrone = (waypointIds: string[], targetDroneId: string) => {
    setWaypoints(prev => prev.map(wp => 
      waypointIds.includes(wp.id) ? { ...wp, droneId: targetDroneId } : wp
    ));
  }
  
  // Curve editing functions
  const startCurveEdit = (startId: string, endId: string) => {
    // Find the waypoints
    const startWaypoint = waypoints.find(wp => wp.id === startId);
    const endWaypoint = waypoints.find(wp => wp.id === endId);
    
    if (!startWaypoint || !endWaypoint) return;
    
    // Check if waypoints are connected
    const areConnected = startWaypoint.connections.includes(endWaypoint.index) || 
                         endWaypoint.connections.includes(startWaypoint.index);
    
    if (!areConnected) {
      alert('Seçilen waypointler birbirine bağlı değil!');
      return;
    }
    
    // Initialize with 2 control points at midpoint positions
    const startPos = startWaypoint.position;
    const endPos = endWaypoint.position;
      // Calculate the midpoint for reference
    // const midPoint = new THREE.Vector3()
    //   .addVectors(startPos, endPos)
    //   .multiplyScalar(0.5);
    
    // Create control points (30% and 70% of the way from start to end)
    // offset slightly upwards
    const cp1 = new THREE.Vector3()
      .addVectors(
        startPos.clone().multiplyScalar(0.7),
        endPos.clone().multiplyScalar(0.3)
      )
      .add(new THREE.Vector3(0, 1, 0)); // Offset upward
    
    const cp2 = new THREE.Vector3()
      .addVectors(
        startPos.clone().multiplyScalar(0.3),
        endPos.clone().multiplyScalar(0.7)
      )
      .add(new THREE.Vector3(0, 1, 0)); // Offset upward
    
    setCurveEditMode({
      active: true,
      startWaypointId: startId,
      endWaypointId: endId,
      controlPoints: [cp1, cp2]
    });
  };

  const updateCurveControlPoints = (controlPoints: THREE.Vector3[]) => {
    setCurveEditMode(prev => ({
      ...prev,
      controlPoints
    }));
  };

  const cancelCurveEdit = () => {
    setCurveEditMode({
      active: false,
      startWaypointId: null,
      endWaypointId: null,
      controlPoints: []
    });
  };  const finishCurveEdit = () => {
    if (!curveEditMode.active || !curveEditMode.startWaypointId || !curveEditMode.endWaypointId) {
      return;
    }

    // Get the start and end waypoints
    const startWaypoint = waypoints.find(wp => wp.id === curveEditMode.startWaypointId);
    const endWaypoint = waypoints.find(wp => wp.id === curveEditMode.endWaypointId);
    
    if (!startWaypoint || !endWaypoint) {
      cancelCurveEdit();
      return;
    }

    // Create a Bezier curve with the control points
    const curve = new THREE.CubicBezierCurve3(
      startWaypoint.position,
      curveEditMode.controlPoints[0],
      curveEditMode.controlPoints[1],
      endWaypoint.position
    );
    
    // Get points along the curve (create intermediate waypoints)
    // Number of points should be proportional to the distance between waypoints
    const distance = startWaypoint.position.distanceTo(endWaypoint.position);
    const numPoints = Math.max(4, Math.round(distance * 2)); // At least 5 points (including endpoints)
    
    // Get points along the curve (excluding start and end)
    const points = curve.getPoints(numPoints);
    const intermediatePoints = points.slice(1, points.length - 1);
      // Use fractional indices for curve points
    // Always use the smaller index as the base index for curve points
    let baseIndex;
    
    // Use integer part of the waypoint indices
    if (Math.floor(startWaypoint.index) < Math.floor(endWaypoint.index)) {
      baseIndex = Math.floor(startWaypoint.index);
    } else {
      baseIndex = Math.floor(endWaypoint.index);
    }
    
    // Create curve waypoints with fractional indices
    const newWaypoints: Waypoint[] = intermediatePoints.map((point, idx) => {      // Calculate fractional index between the start and end waypoints
      // Use a small increment for unique indices that won't interfere with integers
      const fraction = baseIndex + (idx + 1) * 0.01;
      
      // Format a display index for UI (e.g., "2.01")
      const pointNumber = idx + 1;
      const decimalPart = pointNumber < 10 ? `0${pointNumber}` : pointNumber;
      const displayIndex = `${baseIndex}.${decimalPart}`;
        return {
        id: `waypoint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${idx}`,
        droneId: startWaypoint.droneId, // Use the same drone ID as the start waypoint
        index: fraction,
        name: `Curve Point ${idx + 1}`,
        position: point.clone(),
        type: 'waypoint',
        connections: [], // Will set connections after creating all waypoints
        altitude: startWaypoint.altitude || 3,
        speed: startWaypoint.speed || 5,
        displayIndex: displayIndex
      };
    });
    
    // Set up connections for curve waypoints
    if (newWaypoints.length > 0) {
      // Connect curve waypoints to each other
      for (let i = 0; i < newWaypoints.length - 1; i++) {
        newWaypoints[i].connections.push(newWaypoints[i + 1].index);
      }
      
      // Connect start waypoint to first curve waypoint
      const updatedStartWaypoint = {
        ...startWaypoint,
        connections: startWaypoint.connections
          .filter(connIdx => connIdx !== endWaypoint.index) // Remove direct connection to end
          .concat(newWaypoints[0].index) // Connect to first curve waypoint
      };
      
      // Connect last curve waypoint to end waypoint
      const lastNewWaypoint = newWaypoints[newWaypoints.length - 1];
      lastNewWaypoint.connections.push(endWaypoint.index);
      
      // Update end waypoint to remove connection to start
      const updatedEndWaypoint = {
        ...endWaypoint,
        connections: endWaypoint.connections
          .filter(connIdx => connIdx !== startWaypoint.index) // Remove direct connection to start
      };
      
      // Combine all waypoints (keep all existing waypoints since we're using fractional indices)
      const waypointsWithoutStartEnd = waypoints.filter(
        wp => wp.id !== startWaypoint.id && wp.id !== endWaypoint.id
      );
      
      const allWaypoints = [
        ...waypointsWithoutStartEnd,
        updatedStartWaypoint,
        ...newWaypoints,
        updatedEndWaypoint
      ];
      
      // Sort the waypoints by their index to ensure proper order
      allWaypoints.sort((a, b) => a.index - b.index);
      
      setWaypoints(allWaypoints);
    }
    
    // Exit curve edit mode
    cancelCurveEdit();
  };  const value: WaypointContextType = {
    waypoints,
    selectedWaypoint,
    isAddingWaypoint,
    gridEnabled,
    gridSize,
    snapToGrid,
    curveEditMode,
    showCurveControls,
    addWaypoint,
    removeWaypoint,
    updateWaypoint,
    selectWaypoint,
    setIsAddingWaypoint,
    toggleGrid,
    setGridSize,
    toggleSnapToGrid,
    toggleCurveControls,
    clearAllWaypoints,
    clearDroneWaypoints,
    exportTrajectory,
    importTrajectory,
    getWaypointsByDroneId,
    moveWaypointsToDrone,
    startCurveEdit,
    updateCurveControlPoints,
    cancelCurveEdit,
    finishCurveEdit
  }

  return (
    <WaypointContext.Provider value={value}>
      {children}
    </WaypointContext.Provider>
  )
}

export const useWaypoints = () => {
  const context = useContext(WaypointContext)
  if (context === undefined) {
    throw new Error('useWaypoints must be used within a WaypointProvider')
  }
  return context
}
