import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MapPin, Bus, Coffee, Utensils, Camera, GripVertical, X, Clock, DollarSign, Edit, Leaf, Tag, Star, Mountain, ShoppingBag, Music, Palette, Church, History, Bed, UtensilsCrossed } from 'lucide-react';
import { useItineraryStore } from '../store/itineraryStore';

const categoryIcons = {
  Popular: Star,
  Cultural: Palette,
  Offbeat: Mountain,
  Nature: Leaf,
  Adventure: Mountain,
  Food: Utensils,
  Shopping: ShoppingBag,
  Nightlife: Music,
  Art: Palette,
  Spiritual: Church,
  History: History,
  Relaxation: Coffee,
  Travel: Bus,
  activity: Calendar,
  sightseeing: Camera,
  accommodation: MapPin,
  transport: Bus,
  restaurant: Utensils,
  break: Coffee,
};

const typeIcons = {
  spot: MapPin,
  lunch: UtensilsCrossed,
  stay: Bed,
};

const fieldIcons = {
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

  const Icon = typeIcons[item.type] || categoryIcons[item.category] || categoryIcons[item.type] || MapPin;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRemove = () => {
    removeItem(dayId, item.id);
  };

  const normalizedItem = {
    name: item.name || 'Untitled Item',
    category: item.category || 'N/A',
    location: item.location || 'N/A',
    estimatedCost: item.estimatedCost || item.price || item.pricePerNight || 0,
    timeSlot: item.timeSlot || 'N/A',
    rating: item.rating || 0,
    duration: item.duration || 0,
    durationUnit: item.durationUnit || 'hours',
    type: item.type || 'spot',
  };

  const getCostLabel = () => {
    switch (normalizedItem.type) {
      case 'lunch':
        return 'Price';
      case 'stay':
        return 'Per Night';
      default:
        return 'Cost';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 bg-white rounded-lg border border-gray-200 group hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="flex-1 p-4">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </div>
          <Icon className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{normalizedItem.name}</h4>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
              {normalizedItem.type}
            </span>
          </div>
          <button
            onClick={() => onEdit(item)}
            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleRemove}
            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg text-red-600 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-3 pl-8 grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <fieldIcons.category className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{normalizedItem.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <fieldIcons.location className="w-4 h-4 text-green-500" />
            <span className="truncate">{normalizedItem.location}</span>
          </div>
          {normalizedItem.type === 'spot' && (
            <>
              <div className="flex items-center gap-2">
                <fieldIcons.timeSlot className="w-4 h-4 text-purple-500" />
                <span>{normalizedItem.timeSlot}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>{normalizedItem.duration} {normalizedItem.durationUnit}</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <fieldIcons.estimatedCost className="w-4 h-4 text-emerald-500" />
            <span>₹{normalizedItem.estimatedCost ? normalizedItem.estimatedCost.toLocaleString() : '0'} {getCostLabel()}</span>
          </div>
          <div className="flex items-center gap-2">
            <fieldIcons.rating className="w-4 h-4 text-yellow-500" />
            <span>{normalizedItem.rating ? `${normalizedItem.rating}/5` : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryItem;
export { ItineraryItem };