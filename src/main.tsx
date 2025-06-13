import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { WaypointProvider } from './contexts/WaypointContext'
import { DroneProvider } from './contexts/DroneContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DroneProvider>
      <WaypointProvider>
        <App />
      </WaypointProvider>
    </DroneProvider>
  </React.StrictMode>,
)
