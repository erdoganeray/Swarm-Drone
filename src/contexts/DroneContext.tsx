import React, { createContext, useContext, useState, ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'

// Define drone model with unique ID and color
export interface Drone {
  id: string
  name: string
  color: string
  isVisible: boolean
}

// Interface for the context
interface DroneContextType {
  drones: Drone[]
  selectedDroneId: string | null
  
  // Actions
  addDrone: (name?: string, color?: string) => void
  removeDrone: (id: string) => void
  selectDrone: (id: string | null) => void
  updateDrone: (id: string, updates: Partial<Drone>) => void
  toggleDroneVisibility: (id: string) => void
  getDroneById: (id: string) => Drone | undefined
}

// Create the context
const DroneContext = createContext<DroneContextType | undefined>(undefined)

// Default drone colors for new drones
const DEFAULT_COLORS = [
  '#FF5733', // Orange/Red
  '#33A8FF', // Blue
  '#33FF57', // Green
  '#F033FF', // Purple
  '#FFFF33', // Yellow
  '#FF33A8', // Pink
  '#33FFF5'  // Cyan
]

// Provider component
interface DroneProviderProps {
  children: ReactNode
}

export const DroneProvider: React.FC<DroneProviderProps> = ({ children }) => {
  const [drones, setDrones] = useState<Drone[]>([
    // Initialize with one default drone
    {
      id: 'drone-1',
      name: 'Drone 1',
      color: DEFAULT_COLORS[0],
      isVisible: true
    }
  ])
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>('drone-1')

  // Add a new drone
  const addDrone = (name?: string, color?: string) => {
    const id = `drone-${uuidv4()}`
    const droneNum = drones.length + 1
    const newDrone: Drone = {
      id,
      name: name || `Drone ${droneNum}`,
      color: color || DEFAULT_COLORS[droneNum % DEFAULT_COLORS.length],
      isVisible: true
    }
    setDrones(prev => [...prev, newDrone])
    setSelectedDroneId(id) // Select the newly created drone
  }

  // Remove a drone
  const removeDrone = (id: string) => {
    // Don't remove the last drone
    if (drones.length <= 1) {
      alert("En az bir drone kalmak zorunda!")
      return
    }
    
    setDrones(prev => prev.filter(drone => drone.id !== id))
    
    // If we removed the selected drone, select another one
    if (selectedDroneId === id) {
      setSelectedDroneId(drones.find(drone => drone.id !== id)?.id || null)
    }
  }

  // Update a drone's properties
  const updateDrone = (id: string, updates: Partial<Drone>) => {
    setDrones(prev => prev.map(drone => 
      drone.id === id ? { ...drone, ...updates } : drone
    ))
  }

  // Select a drone
  const selectDrone = (id: string | null) => {
    setSelectedDroneId(id)
  }

  // Toggle drone visibility in the scene
  const toggleDroneVisibility = (id: string) => {
    setDrones(prev => prev.map(drone => 
      drone.id === id ? { ...drone, isVisible: !drone.isVisible } : drone
    ))
  }

  // Get drone by ID
  const getDroneById = (id: string) => {
    return drones.find(drone => drone.id === id)
  }

  // Context value
  const value: DroneContextType = {
    drones,
    selectedDroneId,
    addDrone,
    removeDrone,
    selectDrone,
    updateDrone,
    toggleDroneVisibility,
    getDroneById
  }

  return (
    <DroneContext.Provider value={value}>
      {children}
    </DroneContext.Provider>
  )
}

// Custom hook to use the drone context
export const useDrones = () => {
  const context = useContext(DroneContext)
  if (context === undefined) {
    throw new Error('useDrones must be used within a DroneProvider')
  }
  return context
}
