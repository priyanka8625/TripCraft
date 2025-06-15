import React, { useState } from 'react';
import { MapPin, DollarSign, Clock, Star, Tag, Mountain, Leaf, Utensils, ShoppingBag, Music, Palette, Church, History, Coffee, ChevronDown, ChevronRight, Bed, UtensilsCrossed } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';

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
};

const fieldIcons = {
  category: Tag,
  location: MapPin,
  estimatedCost: DollarSign,
  timeSlot: Clock,
  rating: Star,
};

const DraggableCard = ({ item, type }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `template-${type}-${item.id || item.name}`,
    data: { ...item, type },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const CategoryIcon = categoryIcons[item.category] || Star;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="relative bg-white rounded-xl shadow-sm cursor-move hover:shadow-lg transition-all duration-300 p-4 border border-gray-100 hover:border-blue-200"
    >
      <div className="absolute top-3 right-3">
        <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
          {item.category || type}
        </span>
      </div>
      
      <div className="flex items-start gap-3 mb-3">
        <CategoryIcon className="w-6 h-6 text-blue-600 mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
            {item.name || 'Untitled'}
          </h3>
        </div>
      </div>
      
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <fieldIcons.location className="w-3 h-3 text-green-500" />
          <span className="truncate">{item.location || 'N/A'}</span>
        </div>
        {type === 'spot' && (
          <>
            <div className="flex items-center gap-2">
              <fieldIcons.timeSlot className="w-3 h-3 text-purple-500" />
              <span>{item.timeSlot || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <fieldIcons.estimatedCost className="w-3 h-3 text-emerald-500" />
                <span>₹{item.estimatedCost ? item.estimatedCost.toLocaleString() : '0'}</span>
              </div>
              <div className="flex items-center gap-1">
                <fieldIcons.rating className="w-3 h-3 text-yellow-500" />
                <span>{item.rating ? `${item.rating}` : 'N/A'}</span>
              </div>
            </div>
          </>
        )}
        {type === 'lunch' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <fieldIcons.estimatedCost className="w-3 h-3 text-emerald-500" />
              <span>₹{item.price ? item.price.toLocaleString() : '0'}</span>
            </div>
            <div className="flex items-center gap-1">
              <fieldIcons.rating className="w-3 h-3 text-yellow-500" />
              <span>{item.rating ? `${item.rating}` : 'N/A'}</span>
            </div>
          </div>
        )}
        {type === 'stay' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <fieldIcons.estimatedCost className="w-3 h-3 text-emerald-500" />
              <span>₹{item.pricePerNight ? item.pricePerNight.toLocaleString() : '0'}/night</span>
            </div>
            <div className="flex items-center gap-1">
              <fieldIcons.rating className="w-3 h-3 text-yellow-500" />
              <span>{item.rating ? `${item.rating}` : 'N/A'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Dummy data for recommendations
const dummyRecommendations = {
  spots: [
    {
      id: 'spot-1',
      name: 'Red Fort',
      location: 'Old Delhi',
      category: 'History',
      rating: 4.2,
      estimatedCost: 50,
      timeSlot: '09:00-17:00',
      latitude: 28.6562,
      longitude: 77.2410,
      duration: 2.5,
      durationUnit: 'hours'
    },
    {
      id: 'spot-2',
      name: 'India Gate',
      location: 'New Delhi',
      category: 'Popular',
      rating: 4.7,
      estimatedCost: 0,
      timeSlot: '24 hours',
      latitude: 28.6129,
      longitude: 77.2295,
      duration: 1.5,
      durationUnit: 'hours'
    },
    {
      id: 'spot-3',
      name: 'Lotus Temple',
      location: 'Kalkaji',
      category: 'Spiritual',
      rating: 4.3,
      estimatedCost: 0,
      timeSlot: '09:00-19:00',
      latitude: 28.5535,
      longitude: 77.2588,
      duration: 2,
      durationUnit: 'hours'
    },
    {
      id: 'spot-4',
      name: 'Humayun\'s Tomb',
      location: 'Nizamuddin',
      category: 'History',
      rating: 4.4,
      estimatedCost: 40,
      timeSlot: '06:00-18:00',
      latitude: 28.5933,
      longitude: 77.2507,
      duration: 2,
      durationUnit: 'hours'
    },
    {
      id: 'spot-5',
      name: 'Qutub Minar',
      location: 'Mehrauli',
      category: 'History',
      rating: 4.1,
      estimatedCost: 35,
      timeSlot: '07:00-17:00',
      latitude: 28.5245,
      longitude: 77.1855,
      duration: 2.5,
      durationUnit: 'hours'
    },
    {
      id: 'spot-6',
      name: 'Chandni Chowk',
      location: 'Old Delhi',
      category: 'Shopping',
      rating: 4.0,
      estimatedCost: 500,
      timeSlot: '10:00-20:00',
      latitude: 28.6506,
      longitude: 77.2303,
      duration: 3,
      durationUnit: 'hours'
    },
    {
      id: 'spot-7',
      name: 'Lodhi Gardens',
      location: 'Lodhi Estate',
      category: 'Nature',
      rating: 4.5,
      estimatedCost: 0,
      timeSlot: '05:00-20:00',
      latitude: 28.5931,
      longitude: 77.2167,
      duration: 2,
      durationUnit: 'hours'
    },
    {
      id: 'spot-8',
      name: 'Akshardham Temple',
      location: 'Noida Mor',
      category: 'Spiritual',
      rating: 4.6,
      estimatedCost: 170,
      timeSlot: '09:30-18:30',
      latitude: 28.6127,
      longitude: 77.2773,
      duration: 4,
      durationUnit: 'hours'
    }
  ],
  lunch: [
    {
      id: 'lunch-1',
      name: 'Karim\'s',
      location: 'Jama Masjid',
      category: 'Mughlai',
      rating: 4.4,
      price: 500,
      latitude: 28.6506,
      longitude: 77.2344
    },
    {
      id: 'lunch-2',
      name: 'Paranthe Wali Gali',
      location: 'Chandni Chowk',
      category: 'Street Food',
      rating: 4.2,
      price: 200,
      latitude: 28.6506,
      longitude: 77.2303
    },
    {
      id: 'lunch-3',
      name: 'Al Jawahar',
      location: 'Old Delhi',
      category: 'Mughlai',
      rating: 4.3,
      price: 600,
      latitude: 28.6509,
      longitude: 77.2348
    },
    {
      id: 'lunch-4',
      name: 'The Big Chill',
      location: 'Khan Market',
      category: 'Continental',
      rating: 4.4,
      price: 1500,
      latitude: 28.6007,
      longitude: 77.225
    }
  ],
  stay: [
    {
      id: 'stay-1',
      name: 'The Lodhi',
      location: 'Lodhi Road',
      category: 'Luxury',
      rating: 4.7,
      pricePerNight: 20000,
      latitude: 28.5921,
      longitude: 77.2226
    },
    {
      id: 'stay-2',
      name: 'The Oberoi, New Delhi',
      location: 'Dr. Zakir Hussain Marg',
      category: 'Luxury',
      rating: 4.9,
      pricePerNight: 28000,
      latitude: 28.6037,
      longitude: 77.2225
    },
    {
      id: 'stay-3',
      name: 'The Claridges, New Delhi',
      location: 'Dr APJ Abdul Kalam Road',
      category: 'Luxury',
      rating: 4.6,
      pricePerNight: 19000,
      latitude: 28.59,
      longitude: 77.2
    },
    {
      id: 'stay-4',
      name: 'ITC Maurya',
      location: 'Sardar Patel Marg',
      category: 'Luxury',
      rating: 4.6,
      pricePerNight: 18000,
      latitude: 28.5924,
      longitude: 77.1981
    }
  ]
};

const CollapsibleSection = ({ title, items, type, icon: Icon, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-800">{title}</span>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {items.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 space-y-4 max-h-80 overflow-y-auto">
          {items.map((item) => (
            <DraggableCard key={item.id} item={item} type={type} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({ recommendations = {} }) => {
  const [openSections, setOpenSections] = useState({
    spots: true,
    lunch: false,
    stay: false
  });

  // Use provided recommendations or fall back to dummy data
  const displayRecommendations = {
    spots: recommendations.spots || dummyRecommendations.spots,
    lunch: recommendations.lunch || dummyRecommendations.lunch,
    stay: recommendations.stay ? [recommendations.stay] : dummyRecommendations.stay
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="h-full bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-1">
          Recommended Options
        </h2>
        <p className="text-sm text-gray-600">
          Drag items to your itinerary
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <CollapsibleSection
          title="Spots"
          items={displayRecommendations.spots}
          type="spot"
          icon={MapPin}
          isOpen={openSections.spots}
          onToggle={() => toggleSection('spots')}
        />
        <CollapsibleSection
          title="Lunch"
          items={displayRecommendations.lunch}
          type="lunch"
          icon={UtensilsCrossed}
          isOpen={openSections.lunch}
          onToggle={() => toggleSection('lunch')}
        />
        <CollapsibleSection
          title="Stay"
          items={displayRecommendations.stay}
          type="stay"
          icon={Bed}
          isOpen={openSections.stay}
          onToggle={() => toggleSection('stay')}
        />
      </div>
    </div>
  );
};