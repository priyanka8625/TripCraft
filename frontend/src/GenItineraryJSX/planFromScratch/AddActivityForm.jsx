import React, { useState } from 'react';
import { Camera, Clock, MapPin, FileText, DollarSign } from 'lucide-react';
import { useItineraryStore } from '../store/itineraryStore';

export const AddActivityForm = ({ dayId, onClose, editItem }) => {
  const { addItem, updateItem } = useItineraryStore();
  const [formData, setFormData] = useState({
    type: editItem?.type || 'activity',
    title: editItem?.title || '',
    time: editItem?.time || '',
    description: editItem?.description || '',
    location: editItem?.location || '',
    duration: editItem?.duration || '',
    cost: editItem?.cost || '',
    image: editItem?.image || '',
  });
  const [imagePreview, setImagePreview] = useState(editItem?.image || null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const item = {
      id: editItem?.id || crypto.randomUUID(),
      ...formData,
    };
    
    if (editItem) {
      updateItem(dayId, item);
    } else {
      addItem(dayId, item);
    }
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setImagePreview(imageUrl);
        setFormData(prev => ({ ...prev, image: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-[60%] p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">{editItem ? 'Edit' : 'Add New'} Activity</h2>
        <div className="flex gap-6">
          <div className="w-[30%]">
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Activity Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: '' }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100">
                        Upload Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex-1 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <FileText className="w-4 h-4" />
                Activity Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="activity">Activity</option>
                <option value="sightseeing">Sightseeing</option>
                <option value="restaurant">Restaurant</option>
                <option value="transport">Transport</option>
                <option value="accommodation">Accommodation</option>
                <option value="break">Break</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <Camera className="w-4 h-4" />
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Activity title"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <Clock className="w-4 h-4" />
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex-1">
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <Clock className="w-4 h-4" />
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 2-3 hours"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <DollarSign className="w-4 h-4" />
                Cost
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="e.g. €20 per person"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <FileText className="w-4 h-4" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Activity description"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
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
    </div>
  );
};
