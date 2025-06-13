<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Drone Trajectory Planning Application

This is a 3D web-based drone trajectory planning application built with React, TypeScript, Three.js, and React Three Fiber.

## Key Technologies
- **React 18** with TypeScript for UI components
- **Three.js** and **@react-three/fiber** for 3D rendering
- **@react-three/drei** for 3D helpers and utilities
- **Zustand** for state management (waypoints)
- **Vite** for fast development and building

## Architecture
- **Context-based state management** for waypoints using React Context
- **Component-based architecture** with separation of concerns
- **3D Scene management** with modular components

## Coding Guidelines
- Use TypeScript for all components
- Follow React functional component patterns with hooks
- Use Three.js Vector3 for 3D positions
- Implement proper prop interfaces for all components
- Use CSS-in-JS or CSS modules for styling
- Keep 3D logic separate from UI logic

## Features to Remember
- 3D waypoint placement and editing
- Grid system with snap-to-grid functionality
- Trajectory visualization with smooth curves
- Import/export functionality for flight paths
- Real-time 3D scene interaction
- Multiple waypoint types (takeoff, waypoint, hover, landing)

## Common Patterns
- Use `useWaypoints()` hook to access waypoint state
- Use `useFrame()` for animations in 3D components
- Use `useThree()` for accessing Three.js context
- Event handling in 3D space using raycasting
- Position updates should maintain Three.js Vector3 format
