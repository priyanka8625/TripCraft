import React, { useState, useEffect, useRef } from "react";

export default function DisplayItinerary() {
  const [activeDay, setActiveDay] = useState(0);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const trip = {
    days: [
      {
        date: "Day 1",
        timeline: [
          {
            time: "08:00 AM",
            title: "Arrival at Mumbai Central",
            type: "transport",
            description: "Arrive via train.",
            duration: "1 hr",
            cost: 500,
            tips: "Book in advance.",
            location: { lat: 18.9696, lng: 72.8205 },
          },
          {
            time: "10:00 AM",
            title: "Visit Chhatrapati Shivaji Maharaj Terminus",
            type: "sightseeing",
            description: "Explore this UNESCO World Heritage railway station.",
            duration: "1 hr",
            cost: 50,
            location: { lat: 18.9402, lng: 72.8355 },
          },
          {
            time: "12:00 PM",
            title: "Lunch at Cafe Madras",
            type: "food",
            description: "South Indian cuisine.",
            rating: "4.5",
            reviews: 120,
            duration: "1 hr",
            cost: 300,
            image: "https://example.com/cafe-madras.jpg",
            location: { lat: 19.0176, lng: 72.8562 },
          },
          {
            time: "02:00 PM",
            title: "Explore Marine Drive",
            type: "sightseeing",
            description: "Take a scenic walk along the Queen’s Necklace.",
            duration: "1.5 hrs",
            cost: 0,
            location: { lat: 18.9433, lng: 72.8232 },
          },
          {
            time: "04:00 PM",
            title: "Shopping at Crawford Market",
            type: "sightseeing",
            description: "Browse local goods and spices.",
            duration: "2 hrs",
            cost: 200,
            location: { lat: 18.9477, lng: 72.8349 },
          },
          {
            time: "07:00 PM",
            title: "Dinner at Leopold Cafe",
            type: "food",
            description: "Enjoy a meal at this historic cafe.",
            duration: "1.5 hrs",
            cost: 400,
            location: { lat: 18.9228, lng: 72.8317 },
          },
        ],
      },
      {
        date: "Day 2",
        timeline: [
          {
            time: "09:00 AM",
            title: "Gateway of India",
            type: "sightseeing",
            description: "Iconic monument.",
            rating: "4.7",
            reviews: 300,
            duration: "2 hrs",
            cost: 200,
            image: "https://example.com/gateway.jpg",
            highlights: "Photo ops, ferry rides.",
            location: { lat: 18.922, lng: 72.8347 },
          },
          {
            time: "11:30 AM",
            title: "Ferry to Elephanta Caves",
            type: "transport",
            description: "Take a boat to this UNESCO site.",
            duration: "1 hr",
            cost: 250,
            tips: "Wear comfortable shoes.",
            location: { lat: 18.9633, lng: 72.9312 },
          },
          {
            time: "01:00 PM",
            title: "Explore Elephanta Caves",
            type: "sightseeing",
            description: "Visit ancient rock-cut temples.",
            duration: "2 hrs",
            cost: 300,
            location: { lat: 18.9633, lng: 72.9312 },
          },
          {
            time: "04:00 PM",
            title: "Lunch at Trishna",
            type: "food",
            description: "Savor seafood specialties.",
            duration: "1.5 hrs",
            cost: 500,
            location: { lat: 18.9286, lng: 72.8323 },
          },
          {
            time: "06:00 PM",
            title: "Visit Haji Ali Dargah",
            type: "sightseeing",
            description: "Explore this stunning mosque on the sea.",
            duration: "1.5 hrs",
            cost: 0,
            location: { lat: 18.9829, lng: 72.8089 },
          },
          {
            time: "08:00 PM",
            title: "Evening at Bandra Bandstand",
            type: "sightseeing",
            description:
              "Relax by the sea with a view of the Bandra-Worli Sea Link.",
            duration: "1 hr",
            cost: 0,
            location: { lat: 19.0474, lng: 72.8196 },
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
  const scriptRef = useRef(null); // Track the script element

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

    trip.days[activeDay].timeline.forEach((event) => {
      if (event.location) {
        const marker = new window.google.maps.Marker({
          position: event.location,
          map,
          title: event.title,
        });
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<h3>${event.title}</h3><p>${event.description}</p>`,
        });
        marker.addListener("click", () => infoWindow.open(map, marker));
      }
    });
  };

  const mapRef = useRef(null);
  const summaryRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!mapRef.current || !summaryRef.current) return;

      const mapTop = mapRef.current.getBoundingClientRect().top;
      const summaryTop = summaryRef.current.getBoundingClientRect().top;
      const navbarHeight = 68;

      if (mapTop <= navbarHeight) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }

      if (summaryTop <= navbarHeight + 600) {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ChevronDown = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
  const ChevronRight = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
  const Star = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  return (
    <>
        <div className="flex flex-wrap gap-4 m-5 justify-left -mb-5">
          {trip.days.map((day, index) => (
            <button
              key={index}
              onClick={() => setActiveDay(index)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform ${
                activeDay === index
                  ? "bg-teal-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-100 hover:shadow-md hover:scale-102"
              }`}
            >
              {day.date}
            </button>
          ))}
        </div>
        {/* Main content: Scrollable */}
        <main className="flex-1 overflow-y-auto max-w-7xl mx-auto px-4 py-12 w-full">
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            style={{ marginLeft: "10px",
              marginTop: "0px",
              top:0,
             }}
          >
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-lg p-4 sticky transition-all duration-300 hover:shadow-xl top-0">
                <div
                  ref={mapRef}
                  id="map"
                  className="w-full h-[450px] rounded-lg overflow-hidden"
                >
                  {!mapLoaded && (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      Loading map...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="relative pl-8">
                <div className="space-y-6">
                  {trip.days[activeDay].timeline.map((event, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-md transition-all duration-300"
                    >
                      <div
                        className="p-6 cursor-pointer relative"
                        onClick={() => toggleEvent(index)}
                        style={{
                          top:0,
                        }}
                      >
                        <div className="absolute left-[-40px] top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 bg-indigo-600 rounded-full ring-2 ring-white"></div>
                          {index === 0 && (
                            <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-indigo-600 transform -translate-x-1/2"></div>
                          )}
                          <div className="absolute bottom-0 left-1/2 w-[2px] h-1/2 bg-indigo-600 transform -translate-x-1/2"></div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            {event.icon || <span />}
                            <span className="text-sm font-medium text-gray-500">
                              {event.time}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                event.type === "transport"
                                  ? "bg-blue-100 text-blue-800"
                                  : event.type === "food"
                                  ? "bg-amber-100 text-amber-800"
                                  : event.type === "accommodation"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-indigo-100 text-indigo-800"
                              }`}
                            >
                              {event.type}
                            </span>
                            {expandedEvent === index ? (
                              <ChevronDown />
                            ) : (
                              <ChevronRight />
                            )}
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-2">
                          {event.title}
                        </h3>
                        {event.rating && (
                          <div className="flex items-center mb-2">
                            <Star />
                            <span className="ml-1 text-sm text-gray-600">
                              {event.rating}
                            </span>
                            <span className="mx-1 text-gray-400">•</span>
                            <span className="text-sm text-gray-600">
                              {event.reviews} reviews
                            </span>
                          </div>
                        )}
                        <p className="text-sm text-gray-600">
                          {event.description}
                        </p>
                      </div>

                      {expandedEvent === index && (
                        <div className="px-6 pb-6 transition-all duration-300 ease-in-out">
                          {event.image && (
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                          )}
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                            <p>
                              <strong>Duration:</strong> {event.duration}
                            </p>
                            <p>
                              <strong>Cost:</strong> ₹{event.cost}
                            </p>
                            {event.tips && (
                              <p className="col-span-2">
                                <strong>Tips:</strong> {event.tips}
                              </p>
                            )}
                            {event.highlights && (
                              <p className="col-span-2">
                                <strong>Highlights:</strong> {event.highlights}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
    </>
  );
}