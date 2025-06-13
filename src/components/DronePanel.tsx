import React, { useState } from 'react'
import { useDrones } from '../contexts/DroneContext'
import { useWaypoints } from '../contexts/WaypointContext'
import './DronePanel.css'

const DronePanel: React.FC = () => {  const {
    drones,
    selectedDroneId,
    addDrone,
    removeDrone,
    selectDrone,
    updateDrone,
    toggleDroneVisibility
  } = useDrones();
  
  const { getWaypointsByDroneId, clearDroneWaypoints } = useWaypoints();
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  
  const handleExportCSV = (droneId: string) => {
    const drone = drones.find(d => d.id === droneId);
    if (!drone) return;
    
    const droneWaypoints = getWaypointsByDroneId(droneId);
    if (droneWaypoints.length === 0) {
      alert('Bu drone için waypoint bulunamadı!');
      return;
    }

    let csvContent = 'X,Y,Z\n';
      
    // Export waypoints in their original order
    droneWaypoints.forEach((waypoint) => {
      const { x, y, z } = waypoint.position;
      // Format as float with 2 decimal places
      const formattedX = Number(x).toFixed(2);
      const formattedY = Number(-y).toFixed(2);
      const formattedZ = Number(-z).toFixed(2);
      csvContent += `${formattedX},${formattedZ},${formattedY}\n`;
    });
    
    // Check if the return functionality is active (last connects to first)
    if (droneWaypoints.length >= 2) {
      const firstWaypoint = droneWaypoints[0];
      const lastWaypoint = droneWaypoints[droneWaypoints.length - 1];
      
      if (lastWaypoint.connections.includes(firstWaypoint.index)) {
        const { x, y, z } = firstWaypoint.position;
        const formattedX = Number(x).toFixed(2);
        const formattedY = Number(-y).toFixed(2);
        const formattedZ = Number(-z).toFixed(2);
        csvContent += `${formattedX},${formattedZ},${formattedY}\n`;
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trajectory_${drone.name}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleExportAllCSV = () => {
    if (drones.length === 0) return;
    
    // Create a ZIP file with all drone trajectories
    alert('Tüm drone verilerini CSV olarak dışa aktarılıyor...');
    
    // For each visible drone, create a csv file
    drones.filter(d => d.isVisible).forEach(drone => {
      handleExportCSV(drone.id);
    });
  }
  
  const handleClearDroneWaypoints = (droneId: string) => {
    if (confirm('Bu drone için tüm noktaları silmek istediğinizden emin misiniz?')) {
      clearDroneWaypoints(droneId);
    }
  }
  
  const handleDroneNameChange = (id: string, name: string) => {
    updateDrone(id, { name });
  }
  
  const handleColorChange = (id: string, color: string) => {
    updateDrone(id, { color });
    setShowColorPicker(null);
  }
  
  return (
    <div className="drone-panel">
      <div className="drone-panel-header">
        <h3>🚁 Dronelar</h3>
        <button 
          className="add-drone-button"
          onClick={() => addDrone()}
        >
          + Yeni Drone
        </button>
      </div>
      
      <div className="drone-list">
        {drones.map((drone) => {
          const waypointCount = getWaypointsByDroneId(drone.id).length;
          
          return (
            <div 
              key={drone.id}
              className={`drone-item ${selectedDroneId === drone.id ? 'selected' : ''}`}
              onClick={() => selectDrone(drone.id)}
            >
              <div className="drone-color-indicator" style={{ backgroundColor: drone.color }} />
              
              <div className="drone-info">
                <input 
                  type="text" 
                  value={drone.name}
                  onChange={(e) => handleDroneNameChange(drone.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="drone-details">
                  <span>Noktalar: {waypointCount}</span>
                  <div 
                    className="drone-color-picker-trigger"
                    style={{ backgroundColor: drone.color }} 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowColorPicker(showColorPicker === drone.id ? null : drone.id);
                    }}
                  />
                  
                  {showColorPicker === drone.id && (
                    <div className="color-picker-popup" onClick={e => e.stopPropagation()}>
                      {['#FF5733', '#33A8FF', '#33FF57', '#F033FF', '#FFFF33', '#FF33A8', '#33FFF5', '#888888'].map(color => (
                        <div 
                          key={color}
                          className="color-option"
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorChange(drone.id, color)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="drone-actions">
                <button 
                  className={`visibility-toggle ${drone.isVisible ? 'visible' : 'hidden'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDroneVisibility(drone.id);
                  }}
                  title={drone.isVisible ? 'Gizle' : 'Göster'}
                >
                  {drone.isVisible ? '👁️' : '👁️‍🗨️'}
                </button>
                
                <button
                  className="export-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportCSV(drone.id);
                  }}
                  title="CSV olarak dışa aktar"
                  disabled={waypointCount === 0}
                >
                  📊
                </button>
                
                <button
                  className="clear-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearDroneWaypoints(drone.id);
                  }}
                  title="Tüm noktaları temizle"
                  disabled={waypointCount === 0}
                >
                  🗑️
                </button>
                
                {drones.length > 1 && (
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`"${drone.name}" droneunu silmek istediğinizden emin misiniz?`)) {
                        removeDrone(drone.id);
                      }
                    }}
                    title="Droneyu sil"
                  >
                    ❌
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {drones.length > 1 && (
        <div className="all-drones-actions">
          <button 
            className="export-all-button"
            onClick={handleExportAllCSV}
          >
            📊 Tüm Droneları Dışa Aktar
          </button>
        </div>
      )}
    </div>
  )
}

export default DronePanel
