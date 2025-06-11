import React from "react";

const LocationIcon = () => (
  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
  </svg>
);

const RestaurantCard = ({ restaurant, onClick }) => {
  return (
    <div
      className="group backdrop-blur-xl bg-gradient-to-br from-red-50/80 via-white/60 to-red-50/40 border border-red-200/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative cursor-pointer transform hover:scale-[1.005]"
      onClick={onClick}
    >
      {/* Subtle background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] rounded-2xl"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' opacity='0.4'%3E%3Ctext x='30' y='35' font-size='24' fill='%23FF6F61' text-anchor='middle' dominant-baseline='middle'%3E🍽️%3C/text%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Restaurant Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="backdrop-blur-sm bg-gradient-to-r from-red-400 to-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-white/20">
          🍽️ Restaurant
        </span>
      </div>

      <div className="p-8 relative">
        {/* Content */}
        <div className="space-y-3">
          <h3 className="font-bold text-xl text-gray-900 group-hover:text-red-600 transition-colors duration-300">
            {restaurant.name}
          </h3>
          
          <div className="flex items-center space-x-3">
            <LocationIcon />
            <span className="text-sm text-gray-600">{restaurant.location}</span>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 bg-amber-50/70 px-3 py-1 rounded-lg backdrop-blur-sm">
              <StarIcon />
              <span className="text-sm font-medium text-amber-700">{restaurant.rating} ⭐</span>
            </div>
          </div>
        </div>

        {/* Subtle hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};

export default RestaurantCard;