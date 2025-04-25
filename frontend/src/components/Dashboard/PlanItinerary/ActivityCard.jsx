import React from "react";

// Icons for fields
const ClockIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PinIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Updated Star Icon to match the theme (outline style)
const StarIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
  </svg>
);

// Chevron Right Icon
const ChevronRight = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

const ActivityCard = ({ event, index, isLast, isFirst, onClick }) => {
  return (
    <div className="bg-white rounded-xl shadow-md transition-all duration-300 relative mt-6 cursor-pointer"
    onClick={onClick} // Attach onClick handler
    >
      {/* Category Badge with Glass Effect Animation */}
      <div className="absolute top-6 right-12"> {/* Adjusted right positioning */}
        <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm bg-opacity-60 animate-pulse-glass">
          {event.category}
        </span>
      </div>

      <div className="p-6 relative">
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
          {/* Chevron Right Icon */}
          <div className="flex items-center">
            <ChevronRight />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <ClockIcon />
            <span className="text-sm text-gray-600">{event.time_slot}</span>
          </div>
          <div className="flex items-center space-x-2">
            <PinIcon />
            <span className="font-semibold text-gray-900 text-lg">{event.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <LocationIcon />
            <span className="text-sm text-gray-600">{event.location}</span>
          </div>
          {/* Rating Display - Only show if rating exists and is greater than 0 */}
          {event.rating && event.rating > 0 && (
            <div className="flex items-center space-x-2">
              <StarIcon />
              <span className="text-sm text-gray-600">{event.rating}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;