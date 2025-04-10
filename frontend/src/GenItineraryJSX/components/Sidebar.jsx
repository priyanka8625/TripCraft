import React from 'react';
import { Calendar, MapPin, Bus, Coffee, Utensils, Camera, Clock, DollarSign } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';

const recommendations = [
  {
    id: 'eiffel-tower',
    type: 'sightseeing',
    title: 'Eiffel Tower',
    description: 'Iconic iron lattice tower on the Champ de Mars',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=400',
    location: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
    duration: '2-3 hours',
    cost: '€26.10 for adults'
  },
  {
    id: 'louvre-museum',
    type: 'sightseeing',
    title: 'Louvre Museum',
    description: 'World\'s largest art museum and historic monument',
    image: 'https://images.unsplash.com/photo-1605704305462-9c0b40747436?auto=format&fit=crop&q=80&w=400',
    location: 'Rue de Rivoli, 75001 Paris',
    duration: '3-4 hours',
    cost: '€17 for adults'
  },
  {
    id: 'le-cheval-blanc',
    type: 'restaurant',
    title: 'Le Cheval Blanc',
    description: 'Fine dining with panoramic city views',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=400',
    location: '8 Quai du Louvre, 75001 Paris',
    duration: '2 hours',
    cost: '€200-300 per person'
  },
  {
    id: 'ritz-paris',
    type: 'accommodation',
    title: 'Ritz Paris',
    description: 'Luxury hotel in the heart of Paris',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=400',
    location: '15 Place Vendôme, 75001 Paris',
    duration: 'Overnight',
    cost: '€1,500+ per night'
  },
];

const icons = {
  activity: Calendar,
  sightseeing: Camera,
  accommodation: MapPin,
  transport: Bus,
  restaurant: Utensils,
  break: Coffee,
};

const DraggableCard = ({ place }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `template-${place.type}-${place.id}`,
    data: place,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const Icon = icons[place.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex flex-col bg-white rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow"
    >
      <img
        src={place.image}
        alt={place.title}
        className="w-full h-32 object-cover rounded-t-lg"
      />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-sm">{place.title}</h3>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2">{place.description}</p>
        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{place.location}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{place.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>{place.cost}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  return (
    <div className="grid gap-4 p-4">
      {recommendations.map((place) => (
        <DraggableCard key={place.id} place={place} />
      ))}
    </div>
  );
};