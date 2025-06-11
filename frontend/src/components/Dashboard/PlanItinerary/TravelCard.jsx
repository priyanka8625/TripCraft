import React from "react";

// Icons for fields with teal colors to match activities
const ClockIcon = () => (
  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CarIcon = () => (
  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 6h3l3 3v5h-2m-4-4h-2m-4-4v4h8m-12 0h2v5H3V9z" />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DistanceIcon = () => (
  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const RouteIcon = () => (
  <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
  </svg>
);

const TravelCard = ({ event, isLast, isFirst, onClick }) => {
  return (
    <div
      className="group backdrop-blur-xl bg-gradient-to-br from-teal-50/80 via-white/60 to-teal-50/40 border border-teal-200/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative cursor-pointer transform hover:scale-[1.01] hover:-translate-y-0.5"
      onClick={onClick}
    >
      {/* Travel route background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] rounded-2xl"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='40' opacity='0.3'%3E%3Cpath d='M10 20 L30 20 M30 15 L25 20 L30 25 M50 20 L70 20' stroke='%234FD1C5' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Travel Badge with Route Icon */}
      <div className="absolute top-4 right-4 z-10">
        <span className="backdrop-blur-sm bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center space-x-1">
          <RouteIcon />
          <span>Travel</span>
        </span>
      </div>

      <div className="p-6 relative">
        {/* Timeline dot */}
        <div className="absolute left-[-48px] top-1/2 transform -translate-y-1/2 z-10">
          <div className="w-4 h-4 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full ring-4 ring-white shadow-md"></div>
        </div>

        {/* Travel Direction Header */}
        <div className="mb-4 p-3 bg-gradient-to-r from-teal-100/50 to-teal-100/50 rounded-lg border border-teal-200/30 backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-teal-300 to-teal-400"></div>
            <CarIcon />
            <div className="flex-1 h-0.5 bg-gradient-to-r from-teal-400 to-teal-300"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
          <div className="text-center mt-2">
            <span className="text-sm font-semibold text-teal-700">Journey Route</span>
          </div>
        </div>

        {/* Content - All attributes in order */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <ClockIcon />
            <span className="text-sm font-medium text-gray-700">Time: {event.time_slot}</span>
          </div>
          
          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-teal-700 transition-colors duration-300">
            {event.name}
          </h3>
          
          <div className="flex items-center space-x-3">
            <DistanceIcon />
            <span className="text-sm text-gray-600">Distance: {event.distance} {event.distanceUnit}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <CarIcon />
            <span className="text-sm text-gray-600">Duration: {event.duration} {event.durationUnit}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <DollarIcon />
            <span className="text-sm font-semibold text-teal-700">Cost: ₹{event.estimatedCost}</span>
          </div>
        </div>

        {/* Subtle hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-teal-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};

export default TravelCard;