// UI component: renders and manages the LeafletMap feature block.
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Worker } from '../../types/worker';
import { WORKER_MARKER_COLORS } from '../../utils/constants';

// Fix default marker icons issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Map controls component
const MapControls: React.FC = () => {
  const map = useMap();

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 });
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => map.zoomIn()}
        className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-100 transition"
        title="Zoom In"
      >
        ➕
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-100 transition"
        title="Zoom Out"
      >
        ➖
      </button>
      <button
        onClick={handleLocate}
        className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-100 transition"
        title="My Location"
      >
        📍
      </button>
    </div>
  );
};

// User location icon
const userLocationIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Worker icon generator
const getWorkerIcon = (profession: string) => {
  const color = WORKER_MARKER_COLORS[profession] || 'grey';

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  workers?: Worker[];
  onWorkerClick?: (worker: Worker) => void;
  onBookWorker?: (workerId: string) => void;
  userLocation?: [number, number];
  routeCoordinates?: [number, number][];
  height?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  zoom = 13,
  workers = [],
  onWorkerClick,
  onBookWorker,
  userLocation,
  routeCoordinates,
  height = '100vh'
}) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%' }}
      zoomControl={false}
      className="z-0"
    >
      {/* OpenStreetMap Tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User Location Marker */}
      {userLocation && (
        <Marker position={userLocation} icon={userLocationIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold">Your Location</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Worker Markers */}
      {workers.map((worker) => {
        // Add safety checks
        if (!worker.currentLocation || !worker.currentLocation.coordinates) {
          console.warn('Worker missing location:', worker._id);
          return null;
        }

        const coords = worker.currentLocation.coordinates;
        if (!coords || coords.length !== 2 || coords[0] === 0 || coords[1] === 0) {
          console.warn('Worker has invalid coordinates:', worker._id, coords);
          return null;
        }

        const position: [number, number] = [coords[1], coords[0]]; // Swap lon/lat to lat/lon

        return (
          <Marker
            key={worker._id}
            position={position}
            icon={getWorkerIcon(worker.profession)}
            eventHandlers={{
              click: () => onWorkerClick && onWorkerClick(worker)
            }}
          >
            <Popup>
              <div className="p-3 min-w-[220px]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {worker.userDetails?.name || worker.userId.name}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize font-medium">{worker.profession}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      🟢 Online
                    </span>
                    {typeof worker.availability === 'object' && worker.availability.status === 'busy' && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                        ⚠️ Busy
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold">{worker.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500">({worker.totalJobs} jobs)</span>
                </div>
                
                <div className="space-y-1 mb-3">
                  {worker.exactDistance && (
                    <p className="text-sm text-gray-700">
                      📍 <span className="font-medium">{worker.exactDistance} km</span> away
                    </p>
                  )}
                  {worker.estimatedTime && (
                    <p className="text-sm text-gray-700">
                      ⏱️ ~<span className="font-medium">{worker.estimatedTime} mins</span> arrival
                    </p>
                  )}
                  <p className="text-sm text-gray-700">
                    💼 <span className="font-medium">{worker.experience} years</span> experience
                  </p>
                </div>
                
                {onBookWorker && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookWorker(worker._id);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <span>📞</span>
                    Book Now
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Route Polyline */}
      {routeCoordinates && (
        <Polyline
          positions={routeCoordinates}
          color="#3b82f6"
          weight={4}
          opacity={0.7}
        />
      )}

      <MapControls />
    </MapContainer>
  );
};
