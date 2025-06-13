import React, { useRef } from 'react'
import * as THREE from 'three'

interface GroundPlaneProps {
  onClick?: (event: THREE.Event) => void
  onPointerMove?: (event: THREE.Event) => void
}

const GroundPlane: React.FC<GroundPlaneProps> = ({ onClick, onPointerMove }) => {
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={onClick}
      onPointerMove={onPointerMove}
      userData={{ isGround: true }}
      receiveShadow
    >
      <planeGeometry args={[100, 100]} />
      <meshLambertMaterial 
        color="#2d5a27" 
        transparent 
        opacity={0.8}
      />
    </mesh>
  )
}

export default GroundPlane
