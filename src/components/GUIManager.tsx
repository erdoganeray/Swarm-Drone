import React, { createContext, useContext, useState } from 'react';
import './GUIManager.css';

// Define the panels that can be toggled
export type PanelType = 'trajectory-planner' | 'drone-panel' | 'curve-editor';

interface GUIManagerContextType {
  visiblePanels: Record<PanelType, boolean>;
  togglePanel: (panel: PanelType) => void;
  isPanelVisible: (panel: PanelType) => boolean;
}

const GUIManagerContext = createContext<GUIManagerContextType>({
  visiblePanels: {
    'trajectory-planner': true,
    'drone-panel': true,
    'curve-editor': false
  },
  togglePanel: () => {},
  isPanelVisible: () => false
});

export const useGUIManager = () => useContext(GUIManagerContext);

interface GUIManagerProviderProps {
  children: React.ReactNode;
}

export const GUIManagerProvider: React.FC<GUIManagerProviderProps> = ({ children }) => {
  const [visiblePanels, setVisiblePanels] = useState<Record<PanelType, boolean>>({
    'trajectory-planner': true,
    'drone-panel': true,
    'curve-editor': false
  });

  const togglePanel = (panel: PanelType) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };

  const isPanelVisible = (panel: PanelType) => visiblePanels[panel];

  return (
    <GUIManagerContext.Provider value={{ visiblePanels, togglePanel, isPanelVisible }}>
      {children}
    </GUIManagerContext.Provider>
  );
};

const GUIMenu: React.FC = () => {
  const { togglePanel, isPanelVisible } = useGUIManager();

  return (
    <div className="gui-menu">
      <button 
        className={`gui-menu-button ${isPanelVisible('trajectory-planner') ? 'active' : ''}`} 
        onClick={() => togglePanel('trajectory-planner')}
        title="Trajektör Planlayıcı"
      >
        🚁
      </button>
      <button 
        className={`gui-menu-button ${isPanelVisible('drone-panel') ? 'active' : ''}`} 
        onClick={() => togglePanel('drone-panel')}
        title="Drone Listesi"
      >
        📋
      </button>
      <button 
        className={`gui-menu-button ${isPanelVisible('curve-editor') ? 'active' : ''}`} 
        onClick={() => togglePanel('curve-editor')}
        title="Yol Düzenleyici"
      >
        ✏️
      </button>
    </div>
  );
};

export default GUIMenu;
