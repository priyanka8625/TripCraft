import React, { useState } from 'react';
import { MapPin, DollarSign, Clock, Star, Tag } from 'lucide-react';
import { useItineraryStore } from '../store/itineraryStore';

export const AddActivityForm = ({ dayId, onClose, editItem }) => {
  const { addItem, updateItem } = useItineraryStore();
  const preferences = [
    'history',
    'food',
    'adventure',
    'relaxation',
    'shopping',
    'culture',
    'nature',
    'nightlife',
    'art',
    'spiritual',
  ];
  const [formData, setFormData] = useState({
    name: editItem?.name || editItem?.title || '',
    category: editItem?.category || editItem?.type || preferences[0], // Default to first preference
    location: editItem?.location || '',
    estimatedCost: editItem?.estimatedCost || editItem?.cost || '',
    timeSlot: editItem?.timeSlot || editItem?.time || '',
    rating: editItem?.rating || '',
    latitude: editItem?.latitude || '',
    longitude: editItem?.longitude || '',
  });


  const handleSubmit = (e) => {
    e.preventDefault();

    const item = {
      id: editItem?.id || crypto.randomUUID(),
      name: formData.name || 'Untitled',
      category: formData.category || 'unknown',
      location: formData.location || 'N/A',
      estimatedCost: formData.estimatedCost ? Number(formData.estimatedCost) : 0,
      timeSlot: formData.timeSlot || 'N/A',
      rating: formData.rating ? Number(formData.rating) : 0,
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
    };

    console.log('AddActivityForm - Submitting item:', item); // Debug

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

  // Helper function to capitalize the first letter
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-[60%] p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">{editItem ? 'Edit' : 'Add New'} Activity</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <Tag className="w-4 h-4" />
              Activity Category
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
                  {capitalize(pref)}
                </option>
              ))}
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
              placeholder="Activity name"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
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
              placeholder="Activity location"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <Clock className="w-4 h-4" />
                Time Slot
              </label>
              <input
                type="time"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex-1">
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <DollarSign className="w-4 h-4" />
                Estimated Cost
              </label>
              <input
                type="number"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleChange}
                placeholder="e.g. 20"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
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
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {editItem ? 'Save Changes' : 'Add Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};