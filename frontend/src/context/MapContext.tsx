// Context module: provides shared MapContext state and actions across the app.
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { MapPosition } from '../types';
import { MAP_CONFIG } from '../utils/constants';

interface MapContextType {
  center: MapPosition;
  zoom: number;
  setCenter: (center: MapPosition) => void;
  setZoom: (zoom: number) => void;
  resetMap: () => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [center, setCenter] = useState<MapPosition>(MAP_CONFIG.DEFAULT_CENTER);
  const [zoom, setZoom] = useState<number>(MAP_CONFIG.DEFAULT_ZOOM);

  const resetMap = () => {
    setCenter(MAP_CONFIG.DEFAULT_CENTER);
    setZoom(MAP_CONFIG.DEFAULT_ZOOM);
  };

  return (
    <MapContext.Provider value={{ center, zoom, setCenter, setZoom, resetMap }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within MapProvider');
  }
  return context;
};
