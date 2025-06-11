import React from "react";

// Icons for fields with teal colors
const ClockIcon = () => (
  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DurationIcon = () => (
  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ActivityCard = ({ event, index, isLast, isFirst, onClick }) => {
  // Map category to icon and color
  const getCategoryConfig = (category) => {
    switch (category.toLowerCase()) {
      case 'cultural':
        return { icon: '🕌', color: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-50' };
      case 'popular':
        return { icon: '🏛️', color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50' };
      case 'nature':
        return { icon: '🌳', color: 'from-green-400 to-green-600', bgColor: 'bg-green-50' };
      case 'offbeat':
        return { icon: '🏞️', color: 'from-teal-400 to-teal-600', bgColor: 'bg-teal-50' };
      default:
        return { icon: '📍', color: 'from-gray-400 to-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  const categoryConfig = getCategoryConfig(event.category);

  return (
    <div
      className="group backdrop-blur-xl bg-gradient-to-br from-teal-50/80 via-white/60 to-teal-50/40 border border-teal-200/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 relative cursor-pointer transform hover:scale-[1.005]"
      onClick={onClick}
    >
      {/* Enhanced travel-themed background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] rounded-2xl"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' opacity='0.4'%3E%3Cg fill='%234FD1C5'%3E%3Cpath d='M40 20 L60 40 L40 60 L20 40 Z' stroke='%234FD1C5' stroke-width='1' fill='none'/%3E%3Ccircle cx='40' cy='40' r='3' fill='%234FD1C5'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Category Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`backdrop-blur-sm bg-gradient-to-r ${categoryConfig.color} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-white/20`}>
          {categoryConfig.icon} {event.category}
        </span>
      </div>

      <div className="p-8 relative">
        {/* Timeline dot */}
        <div className="absolute left-[-48px] top-1/2 transform -translate-y-1/2 z-10">
          <div className="w-5 h-5 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full ring-4 ring-white shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Activity number badge */}
        <div className="flex items-center mb-4">
          <span className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg mr-3">
            {index + 1}
          </span>
          <div className="text-sm font-medium text-teal-700 bg-teal-50/70 px-3 py-1 rounded-lg backdrop-blur-sm">
            Activity {index + 1}
          </div>
        </div>

        {/* Content - Reordered to match TravelCard */}
        <div className="space-y-3">
          {/* Time slot */}
          <div className="flex items-center space-x-3">
            <ClockIcon />
            <span className="text-sm font-medium text-gray-700">Time: {event.time_slot}</span>
          </div>
          
          {/* Activity name */}
          <h3 className="font-bold text-xl text-gray-900 group-hover:text-teal-700 transition-colors duration-300 leading-tight">
            {event.name}
          </h3>
          
          {/* Location */}
          <div className="flex items-center space-x-3">
            <LocationIcon />
            <span className="text-sm text-gray-600">Location: {event.location}</span>
          </div>
          
          {/* Cost */}
          <div className="flex items-center space-x-3">
            <DollarIcon />
            <span className="text-sm font-semibold text-teal-700">Cost: ₹{event.estimatedCost}</span>
          </div>
          
          {/* Duration */}
          <div className="flex items-center space-x-3">
            <DurationIcon />
            <span className="text-sm font-medium text-teal-700">Duration: {event.duration} {event.durationUnit}</span>
          </div>

          {/* Rating */}
          {event.rating && event.rating > 0 && (
            <div className="flex items-center space-x-3">
              <StarIcon />
              <span className="text-sm font-medium text-amber-700">Rating: {event.rating}</span>
            </div>
          )}
        </div>

        {/* Enhanced hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-teal-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );
};

export default ActivityCard;