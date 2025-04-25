import React from 'react';
import { MapPin, DollarSign, Clock, Star, Tag } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';

const icons = {
  category: Tag,
  location: MapPin,
  estimatedCost: DollarSign,
  timeSlot: Clock,
  rating: Star,
};

const DraggableCard = ({ place }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `template-${place.category}-${place.id}`,
    data: place, // Pass all place data
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Debug place data
  // console.log('DraggableCard place:', place);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex flex-col bg-white rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow p-3"
    >
      <div className="absolute top-2 right-0">
        <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm bg-opacity-60 animate-pulse-glass">
          {place.category || 'N/A'}
        </span>
      </div>
      <h3 className="font-medium text-sm mb-2">{place.name || 'Untitled'}</h3>
      <div className="space-y-1 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <icons.location className="w-4 h-4 text-gray-600" />
          <span>{place.location || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <icons.estimatedCost className="w-4 h-4 text-gray-600" />
          <span>{place.estimatedCost ? place.estimatedCost.toLocaleString() : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <icons.timeSlot className="w-4 h-4 text-gray-600" />
          <span>{place.timeSlot || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <icons.rating className="w-4 h-4 text-gray-600" />
          <span>{place.rating ? `${place.rating}/5` : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export const Sidebar = ({ recommendations = [] }) => {
  console.log('Sidebar recommendations:', recommendations);
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