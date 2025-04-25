import React from 'react';
import {
  MapPin,
  DollarSign,
  Clock,
  Star,
  Tag,
} from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';

// Example recommendations data (replace with your actual data source)
// const recommendations = [
//   {
//     id: 'dal-lake',
//     category: 'nature',
//     estimatedCost: 1000,
//     latitude: 34.0877,
//     location: 'Srinagar',
//     longitude: 74.858,
//     name: 'Dal Lake',
//     rating: 5,
//     timeSlot: 'Any',
//   },
//   // Add more recommendations as needed
// ];

// Map icons to each field
const icons = {
  category: Tag, // For category (e.g., nature)
  location: MapPin, // For location
  estimatedCost: DollarSign, // For estimated cost
  timeSlot: Clock, // For time slot
  rating: Star, // For rating
};

const DraggableCard = ({ place }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `template-${place.category}-${place.id}`,
    data: place,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex flex-col bg-white rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow p-3"
    >
      {/* Category Badge with Glass Effect Animation */}
      <div className="absolute top-2 right-0"> {/* Adjusted right positioning */}
        <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm bg-opacity-60 animate-pulse-glass">
          {place.category}
        </span>
      </div>
      <h3 className="font-medium text-sm mb-2">{place.name}</h3>
      <div className="space-y-1 text-xs text-gray-500">
        {/* <div className="flex items-center gap-2">
          <icons.category className="w-4 h-4 text-gray-600" />
          <span className="capitalize">{place.category}</span>
        </div> */}
        <div className="flex items-center gap-2">
          <icons.location className="w-4 h-4 text-gray-600" />
          <span>{place.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <icons.estimatedCost className="w-4 h-4 text-gray-600" />
          <span>{place.estimatedCost.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <icons.timeSlot className="w-4 h-4 text-gray-600" />
          <span>{place.timeSlot}</span>
        </div>
        <div className="flex items-center gap-2">
          <icons.rating className="w-4 h-4 text-gray-600" />
          <span>{place.rating}/5</span>
        </div>
        {/* <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-600" />
          <span>
            Lat: {place.latitude.toFixed(4)}, Long: {place.longitude.toFixed(4)}
          </span>
        </div> */}
      </div>
    </div>
  );
};

export const Sidebar = ({ recommendations = [] }) => {
  return (
    <div className="grid gap-4 p-4">
      {recommendations.length > 0 ? (
        recommendations.map((place) => (
          <DraggableCard key={place.id} place={place} />
        ))
      ) : (
        <p className="text-gray-500 text-center">No recommendations available</p>
      )}
    </div>
  );
};