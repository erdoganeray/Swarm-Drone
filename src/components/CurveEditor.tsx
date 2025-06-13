import React, { useState, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useWaypoints } from '../contexts/WaypointContext'
import './CurveEditor.css'
import './CurveEditorButtons.css'

// Draggable control point component
const ControlPoint: React.FC<{
  position: THREE.Vector3
  onDrag: (newPos: THREE.Vector3) => void
  index: number
}> = ({ position, onDrag, index }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [activeAxis, setActiveAxis] = useState<'x' | 'y' | 'z' | null>(null)
  const { camera, gl } = useThree()
  const startPosition = useRef(new THREE.Vector3())
  const dragPlane = useRef(new THREE.Plane())
    // Initialize control point position for the current drag operation
  const onAxisDragStart = (e: any, axis: 'x' | 'y' | 'z') => {
    e.stopPropagation()
    setIsDragging(true)
    setActiveAxis(axis)
    startPosition.current.copy(position)
    gl.domElement.style.cursor = 'grabbing'
    
    // Set up drag plane based on selected axis
    let normal: THREE.Vector3
    
    switch (axis) {
      case 'x':
        // X-axis movement: horizontal movement along X axis
        normal = new THREE.Vector3(1, 0, 0)
        break
      case 'y':
        // Y-axis movement: height/altitude (vertical plane)
        normal = new THREE.Vector3(0, 1, 0)
        break
      case 'z':
        // Z-axis movement: depth movement along Z axis
        normal = new THREE.Vector3(0, 0, 1)
        break
    }
    
    dragPlane.current.setFromNormalAndCoplanarPoint(
      normal,
      position
    )
    
    // Set up event listeners for dragging
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onDragEnd)
  }
  
  const onDragEnd = () => {
    if (isDragging) {
      setIsDragging(false)
      setActiveAxis(null)
      gl.domElement.style.cursor = 'auto'
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onDragEnd)
    }
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging || !activeAxis) return
    
    // Calculate mouse position in normalized device coordinates
    const rect = gl.domElement.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      // Create raycaster from mouse position
    const raycaster = new THREE.Raycaster()
    const mousePos = new THREE.Vector2(x, y)
    raycaster.setFromCamera(mousePos, camera)
    
    // Find intersection with the appropriate plane
    const intersection = new THREE.Vector3()
    if (raycaster.ray.intersectPlane(dragPlane.current, intersection)) {
      // Create a constrained position based on the active axis
      const newPos = startPosition.current.clone()
      
      // Only allow movement along the selected axis
      switch (activeAxis) {
        case 'x':
          newPos.x = intersection.x
          break
        case 'y':
          newPos.y = intersection.y
          break
        case 'z':
          newPos.z = intersection.z
          break
      }
      
      onDrag(newPos)
    }
  }
  // Get colors for axis controls
  const getAxisColor = (axis: 'x' | 'y' | 'z') => {
    if (activeAxis === axis) return '#ffffff'
    switch (axis) {
      case 'x': return '#ff3333' // Red for X (horizontal)
      case 'y': return '#33ff33' // Green for Y (altitude/height)
      case 'z': return '#3333ff' // Blue for Z (depth)
    }
  }

  return (
    <group>
      {/* Main control point sphere */}
      <mesh position={position}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ffaa00" />
      </mesh>
      
      {/* X axis control */}
      <mesh 
        position={[position.x + 0.4, position.y, position.z]}
        onPointerDown={(e) => onAxisDragStart(e, 'x')}
      >
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshBasicMaterial color={getAxisColor('x')} />
      </mesh>
      
      {/* Y axis control */}
      <mesh 
        position={[position.x, position.y + 0.4, position.z]}
        onPointerDown={(e) => onAxisDragStart(e, 'y')}
      >
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshBasicMaterial color={getAxisColor('y')} />
      </mesh>
      
      {/* Z axis control */}
      <mesh 
        position={[position.x, position.y, position.z + 0.4]}
        onPointerDown={(e) => onAxisDragStart(e, 'z')}
      >
        <boxGeometry args={[0.1, 0.1, 0.2]} />
        <meshBasicMaterial color={getAxisColor('z')} />
      </mesh>
      
      {/* Axis lines for better visibility */}
      <group>
        <Line 
          points={[position, new THREE.Vector3(position.x + 0.35, position.y, position.z)]} 
          color={getAxisColor('x')}
          lineWidth={1}
        />
        <Line 
          points={[position, new THREE.Vector3(position.x, position.y + 0.35, position.z)]} 
          color={getAxisColor('y')}
          lineWidth={1}
        />
        <Line 
          points={[position, new THREE.Vector3(position.x, position.y, position.z + 0.35)]} 
          color={getAxisColor('z')}
          lineWidth={1}
        />
      </group>
      
      {/* Label */}
      <Html position={[position.x, position.y + 0.6, position.z]}>
        <div style={{ 
          background: 'rgba(0,0,0,0.7)', 
          color: 'white', 
          padding: '3px 6px',
          borderRadius: '3px',
          fontSize: '10px',
          userSelect: 'none'
        }}>
          CP {index + 1}
        </div>
      </Html>
    </group>
  )
}

// Main CurveEditor component
const CurveEditor: React.FC = () => {
  const { 
    curveEditMode, 
    waypoints,
    updateCurveControlPoints,
    cancelCurveEdit,
    finishCurveEdit
  } = useWaypoints()
  
  // If not in curve edit mode, don't render anything
  if (!curveEditMode.active || !curveEditMode.startWaypointId || !curveEditMode.endWaypointId) {
    return null
  }
  
  // Get the start and end waypoints
  const startWaypoint = waypoints.find(wp => wp.id === curveEditMode.startWaypointId)
  const endWaypoint = waypoints.find(wp => wp.id === curveEditMode.endWaypointId)
  
  if (!startWaypoint || !endWaypoint) {
    return null
  }
  
  // Handle control point drag
  const handleControlPointDrag = (index: number, newPos: THREE.Vector3) => {
    const newControlPoints = [...curveEditMode.controlPoints]
    newControlPoints[index] = newPos
    updateCurveControlPoints(newControlPoints)
  }
  
  // Create a Bezier curve with the control points
  const curve = new THREE.CubicBezierCurve3(
    startWaypoint.position,
    curveEditMode.controlPoints[0],
    curveEditMode.controlPoints[1],
    endWaypoint.position
  )
  
  // Get points along the curve
  const points = curve.getPoints(30)
  
  return (
    <group>
      {/* Render the curve */}
      <Line
        points={points}
        color="#ffaa00"
        lineWidth={2}
      />
      
      {/* Control point handles */}
      <Line
        points={[startWaypoint.position, curveEditMode.controlPoints[0]]}
        color="#ff6600"
        lineWidth={1}
        dashed
        dashSize={0.2}
        gapSize={0.1}
      />
      
      <Line
        points={[curveEditMode.controlPoints[1], endWaypoint.position]}
        color="#ff6600"
        lineWidth={1}
        dashed
        dashSize={0.2}
        gapSize={0.1}
      />
      
      {/* Control points */}
      {curveEditMode.controlPoints.map((cp, index) => (
        <ControlPoint 
          key={`cp-${index}`}
          position={cp}
          index={index}
          onDrag={(newPos) => handleControlPointDrag(index, newPos)}
        />      ))}      {/* Control UI panel fixed to the screen */}      <Html
        as="div"
        wrapperClass="curve-editor-ui curve-editor-ui-container"
        prepend
        fullscreen
        portal={{ current: document.body }} /* Render directly in the body */
        transform={false} /* Disable transform to keep fixed position */
      >        <div className="panel" style={{
          padding: '16px',
          width: '360px', /* Increased width */
          zIndex: 9999,
          position: 'fixed',
          top: '20px',
          right: '20px', 
          fontSize: '16px', /* Ensure font size is explicitly set */
          transform: 'none',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5)',
          borderRadius: '10px'
        }}>
          <div style={{ marginBottom: '15px' }}>            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#ffaa00', fontSize: '20px', fontWeight: 'bold' }}>Kontrol Noktası Ayarları</h3>
              <div style={{ fontSize: '14px', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                <div><span className="axis-label x" style={{ marginRight: '5px', fontSize: '16px' }}>■</span>X (Yatay)</div>
                <div><span className="axis-label y" style={{ margin: '0 5px', fontSize: '16px' }}>■</span>Y (Yükseklik)</div>
                <div><span className="axis-label z" style={{ marginRight: '5px', fontSize: '16px' }}>■</span>Z (Derinlik)</div>
              </div>
            </div>
            
            {/* Control point 1 adjustments */}
            <div style={{ marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: '#ffaa00', 
                  borderRadius: '50%',
                  marginRight: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>1</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Kontrol Noktası 1</div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>                {['x', 'y', 'z'].map((axis) => (
                  <div key={`cp1-${axis}`} style={{ width: '33%' }}>                    <label className={`axis-label ${axis}`} style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {axis.toUpperCase()}:
                    </label><div>                      <input
                        type="number"
                        step="0.1"
                        value={(curveEditMode.controlPoints[0] as any)[axis].toFixed(1)}
                        onChange={(e) => {
                          e.stopPropagation(); // Stop propagation to prevent event bubbling
                          const newPos = curveEditMode.controlPoints[0].clone();
                          (newPos as any)[axis] = parseFloat(e.target.value) || 0;
                          handleControlPointDrag(0, newPos);
                        }}
                        onPointerDown={(e) => e.stopPropagation()} // Prevent event bubbling
                        className="control-input"
                        style={{
                          width: '100%',
                          border: '2px solid rgba(255,255,255,0.5)',
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          textAlign: 'center',
                          padding: '8px',
                          borderRadius: '4px',
                          fontSize: '16px',
                          pointerEvents: 'auto',
                          position: 'relative',
                          zIndex: 10,
                          height: '40px'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Control point 2 adjustments */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: '#ffaa00', 
                  borderRadius: '50%',
                  marginRight: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>2</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Kontrol Noktası 2</div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>                {['x', 'y', 'z'].map((axis) => (
                  <div key={`cp2-${axis}`} style={{ width: '33%' }}>                    <label className={`axis-label ${axis}`} style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {axis.toUpperCase()}:
                    </label><div>                      <input
                        type="number"
                        step="0.1"
                        value={(curveEditMode.controlPoints[1] as any)[axis].toFixed(1)}
                        onChange={(e) => {
                          e.stopPropagation(); // Stop propagation to prevent event bubbling
                          const newPos = curveEditMode.controlPoints[1].clone();
                          (newPos as any)[axis] = parseFloat(e.target.value) || 0;
                          handleControlPointDrag(1, newPos);
                        }}
                        onPointerDown={(e) => e.stopPropagation()} // Prevent event bubbling
                        className="control-input"
                        style={{
                          width: '100%',
                          border: '2px solid rgba(255,255,255,0.5)',
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          textAlign: 'center',
                          padding: '8px',
                          borderRadius: '4px',
                          fontSize: '16px',
                          pointerEvents: 'auto',
                          position: 'relative',
                          zIndex: 10,
                          height: '40px'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Action buttons */}          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                cancelCurveEdit();
              }}
              className="btn btn-cancel"
              style={{
                width: '120px'
              }}
            >
              İptal
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                finishCurveEdit();
              }}
              className="btn btn-confirm"
              style={{
                width: '120px'
              }}
            >
              Tamamla
            </button>
          </div>
        </div>
      </Html>
    </group>
  )
}

export default CurveEditor
