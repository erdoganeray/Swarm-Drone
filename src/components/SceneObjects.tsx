import React from 'react'
import { Box } from '@react-three/drei'

const SceneObjects: React.FC = () => {
  return (
    <>
      {/* Sample 3D objects - buildings, obstacles, etc. */}
      
      {/* Building 1 */}
      <Box
        position={[5, 2, 5]}
        args={[2, 4, 2]}
        castShadow
        receiveShadow
      >
        <meshLambertMaterial color="#8B4513" />
      </Box>
      
      {/* Building 2 */}
      <Box
        position={[-3, 1.5, 8]}
        args={[1.5, 3, 1.5]}
        castShadow
        receiveShadow
      >
        <meshLambertMaterial color="#696969" />
      </Box>
      
      {/* Building 3 */}
      <Box
        position={[8, 3, -2]}
        args={[3, 6, 2]}
        castShadow
        receiveShadow
      >
        <meshLambertMaterial color="#A0522D" />
      </Box>
      
      {/* Trees (simple cylinders with spheres) */}
      <group position={[-5, 0, -5]}>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.3, 2]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 2.5, 0]} castShadow>
          <sphereGeometry args={[1]} />
          <meshLambertMaterial color="#228B22" />
        </mesh>
      </group>
      
      <group position={[2, 0, -8]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.25, 2.4]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 3, 0]} castShadow>
          <sphereGeometry args={[1.2]} />
          <meshLambertMaterial color="#32CD32" />
        </mesh>
      </group>
      
      {/* Water feature */}
      <mesh position={[-8, 0.1, 3]} receiveShadow>
        <cylinderGeometry args={[3, 3, 0.2, 16]} />
        <meshLambertMaterial color="#4682B4" transparent opacity={0.7} />
      </mesh>
      
      {/* Landing pad */}
      <mesh position={[10, 0.05, 10]} receiveShadow>
        <cylinderGeometry args={[2, 2, 0.1, 8]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
      
      {/* Some rocks/obstacles */}
      <mesh position={[0, 0.3, 15]} castShadow>
        <sphereGeometry args={[0.5]} />
        <meshLambertMaterial color="#708090" />
      </mesh>
      
      <mesh position={[-10, 0.4, -3]} castShadow>
        <sphereGeometry args={[0.6]} />
        <meshLambertMaterial color="#696969" />
      </mesh>
    </>
  )
}

export default SceneObjects
