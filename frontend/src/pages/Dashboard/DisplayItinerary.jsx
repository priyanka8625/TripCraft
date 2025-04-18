import React, { useState, useEffect, useRef } from "react";
import ActivityCard from "../../components/Dashboard/ActivityCard.jsx";

export default function DisplayItinerary() {
  const [activeDay, setActiveDay] = useState(0);
  const [expandedEvent, setExpandedEvent] = useState(null);

  const trip = {
    days: [
      {
        date: "Day 1",
        activities: [
          {
            day: 1,
            date: "Day 1",
            name: "Arrival at Mumbai Central",
            location: { lat: 18.9696, lng: 72.8205 },
            time_slot: "08:00 AM",
            estimated_cost: 500,
          },
          {
            day: 1,
            date: "Day 1",
            name: "Chhatrapati Shivaji Maharaj Terminus",
            location: { lat: 18.9402, lng: 72.8355 },
            time_slot: "10:00 AM",
            estimated_cost: 50,
          },
          {
            day: 1,
            date: "Day 1",
            name: "Cafe Madras",
            location: { lat: 19.0176, lng: 72.8562 },
            time_slot: "12:00 PM",
            estimated_cost: 300,
          },
          {
            day: 1,
            date: "Day 1",
            name: "Marine Drive",
            location: { lat: 18.9433, lng: 72.8232 },
            time_slot: "02:00 PM",
            estimated_cost: 0,
          },
          {
            day: 1,
            date: "Day 1",
            name: "Crawford Market",
            location: { lat: 18.9477, lng: 72.8349 },
            time_slot: "04:00 PM",
            estimated_cost: 200,
          },
          {
            day: 1,
            date: "Day 1",
            name: "Leopold Cafe",
            location: { lat: 18.9228, lng: 72.8317 },
            time_slot: "07:00 PM",
            estimated_cost: 400,
          },
        ],
      },
      {
        date: "Day 2",
        activities: [
          {
            day: 2,
            date: "Day 2",
            name: "Gateway of India",
            location: { lat: 18.922, lng: 72.8347 },
            time_slot: "09:00 AM",
            estimated_cost: 200,
          },
          {
            day: 2,
            date: "Day 2",
            name: "Ferry to Elephanta Caves",
            location: { lat: 18.9633, lng: 72.9312 },
            time_slot: "11:30 AM",
            estimated_cost: 250,
          },
          {
            day: 2,
            date: "Day 2",
            name: "Elephanta Caves",
            location: { lat: 18.9633, lng: 72.9312 },
            time_slot: "01:00 PM",
            estimated_cost: 300,
          },
          {
            day: 2,
            date: "Day 2",
            name: "Trishna",
            location: { lat: 18.9286, lng: 72.8323 },
            time_slot: "04:00 PM",
            estimated_cost: 500,
          },
          {
            day: 2,
            date: "Day 2",
            name: "Haji Ali Dargah",
            location: { lat: 18.9829, lng: 72.8089 },
            time_slot: "06:00 PM",
            estimated_cost: 0,
          },
          {
            day: 2,
            date: "Day 2",
            name: "Bandra Bandstand",
            location: { lat: 19.0474, lng: 72.8196 },
            time_slot: "08:00 PM",
            estimated_cost: 0,
          },
        ],
      },
    ],
  };

  const toggleEvent = (index) => {
    setExpandedEvent(expandedEvent === index ? null : index);
  };

  // Map initialization
  const [mapLoaded, setMapLoaded] = useState(false);
  const scriptRef = useRef(null);

  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      initMap();
      return;
    }

    const scriptId = "google-maps-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://gomaps.pro/api/js?key=AlzaSyAwL2sULk93bv8pLcwQu7XVNMa_7l7-Fur&callback=initMap`;
      script.async = true;
      script.onerror = () => console.error("Failed to load Google Maps script");
      document.body.appendChild(script);
      scriptRef.current = script;
    }

    window.initMap = () => {
      setMapLoaded(true);
      updateMap();
    };

    return () => {
      const script = scriptRef.current;
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      scriptRef.current = null;
      delete window.initMap;
    };
  }, []);

  useEffect(() => {
    if (mapLoaded) {
      updateMap();
    }
  }, [activeDay, mapLoaded]);

  const updateMap = () => {
    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 18.9696, lng: 72.8205 },
      zoom: 12,
    });

    trip.days[activeDay].activities.forEach((event) => {
      if (event.location) {
        const marker = new window.google.maps.Marker({
          position: event.location,
          map,
          title: event.name,
        });
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<h3>${event.name}</h3><p>Time: ${event.time_slot}</p>`,
        });
        marker.addListener("click", () => infoWindow.open(map, marker));
      }
    });
  };

  return (
    <div className="w-full h-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 flex-1 flex flex-col h-full overflow-hidden">
        {/* Day Tabs (Sticky at the top) */}
        <div className="flex flex-wrap gap-4 py-4 z-10 sticky top-0">
          {trip.days.map((day, index) => (
            <button
              key={index}
              onClick={() => setActiveDay(index)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform ${
                activeDay === index
                  ? "bg-emerald-600 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:shadow-md hover:scale-102"
              }`}
            >
              {day.date}
            </button>
          ))}
        </div>

        {/* Main Layout: Map on the right, Activities on the left */}
        <div className="flex flex-col lg:flex-row gap-8 flex-1 w-full overflow-hidden">
          {/* Activities Section (Scrollable) */}
          <div
            className="lg:w-2/3 w-full overflow-y-auto"
            style={{ maxHeight: "550px" }} // Match the map's fixed height
          >
            <div className="relative pl-12">
              <div className="space-y-6">
                {trip.days[activeDay].activities.map((event, index) => (
                  <ActivityCard
                    key={index}
                    event={event}
                    index={index}
                    isExpanded={expandedEvent === index}
                    toggleEvent={toggleEvent}
                    isLast={index === trip.days[activeDay].activities.length - 1}
                    isFirst={index === 0}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Map Section (Fixed height on the right) */}
          <div className="lg:w-1/3 w-full">
            <div
              className="bg-white rounded-xl shadow-lg p-4"
              style={{ height: "500px" }} // Fixed height for the map
            >
              <div
                id="map"
                className="w-full h-full rounded-lg overflow-hidden"
              >
                {!mapLoaded && (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Loading map...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}