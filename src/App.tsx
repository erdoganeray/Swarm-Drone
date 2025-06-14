import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import Scene3D from './components/Scene3D';
import CurveEditorControls from './components/CurveEditorControls';
import DronePanel from './components/DronePanel';
import TrajectoryPlanner from './components/TrajectoryPlanner';
import GUIMenu, { GUIManagerProvider } from './components/GUIManager';

function App() {
  const [selectedAltitude, setSelectedAltitude] = useState(2);
  const [waypoints, setWaypoints] = useState<any[]>([]);
  const snapToGrid = true; // Always enabled
  const [waypointType, setWaypointType] = useState<'takeoff' | 'waypoint' | 'hover' | 'landing' | 'return'>('waypoint');
  const [clearTrigger, setClearTrigger] = useState(false);
  
  // Handle waypoint changes from Scene3D
  const handleWaypointsChange = (newWaypoints: any[]) => {
    setWaypoints(newWaypoints);
  };
  
  // Waypoint type change handler to be passed to TrajectoryPlanner
  const handleWaypointTypeChange = (newType: 'takeoff' | 'waypoint' | 'hover' | 'landing' | 'return') => {
    setWaypointType(newType);
    // Return waypoint seçildiğinde, işlem tamamlandıktan sonra normal waypoint'e dön
    if (newType === 'return') {
      setTimeout(() => {
        setWaypointType('waypoint');
      }, 500); // 500ms bekle ki return işlemi tamamlansın
    }
  };
  const handleClearTrigger = () => {
    setClearTrigger(prev => !prev);
  };

  return (
    <GUIManagerProvider>
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        {/* Main GUI Menu */}
        <GUIMenu />
        
        {/* Trajectory Planner Panel */}
        <TrajectoryPlanner 
          selectedAltitude={selectedAltitude}
          setSelectedAltitude={setSelectedAltitude}
          waypoints={waypoints}
          waypointType={waypointType}
          onWaypointTypeChange={handleWaypointTypeChange}
          onClearTrigger={handleClearTrigger}
        />
        
        {/* Drone Management Panel */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
          <DronePanel />
        </div>
        
        {/* Curve Editor Controls */}
        <CurveEditorControls />
        
        <Canvas
          camera={{
            position: [10, 10, 10],
            fov: 50,
          }}
        >
          <Scene3D
            selectedAltitude={selectedAltitude} 
            onWaypointsChange={handleWaypointsChange}
            snapToGrid={snapToGrid}
            waypointType={waypointType}
            clearTrigger={clearTrigger}
          />
        </Canvas>
      </div>
    </GUIManagerProvider>
  );
}

export default App;
