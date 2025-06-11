import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../../../public/css/MapComponent.css";

// Remove default icon config
delete L.Icon.Default.prototype._getIconUrl;

// Child component to control map zooming
const MapController = ({ focusedLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (focusedLocation) {
      map.flyTo(focusedLocation, 15, { duration: 1.5 }); // Smooth zoom to level 15
    }
  }, [focusedLocation, map]);

  return null;
};

const MapComponent = ({ locations, focusedLocation }) => {
  const center = locations?.[0]?.coordinates || [18.9696, 72.8205];

  return (
    <MapContainer center={center} zoom={12} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {locations.map((location, index) => {
        // Determine icon and color based on location type
        let markerIcon, markerColor;
        switch (location.type) {
          case 'activity':
            markerIcon = '🗺️'; // Map pin icon for activities
            markerColor = '#14B8A6'; // Teal to match ActivityCard
            break;
          case 'restaurant':
            markerIcon = '🍴'; // Fork-knife icon for restaurants
            markerColor = '#F97316'; // Orange to match RestaurantCard
            break;
          case 'hotel':
            markerIcon = '🛏️'; // Bed icon for hotels
            markerColor = '#8B5CF6'; // Purple to match HotelCard
            break;
          default:
            markerIcon = '📍'; // Default pin icon
            markerColor = '#6B7280'; // Gray as fallback
        }

        const customIcon = L.divIcon({
          className: `custom-marker-${location.type}`,
          html: `
            <div class="marker-container" style="background-color: ${markerColor};">
              <span class="marker-icon">${markerIcon}</span>
              ${location.type === 'activity' ? `<span class="marker-number">${index + 1}</span>` : ''}
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        });

        return (
          <Marker
            key={index}
            position={location.coordinates}
            icon={customIcon}
          >
            <Popup>
              <strong>{location.name}</strong><br />
              <strong>⭐ {location.rating}</strong>
            </Popup>
          </Marker>
        );
      })}

      <MapController focusedLocation={focusedLocation} />
    </MapContainer>
  );
};

export default MapComponent;