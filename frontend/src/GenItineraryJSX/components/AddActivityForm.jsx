import React, { useState } from 'react';
import { MapPin, DollarSign, Clock, Star, Tag } from 'lucide-react';
import { useItineraryStore } from '../store/itineraryStore';

export const AddActivityForm = ({ dayId, onClose, editItem }) => {
  const { addItem, updateItem } = useItineraryStore();
  const preferences = [
    'Popular',
    'Cultural',
    'Offbeat',
    'Nature',
    'Adventure',
    'Food',
    'Shopping',
    'Nightlife',
    'Art',
    'Spiritual',
    'History',
    'Relaxation'
  ];
  
  const [formData, setFormData] = useState({
    name: editItem?.name || '',
    category: editItem?.category || preferences[0],
    location: editItem?.location || '',
    estimatedCost: editItem?.estimatedCost || editItem?.price || editItem?.pricePerNight || '',
    timeSlot: editItem?.timeSlot || '',
    rating: editItem?.rating || '',
    duration: editItem?.duration || '',
    durationUnit: editItem?.durationUnit || 'hours',
    type: editItem?.type || 'spot', // New field for type
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const item = {
      id: editItem?.id || crypto.randomUUID(),
      name: formData.name || 'Untitled',
      category: formData.category || 'Popular',
      location: formData.location || 'N/A',
      estimatedCost: formData.estimatedCost ? Number(formData.estimatedCost) : 0,
      timeSlot: formData.timeSlot || 'N/A',
      rating: formData.rating ? Number(formData.rating) : 0,
      duration: formData.duration ? Number(formData.duration) : 2,
      durationUnit: formData.durationUnit || 'hours',
      type: formData.type || 'spot',
      // Add price fields for lunch and stay
      ...(formData.type === 'lunch' && { price: formData.estimatedCost ? Number(formData.estimatedCost) : 0 }),
      ...(formData.type === 'stay' && { pricePerNight: formData.estimatedCost ? Number(formData.estimatedCost) : 0 }),
    };

    console.log('AddActivityForm - Submitting item:', item);

    if (editItem) {
      updateItem(dayId, item);
    } else {
      addItem(dayId, item);
    }
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getCostLabel = () => {
    switch (formData.type) {
      case 'lunch':
        return 'Price';
      case 'stay':
        return 'Price per Night';
      default:
        return 'Estimated Cost';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-[60%] max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">{editItem ? 'Edit' : 'Add New'} Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <Tag className="w-4 h-4" />
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="spot">Spot</option>
              <option value="lunch">Lunch</option>
              <option value="stay">Stay</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <Tag className="w-4 h-4" />
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <Tag className="w-4 h-4" />
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {preferences.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-4">
            {formData.type === 'spot' && (
              <div className="flex-1">
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <Clock className="w-4 h-4" />
                  Time Slot
                </label>
                <input
                  type="text"
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleChange}
                  placeholder="e.g. 09:00-11:00"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {formData.type === 'spot' && (
              <div className="flex-1">
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <Clock className="w-4 h-4" />
                  Duration
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="2"
                    step="0.5"
                    min="0"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    name="durationUnit"
                    value={formData.durationUnit}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="hours">Hours</option>
                    <option value="minutes">Minutes</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <DollarSign className="w-4 h-4" />
                {getCostLabel()}
              </label>
              <input
                type="number"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleChange}
                placeholder="e.g. 500"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex-1">
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <Star className="w-4 h-4" />
                Rating (0-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
                placeholder="e.g. 4.5"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {editItem ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};