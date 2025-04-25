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
        const numberIcon = L.divIcon({
          className: "custom-number-icon",
          html: `<div class="numbered-marker">${index + 1}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30],
        });

        return (
          <Marker
            key={index}
            position={location.coordinates}
            icon={numberIcon}
          >
            <Popup>
              <strong>{location.name}</strong>
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