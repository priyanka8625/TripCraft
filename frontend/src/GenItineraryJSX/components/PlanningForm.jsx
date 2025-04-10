import React from "react";
import { FileText, Calendar, MapPin } from "lucide-react";
import { useItineraryStore } from "../store/itineraryStore";

export const PlanningForm = ({ onComplete }) => {
  const { setDates, setTitle, setDestination, setBudget, setSuggestedPeople } =
    useItineraryStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    setDates(data.startDate, data.endDate);
    setTitle(data.title);
    setDestination(data.destination);
    setBudget(parseFloat(data.budget));
    setSuggestedPeople(parseInt(data.suggestedPeople));

    onComplete(data);

    const itineraryData = {
      destination: data.destination,
      tripType: data.tripType,
      startDate: data.startDate,
      endDate: data.endDate,
      title: data.title,
      budget: parseFloat(data.budget),
      suggestedPeople: parseInt(data.suggestedPeople),
    };

    console.log(itineraryData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-8">
          Plan Your Journey
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Destination */}
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

            {/* Trip Type */}
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
                <option value="leisure">Leisure & Relaxation</option>
                <option value="business">Business</option>
                <option value="honeymoon">Honeymoon</option>
                <option value="adventure">Adventure</option>
                <option value="road_trip">Road Trip</option>
                <option value="cultural">Cultural</option>
                <option value="wellness">Spiritual & Wellness</option>
                <option value="cruise">Cruise</option>
                <option value="cruise">Professional & Academic</option>
              </select>
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

            {/* Itinerary Title */}
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

            {/* Estimated Budget Per Person */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                💰 Estimated Budget (per person)
              </label>
              <input
                type="number"
                name="budget"
                placeholder="Enter budget per person"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="0"
              />
            </div>

            {/* Suggested Number of People */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                👥 Suggested Number of People
              </label>
              <input
                type="number"
                name="suggestedPeople"
                placeholder="e.g. 4"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="1"
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
