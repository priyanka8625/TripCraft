import React, { useState } from 'react';
import { FileText, Calendar, MapPin, Users, User, IndianRupee } from 'lucide-react';

const CreateTripForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    noOfPeople: 0,
    budget: 0,
    collaborators: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'collaborators') {
      const emails = value.split(',').map((email) => email.trim());
      setFormData((prev) => ({
        ...prev,
        collaborators: emails,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-8">Plan Your Journey</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">

            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <FileText className="w-5 h-5" />
                Itinerary Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter itinerary title"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Destination */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <MapPin className="w-5 h-5" />
                Destination
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Enter destination"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Trip Dates */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <Calendar className="w-5 h-5" />
                Trip Dates
              </label>
              <div className="flex gap-4">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <span className="flex items-center text-gray-400">to</span>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Number of People */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <User className="w-5 h-5" />
                Number of People
              </label>
              <input
                type="number"
                name="noOfPeople"
                value={formData.noOfPeople}
                onChange={handleChange}
                placeholder="e.g. 4"
                min="1"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Budget */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <IndianRupee className="w-5 h-5" />
                Budget (₹)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Total trip budget"
                min="0"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Collaborators */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <Users className="w-5 h-5" />
                Collaborators (comma-separated emails)
              </label>
              <input
                type="text"
                name="collaborators"
                onChange={handleChange}
                placeholder="e.g. john@example.com, jane@domain.com"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start Planning
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTripForm;
