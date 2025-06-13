import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import Scene3D from './components/Scene3D'
import CurveEditorControls from './components/CurveEditorControls'
import { useWaypoints } from './contexts/WaypointContext'

function App() {  const { 
    toggleCurveControls, 
    showCurveControls,
    clearAllWaypoints: contextClearAllWaypoints
  } = useWaypoints()
  
  const [selectedAltitude, setSelectedAltitude] = useState(2)
  const [waypoints, setWaypoints] = useState<any[]>([])
  const snapToGrid = true // Always enabled
  const [waypointType, setWaypointType] = useState<'takeoff' | 'waypoint' | 'hover' | 'landing' | 'return'>('waypoint')
  const [clearTrigger, setClearTrigger] = useState(false)
    const handleWaypointTypeChange = (newType: 'takeoff' | 'waypoint' | 'hover' | 'landing' | 'return') => {
    setWaypointType(newType)
    // Return waypoint seçildiğinde, işlem tamamlandıktan sonra normal waypoint'e dön
    if (newType === 'return') {
      setTimeout(() => {
        setWaypointType('waypoint')
      }, 500) // 500ms bekle ki return işlemi tamamlansın
    }
  }  // Scene3D'den gelen waypoint değişikliklerini yalnızca local state'e yansıtalım
  // Context'i doğrudan kullanan Scene3D kendi güncelleme işlemlerini yapıyor
  const handleWaypointsChange = (newWaypoints: any[]) => {
    setWaypoints(newWaypoints)
  }
    const exportTrajectoryCSV = () => {
    if (waypoints.length === 0) {
      alert('Waypoint bulunamadı!')
      return
    }

    let csvContent = 'X,Y,Z\n'
      // Export waypoints in their original order (no reversal needed)
    waypoints.forEach((waypoint) => {
      const [x, y, z] = waypoint.position
      // X and Z are ground coordinates, Y is height (positive value)
      // Format as float with 2 decimal places
      const formattedX = Number(x).toFixed(2)
      const formattedY = Number(-y).toFixed(2)
      const formattedZ = Number(-z).toFixed(2)
      csvContent += `${formattedX},${formattedZ},${formattedY}\n`
    })
    
    // Check if the return functionality is active by checking if the last waypoint
    // has a connection to the first waypoint
    const firstWaypoint = waypoints[0]
    const lastWaypoint = waypoints[waypoints.length - 1]
    
    // Always add the first waypoint at the end when return is clicked
    // This completes the loop back to the beginning
    if (lastWaypoint && firstWaypoint && 
        lastWaypoint.connections.includes(firstWaypoint.index)) {
      const [x, y, z] = firstWaypoint.position
      // Format as float with 2 decimal places for the return point as well
      const formattedX = Number(x).toFixed(2)
      const formattedY = Number(y).toFixed(2)
      const formattedZ = Number(z).toFixed(2)
      csvContent += `${formattedX},${formattedZ},${formattedY}\n`
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trajectory_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }    // Clear all waypoints function
  const clearAllWaypoints = () => {
    if (waypoints.length === 0) return
    if (confirm('Tüm waypoint\'leri silmek istediğinizden emin misiniz?')) {
      setWaypoints([])
      setClearTrigger(prev => !prev) // Scene3D'ye clear sinyali gönder
      contextClearAllWaypoints() // Context'teki waypoint'leri de temizleyelim
    }
  }
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Advanced Control Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '20px',
        borderRadius: '15px',
        zIndex: 1000,
        fontFamily: 'Arial, sans-serif',
        minWidth: '280px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#4CAF50' }}>🚁 Drone Trajectory Planner</h3>
          {/* Altitude Control */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
            ✈️ Waypoint Yüksekliği: {selectedAltitude}m
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={selectedAltitude}
            onChange={(e) => setSelectedAltitude(Number(e.target.value))}
            style={{
              width: '100%',
              background: '#4CAF50',
              height: '8px',
              borderRadius: '5px',
              outline: 'none'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa', marginTop: '5px' }}>
            <span>0m</span>
            <span>10m</span>
          </div>
        </div>          {/* Quick Altitude Buttons */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>🎯 Hızlı Seçim:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[0, 1, 2, 3, 5, 8, 10].map(alt => (
              <button
                key={alt}
                onClick={() => setSelectedAltitude(alt)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  background: selectedAltitude === alt ? '#4CAF50' : '#555',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {alt}m
              </button>
            ))}
          </div>
        </div>
          {/* Waypoint Type Selection */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>🎯 Waypoint Türü:</div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {[
              { type: 'takeoff', label: '🛫 Kalkış', color: '#00ff00' },
              { type: 'waypoint', label: '📍 Nokta', color: '#ff0000' },
              { type: 'hover', label: '⏸️ Hover', color: '#ffff00' },
              { type: 'landing', label: '🛬 İniş', color: '#0000ff' },
              { type: 'return', label: '🔄 Return', color: '#ff6600' }
            ].map(({ type, label, color }) => (              <button
                key={type}
                onClick={() => handleWaypointTypeChange(type as any)}
                style={{
                  padding: '4px 8px',
                  border: 'none',
                  borderRadius: '6px',
                  background: waypointType === type ? color : '#555',
                  color: waypointType === type ? '#000' : 'white',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
          {/* Actions */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>⚡ İşlemler:</div>
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
            <button
              onClick={exportTrajectoryCSV}
              disabled={waypoints.length === 0}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: '8px',
                background: waypoints.length > 0 ? '#4CAF50' : '#555',
                color: 'white',
                cursor: waypoints.length > 0 ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              📊 CSV Export (X,Y,Z)
            </button>            <button
              onClick={clearAllWaypoints}
              disabled={waypoints.length === 0}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: '8px',
                background: waypoints.length > 0 ? '#f44336' : '#555',
                color: 'white',
                cursor: waypoints.length > 0 ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              🗑️ Tümünü Temizle
            </button>
            
            <button
              onClick={toggleCurveControls}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: '8px',
                background: showCurveControls ? '#ff9800' : '#2196f3',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {showCurveControls ? '✓ Yol Düzenleyici (Aktif)' : '✎ Yol Düzenleyici'}
            </button>
          </div>
        </div>{/* Instructions */}
        <div style={{ 
          background: 'rgba(76, 175, 80, 0.1)', 
          padding: '12px', 
          borderRadius: '8px',
          borderLeft: '4px solid #4CAF50'
        }}>
          <div style={{ fontSize: '13px', marginBottom: '8px' }}>
            <strong>📋 Nasıl Kullanılır:</strong>
          </div>          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            • Yükseklik ve waypoint türü seçin<br/>
            • Zemine <strong>çift tıklayın</strong> → Waypoint eklenir<br/>
            • <strong>Return</strong> butonu → Son waypoint'i ilk waypoint'e bağlar<br/>
            • Waypoint'e <strong>sağ tıklayın</strong> → Waypoint silinir<br/>
            • Mouse: Döndür | Scroll: Zoom | Sağ tık: Pan<br/>
            • Grid snap otomatik olarak aktif (0.5m hassasiyet)
          </div>
        </div>
          {/* Statistics */}
        <div style={{ 
          marginTop: '12px', 
          padding: '8px', 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '8px',
          fontSize: '12px'
        }}>
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
        </div>    </div>
      {/* Curve Editor Controls */}
      <CurveEditorControls />
      
      <Canvas
        camera={{
          position: [10, 10, 10],
          fov: 50,
        }}
      >        <Scene3D 
          selectedAltitude={selectedAltitude} 
          onWaypointsChange={handleWaypointsChange}
          snapToGrid={snapToGrid}
          waypointType={waypointType}
          clearTrigger={clearTrigger}
        />
      </Canvas>
    </div>
  )
}

export default App
