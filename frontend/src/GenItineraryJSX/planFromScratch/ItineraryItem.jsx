import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MapPin, Bus, Coffee, Utensils, Camera, GripVertical, X, Clock, DollarSign, Edit, Leaf, Tag, Star } from 'lucide-react';
import { useItineraryStore } from '../store/itineraryStore';

// Map icons to fields, matching Sidebar and supporting type
const icons = {
  activity: Calendar,
  sightseeing: Camera,
  accommodation: MapPin,
  transport: Bus,
  restaurant: Utensils,
  break: Coffee,
  nature: Leaf,
  category: Tag,
  location: MapPin,
  estimatedCost: DollarSign,
  timeSlot: Clock,
  rating: Star,
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

  // Use category or type for icon, fallback to MapPin
  const Icon = icons[item.category] || icons[item.type] || MapPin;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRemove = () => {
    removeItem(dayId, item.id);
  };

  // Debug item data
  console.log('ItineraryItem item:', item);

  // Normalize item fields
  const normalizedItem = {
    name: item.name || 'Untitled Item',
    category: item.category || 'N/A',
    location: item.location || 'N/A',
    estimatedCost: item.estimatedCost || item.cost || 0,
    timeSlot: item.timeSlot || item.time || 'N/A',
    rating: item.rating || 0,
    latitude: item.latitude || null,
    longitude: item.longitude || null,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 bg-white rounded-lg border border-gray-200 group hover:border-blue-500 overflow-hidden"
    >
      {normalizedItem.image && (
        <img
          src={normalizedItem.image}
          alt={normalizedItem.name}
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
            <h4 className="font-medium">{normalizedItem.name}</h4>
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
        <div className="mt-2 pl-8 space-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <icons.category className="w-4 h-4 text-emerald-600" />
            <span className="capitalize">{normalizedItem.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <icons.location className="w-4 h-4 text-emerald-600" />
            <span>{normalizedItem.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <icons.estimatedCost className="w-4 h-4 text-emerald-600" />
            <span>{normalizedItem.estimatedCost ? normalizedItem.estimatedCost.toLocaleString() : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <icons.timeSlot className="w-4 h-4 text-emerald-600" />
            <span>{normalizedItem.timeSlot}</span>
          </div>
          <div className="flex items-center gap-2">
            <icons.rating className="w-4 h-4 text-emerald-600" />
            <span>{normalizedItem.rating ? `${normalizedItem.rating}/5` : 'N/A'}</span>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ItineraryItem;
export { ItineraryItem };