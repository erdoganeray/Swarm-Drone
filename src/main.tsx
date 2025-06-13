import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { WaypointProvider } from './contexts/WaypointContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WaypointProvider>
      <App />
    </WaypointProvider>
  </React.StrictMode>,
)
