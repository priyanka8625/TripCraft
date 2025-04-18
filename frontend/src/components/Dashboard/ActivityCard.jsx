import React from "react";

// Icons for fields
const ClockIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const PinIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </svg>
);

const LocationIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const CostIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

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

const ActivityCard = ({
  event,
  index,
  isExpanded,
  toggleEvent,
  isLast,
  isFirst,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md transition-all duration-300">
      <div
        className="p-6 cursor-pointer relative"
        onClick={() => toggleEvent(index)}
      >
        <div className="absolute left-[-48px] top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 bg-emerald-600 rounded-full ring-2 ring-white"></div>
          {!isLast && (
            <div className="absolute bottom-0 left-1/2 w-[2px] h-full bg-emerald-600 transform -translate-x-1/2"></div>
          )}
          {!isFirst && (
            <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-emerald-600 transform -translate-x-1/2"></div>
          )}
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {isExpanded ? <ChevronDown /> : <ChevronRight />}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <ClockIcon />
            <span className="text-sm text-gray-600">{event.time_slot}</span>
          </div>
          <div className="flex items-center space-x-2">
            <PinIcon />
            <span className="font-semibold text-gray-900 text-lg">
              {event.name}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <LocationIcon />
            <span className="text-sm text-gray-600">
              Lat {event.location.lat}, Lng {event.location.lng}
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 transition-all duration-300 ease-in-out">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CostIcon />
            <span>Estimated Cost: ₹{event.estimated_cost}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityCard;