import React from 'react';
import { FileText, Calendar, MapPin } from 'lucide-react';
import { useItineraryStore } from '../store/itineraryStore';

export const PlanningForm = ({ onComplete }) => {
  const { setDates } = useItineraryStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    setDates(data.startDate, data.endDate);
    onComplete(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-8">Plan Your Journey</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <MapPin className="w-5 h-5" />
                Destination
              </label>
              <input
                type="text"
                name="destination"
                placeholder="Enter destination"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <FileText className="w-5 h-5" />
                Trip Type
              </label>
              <select
                name="tripType"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Trip Type</option>
                <option value="leisure">Leisure</option>
                <option value="business">Business</option>
                <option value="family">Family</option>
                <option value="adventure">Adventure</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <Calendar className="w-5 h-5" />
                Trip Dates
              </label>
              <div className="flex gap-4">
                <input
                  type="date"
                  name="startDate"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <span className="flex items-center text-gray-400">to</span>
                <input
                  type="date"
                  name="endDate"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <FileText className="w-5 h-5" />
                Itinerary Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter itinerary title"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
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