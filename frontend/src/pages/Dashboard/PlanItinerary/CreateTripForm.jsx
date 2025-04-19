import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTripWithAi } from '../../../services/tripService';
import LoadingScreen from '../../../components/Dashboard/PlanItinerary/LoadingScreen';

function App() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    people: 0,
    budget: 0,
    preferences: [],
    collaborators: [],
  });
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [emailError, setEmailError] = useState('');

  const preferences = [
    'history', 'food', 'adventure', 'relaxation', 'shopping',
    'culture', 'nature', 'nightlife', 'art', 'spiritual'
  ];

  const today = new Date().toISOString().split('T')[0];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      setFormData({ 
        ...formData, 
        [name]: value,
        endDate: formData.endDate && formData.endDate < value ? '' : formData.endDate 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePreferenceChange = (preference) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference]
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addCollaborator = (e) => {
    e.preventDefault();
    if (!collaboratorEmail) {
      setEmailError('Please enter an email address');
      return;
    }
    if (!validateEmail(collaboratorEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (formData.collaborators.includes(collaboratorEmail)) {
      setEmailError('This email is already added');
      return;
    }
    setFormData({
      ...formData,
      collaborators: [...formData.collaborators, collaboratorEmail],
    });
    setCollaboratorEmail('');
    setEmailError('');
  };

  const removeCollaborator = (email) => {
    setFormData({
      ...formData,
      collaborators: formData.collaborators.filter((c) => c !== email),
    });
  };

  const validateStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.destination.trim())
          newErrors.destination = 'Destination is required';
        break;
      case 2:
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (formData.startDate && formData.endDate && formData.startDate > formData.endDate)
          newErrors.endDate = 'End date must be after start date';
        break;
      case 3:
        if (formData.people <= 0)
          newErrors.people = 'Number of people must be greater than 0';
        if (formData.budget <= 0)
          newErrors.budget = 'Budget must be greater than 0';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
      setApiError(''); // Clear API errors when moving to next step
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setApiError(''); // Clear API errors when going back
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep()) {
      console.log("data", formData);
      
      setIsLoading(true);
      setApiError('');
      try {
        const response = await createTripWithAi(formData);
        // Redirect to itinerary page with tripId
        navigate('/dashboard/itinerary', { state: { tripId: response.trip.id } });
      } catch (error) {
        setApiError(error.message || 'Failed to create trip');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex-1 h-full flex items-start justify-center p-4 bg-gradient-to-br to-teal-50">
      <div className="bg-white p-8 mt-9 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-2xl border border-emerald-50">
        <div className="mb-8">
          <div className="flex justify-between items-center relative">
            <div className="absolute h-1 bg-gray-200 top-1/2 -translate-y-1/2 left-0 right-0 z-0"></div>
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                  step <= currentStep
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-110'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {apiError && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl">
              {apiError}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                  placeholder="Enter trip title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                  placeholder="Enter destination"
                />
                {errors.destination && (
                  <p className="text-red-500 text-sm mt-1">{errors.destination}</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  min={today}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none [&::-webkit-calendar-picker-indicator]:bg-emerald-600 [&::-webkit-calendar-picker-indicator]:hover:bg-emerald-700 [&::-webkit-calendar-picker-indicator]:rounded-lg [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  min={formData.startDate || today}
                  onChange={handleInputChange}
                  disabled={!formData.startDate}
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:bg-emerald-600 [&::-webkit-calendar-picker-indicator]:hover:bg-emerald-700 [&::-webkit-calendar-picker-indicator]:rounded-lg [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
                {!formData.startDate && (
                  <p className="text-gray-500 text-sm mt-1">Please select a start date first</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of People
                </label>
                <input
                  type="number"
                  name="people"
                  value={formData.people}
                  onChange={handleInputChange}
                  min="1"
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                  placeholder="Enter number of people"
                />
                {errors.people && (
                  <p className="text-red-500 text-sm mt-1">{errors.people}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                  placeholder="Enter budget"
                />
                {errors.budget && (
                  <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Trip Preferences (Optional)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto p-2">
                {preferences.map((preference) => (
                  <button
                    key={preference}
                    type="button"
                    onClick={() => handlePreferenceChange(preference)}
                    className={`px-4 py-2 rounded-xl border transition-all duration-200 capitalize text-sm ${
                      formData.preferences.includes(preference)
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'
                    }`}
                  >
                    {preference}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Collaborators (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={collaboratorEmail}
                    onChange={(e) => setCollaboratorEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                  />
                  <button
                    onClick={addCollaborator}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-200 shadow-lg shadow-emerald-200 hover:shadow-emerald-300"
                  >
                    Add
                  </button>
                </div>
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
                <div className="mt-4 space-y-2 max-h-[40vh] overflow-y-auto">
                  {formData.collaborators.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-100 transition-all duration-200 hover:shadow-md"
                    >
                      <span className="text-emerald-800">{email}</span>
                      <button
                        onClick={() => removeCollaborator(email)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
              >
                Back
              </button>
            )}
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-200 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 ml-auto"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-200 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 ml-auto"
              >
                Create Itinerary
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;