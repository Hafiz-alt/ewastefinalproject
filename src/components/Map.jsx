import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Recycle, Navigation, MapPin } from 'lucide-react';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const centerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Dummy recycling centers in Kochi
const recyclingCenters = [
  {
    id: 1,
    name: "Green Earth Recyclers",
    position: [9.9312, 76.2673],
    description: "E-waste collection and processing center"
  },
  {
    id: 2,
    name: "Tech Waste Solutions",
    position: [9.9894, 76.3172],
    description: "Specialized in computer and mobile recycling"
  },
  {
    id: 3,
    name: "Eco Warriors Hub",
    position: [9.9658, 76.2884],
    description: "Community recycling center"
  },
  {
    id: 4,
    name: "Digital Disposal Experts",
    position: [9.9446, 76.3223],
    description: "Professional e-waste management"
  }
];

// Component to handle map view updates
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function Map() {
  const [userLocation, setUserLocation] = useState([9.9500, 76.2900]); // Default simulated location
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [activeCenter, setActiveCenter] = useState(null);

  // Simulate getting user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.log("Using default location");
        }
      );
    }
  }, []);

  const handleGetDirections = (center) => {
    setActiveCenter(center);
    // Simulate a route (simple straight line for demo, real app would use routing API)
    // Adding a slight curve point to make it look like a route
    const midPoint = [
      (userLocation[0] + center.position[0]) / 2 + 0.005,
      (userLocation[1] + center.position[1]) / 2 - 0.005
    ];
    setSelectedRoute([userLocation, midPoint, center.position]);
  };

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 relative z-0">
      <MapContainer
        center={userLocation}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={activeCenter ? activeCenter.position : userLocation} />

        {/* User Location Marker */}
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-blue-600 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                You are here
              </h3>
            </div>
          </Popup>
        </Marker>

        {/* Recycling Centers */}
        {recyclingCenters.map((center) => (
          <Marker key={center.id} position={center.position} icon={centerIcon}>
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-emerald-600 flex items-center gap-2 mb-1">
                  <Recycle className="w-4 h-4" />
                  {center.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{center.description}</p>
                <button
                  onClick={() => handleGetDirections(center)}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Line */}
        {selectedRoute && (
          <Polyline
            positions={selectedRoute}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
      </MapContainer>

      {/* Overlay Info */}
      <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 max-w-xs">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Recycling Center</span>
          </div>
        </div>
      </div>
    </div>
  );
}