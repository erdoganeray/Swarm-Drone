import React from 'react';
import { useWaypoints } from '../contexts/WaypointContext';
import { useGUIManager } from './GUIManager';
import './TrajectoryPlanner.css';

interface TrajectoryPlannerProps {
  selectedAltitude: number;
  setSelectedAltitude: (altitude: number) => void;
  waypoints: any[];
  waypointType: 'takeoff' | 'waypoint' | 'hover' | 'landing' | 'return';
  onWaypointTypeChange: (newType: 'takeoff' | 'waypoint' | 'hover' | 'landing' | 'return') => void;
  onClearTrigger: () => void;
}

const TrajectoryPlanner: React.FC<TrajectoryPlannerProps> = ({
  selectedAltitude,
  setSelectedAltitude,
  waypoints,
  waypointType,
  onWaypointTypeChange,
  onClearTrigger
}) => {
  const { isPanelVisible } = useGUIManager();
  
  // Don't render if the panel is not visible
  if (!isPanelVisible('trajectory-planner')) return null;
  
  const { 
    toggleCurveControls, 
    showCurveControls,
    clearAllWaypoints: contextClearAllWaypoints
  } = useWaypoints();
  
  // Clear all waypoints function
  const clearAllWaypoints = () => {    
    if (waypoints.length === 0) return;
    if (confirm('Tüm waypoint\'leri silmek istediğinizden emin misiniz?')) {
      onClearTrigger(); // Notify App component to update clearTrigger
      contextClearAllWaypoints(); // Clear waypoints in context
    }
  };

  return (
    <div className="trajectory-planner-container">
      <h3>🚁 Drone Trajectory Planner</h3>
      
      {/* Altitude Control */}
      <div className="control-section">
        <label>
          ✈️ Waypoint Yüksekliği: {selectedAltitude}m
        </label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={selectedAltitude}
          onChange={(e) => setSelectedAltitude(Number(e.target.value))}
        />
        <div className="range-labels">
          <span>0m</span>
          <span>10m</span>
        </div>
      </div>
      
      {/* Quick Altitude Buttons */}
      <div className="control-section">
        <div className="section-title">🎯 Hızlı Seçim:</div>
        <div className="button-grid">
          {[0, 1, 2, 3, 5, 8, 10].map(alt => (
            <button
              key={alt}
              onClick={() => setSelectedAltitude(alt)}
              className={selectedAltitude === alt ? 'active' : ''}
            >
              {alt}m
            </button>
          ))}
        </div>
      </div>
      
      {/* Waypoint Type Selection */}
      <div className="control-section">
        <div className="section-title">🎯 Waypoint Türü:</div>
        <div className="button-grid">
          {[
            { type: 'takeoff', label: '🛫 Kalkış', color: '#00ff00' },
            { type: 'waypoint', label: '📍 Nokta', color: '#ff0000' },
            { type: 'hover', label: '⏸️ Hover', color: '#ffff00' },
            { type: 'landing', label: '🛬 İniş', color: '#0000ff' },
            { type: 'return', label: '🔄 Return', color: '#ff6600' }
          ].map(({ type, label, color }) => (              <button
                key={type}
                onClick={() => onWaypointTypeChange(type as any)}
                className={waypointType === type ? 'active' : ''}
                style={{
                  background: waypointType === type ? color : undefined,
                  color: waypointType === type ? '#000' : undefined
                }}
              >
                {label}
              </button>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="control-section">
        <div className="section-title">⚡ İşlemler:</div>
        <div className="action-buttons">
          <button
            onClick={clearAllWaypoints}
            disabled={waypoints.length === 0}
            className="delete-button"
          >
            🗑️ Tümünü Temizle
          </button>
          
          <button
            onClick={toggleCurveControls}
            className={`curve-button ${showCurveControls ? 'active' : ''}`}
          >
            {showCurveControls ? '✓ Yol Düzenleyici (Aktif)' : '✎ Yol Düzenleyici'}
          </button>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="instructions-section">
        <div className="instructions-title">
          <strong>📋 Nasıl Kullanılır:</strong>
        </div>
        <div className="instructions-text">
          • Yükseklik ve waypoint türü seçin<br/>
          • Zemine <strong>çift tıklayın</strong> → Waypoint eklenir<br/>
          • <strong>Return</strong> butonu → Son waypoint'i ilk waypoint'e bağlar<br/>
          • Waypoint'e <strong>sağ tıklayın</strong> → Waypoint silinir<br/>
          • Mouse: Döndür | Scroll: Zoom | Sağ tık: Pan<br/>
          • Grid snap otomatik olarak aktif (0.5m hassasiyet)
        </div>
      </div>
      
      {/* Statistics */}
      <div className="statistics-section">
        <div>📍 Aktif Yükseklik: <strong>{selectedAltitude}m</strong></div>
        <div>🎯 Waypoint Sayısı: <strong>{waypoints.length}</strong></div>
        {waypoints.length > 1 && (
          <div>📏 Toplam Mesafe: <strong>
            {waypoints.reduce((total, wp, index) => {
              if (index === 0) return 0;
              const prev = waypoints[index - 1];
              const dx = wp.position[0] - prev.position[0];
              const dy = wp.position[1] - prev.position[1];
              const dz = wp.position[2] - prev.position[2];
              return total + Math.sqrt(dx*dx + dy*dy + dz*dz);
            }, 0).toFixed(1)}m
          </strong></div>
        )}
      </div>
    </div>
  );
};

export default TrajectoryPlanner;
