import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MapPin, Bus, Coffee, Utensils, Camera, GripVertical, X, Clock, DollarSign, Edit } from 'lucide-react';
import { useItineraryStore } from '../store/itineraryStore';

const icons = {
  activity: Calendar,
  sightseeing: Camera,
  accommodation: MapPin,
  transport: Bus,
  restaurant: Utensils,
  break: Coffee,
};

const ItineraryItem = ({ item, dayId, onEdit }) => {
  const { removeItem } = useItineraryStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const Icon = icons[item.type];
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRemove = () => {
    removeItem(dayId, item.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 bg-white rounded-lg border border-gray-200 group hover:border-blue-500 overflow-hidden"
    >
      {item.image && (
        <img
          src={item.image}
          alt={item.title}
          className="w-40 h-40 object-cover"
        />
      )}
      <div className="flex-1 p-3">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab opacity-0 group-hover:opacity-100"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <Icon className="w-5 h-5 text-gray-600" />
          <div className="flex-1">
            <h4 className="font-medium">{item.title}</h4>
            {item.time && (
              <p className="text-sm text-gray-500">{item.time}</p>
            )}
          </div>
          <button
            onClick={() => onEdit(item)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-50 rounded text-blue-600 mr-1"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleRemove}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {(item.description || item.location || item.duration || item.cost) && (
          <div className="mt-2 pl-8">
            {item.description && (
              <p className="text-sm text-gray-600">{item.description}</p>
            )}
            {item.location && (
              <p className="text-sm text-gray-500 mt-1">{item.location}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              {item.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{item.duration}</span>
                </div>
              )}
              {item.cost && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{item.cost}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryItem;

export { ItineraryItem };