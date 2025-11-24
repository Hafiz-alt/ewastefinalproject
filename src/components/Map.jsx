import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Recycle } from 'lucide-react';

// Fix for default marker icons in Leaflet with Vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Dummy recycling centers in Kochi
const recyclingCenters = [
  {
    name: "Green Earth Recyclers",
    position: [9.9312, 76.2673],
    description: "E-waste collection and processing center"
  },
  {
    name: "Tech Waste Solutions",
    position: [9.9894, 76.3172],
    description: "Specialized in computer and mobile recycling"
  },
  {
    name: "Eco Warriors Hub",
    position: [9.9658, 76.2884],
    description: "Community recycling center"
  },
  {
    name: "Digital Disposal Experts",
    position: [9.9446, 76.3223],
    description: "Professional e-waste management"
  }
];

export default function Map() {
  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-md relative z-0">
      <MapContainer
        center={[9.9312, 76.2673]} // Kochi coordinates
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {recyclingCenters.map((center, index) => (
          <Marker key={index} position={center.position}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-emerald-600 flex items-center gap-2">
                  <Recycle className="w-4 h-4" />
                  {center.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{center.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}