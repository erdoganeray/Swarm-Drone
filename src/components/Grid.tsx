import React from 'react'

interface GridProps {
  size?: number
  divisions?: number
  visible?: boolean
}

const Grid: React.FC<GridProps> = ({ 
  size = 50, 
  divisions = 50, 
  visible = true 
}) => {
  if (!visible) return null
  return (
    <gridHelper 
      args={[size, divisions, '#444444', '#222222']}
      position={[0, 0.01, 0]}
    />
  )
}

export default Grid
