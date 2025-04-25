import React from 'react';
import { FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaListAlt, FaStar } from 'react-icons/fa';

export default function ActivityCard({ event, index, isExpanded, toggleEvent, isLast, isFirst, onClick }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 cursor-pointer" onClick={onClick}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <FaListAlt className="mr-2 text-emerald-600" />
          {event.name}
        </h3>
        <span className="flex items-center text-yellow-500 font-bold">
          <FaStar className="mr-1" /> {event.rating}
        </span>
      </div>
      <div className="flex flex-wrap gap-4 mt-2 text-gray-700">
        <span className="flex items-center">
          <FaListAlt className="mr-1" /> {event.category}
        </span>
        <span className="flex items-center">
          <FaClock className="mr-1" /> {event.duration} {event.durationUnit}
        </span>
        <span className="flex items-center">
          <FaMoneyBillWave className="mr-1" /> ₹{event.estimated_cost}
        </span>
        <span className="flex items-center">
          <FaMapMarkerAlt className="mr-1" /> {event.location}
        </span>
        <span className="flex items-center">
          Lat: {event.coordinates.lat}, Lng: {event.coordinates.lng}
        </span>
        <span className="flex items-center">
          Index: {index}
        </span>
      </div>
      {isExpanded && (
        <div className="absolute bottom-0 left-1/2 w-[2px] h-full bg-emerald-600 transform -translate-x-1/2"></div>
      )}
      {!isFirst && (
        <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-emerald-600 transform -translate-x-1/2"></div>
      )}
    </div>
  );
}