import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Search, Calendar, Users, ChevronRight, ChevronLeft, MapPin, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import default styles (we'll override them)
import Footer from '../components/Footer';
const cities = [
  "Mumbai, India", "Delhi, India", "Bangalore, India", "Hyderabad, India",
  "Chennai, India", "Kolkata, India", "Pune, India", "Jaipur, India",
  "Ahmedabad, India", "Lucknow, India", "Chandigarh, India", "Goa, India",
  "Indore, India", "Coimbatore, India", "Kochi, India"
].map(city => ({ id: city.toLowerCase().replace(/[^a-z]/g, ''), name: city }));

const searchCities = async ({ queryKey }) => {
  const query = queryKey[1];
  return cities.filter(city => city.name.toLowerCase().includes(query.toLowerCase()));
};

const steps = [
  { id: 'city', title: 'Where to?' },
  { id: 'dates', title: 'When?' },
  { id: 'travelers', title: 'How many people' }
];

const PlanItinerary = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [selectedCity, setSelectedCity] = useState('');
  const [dates, setDates] = useState({ start: null, end: null, duration: 0 });
  const [travelers, setTravelers] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { data: citySuggestions } = useQuery({
    queryKey: ['cities', debouncedQuery],
    queryFn: searchCities,
    enabled: debouncedQuery.length > 0
  });

  // Scroll to top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Calculate duration whenever start or end date changes
  useEffect(() => {
    if (dates.start && dates.end) {
      const startDate = new Date(dates.start);
      const endDate = new Date(dates.end);
      const timeDiff = endDate - startDate;
      const duration = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
      setDates(prev => ({ ...prev, duration: duration > 0 ? duration : 0 }));
    }
  }, [dates.start, dates.end]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else if (currentStep === steps.length - 1) {
      // Show confirmation popup when "Create Itinerary" is clicked
      setShowConfirmation(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleConfirm = () => {
    // Handle confirmation (e.g., proceed with itinerary creation)
    setShowConfirmation(false);
    alert('Your Itinerary will be Generated.');
    // Optionally reset the form
    setCurrentStep(0);
    setSelectedCity('');
    setDates({ start: null, end: null, duration: 0 });
    setTravelers(1);
  };

  const handleEdit = () => {
    // Close the popup and allow editing
    setShowConfirmation(false);
    setCurrentStep(0); // Go back to the first step for editing
  };

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0 })
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-3 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a city..."
                className="pl-10 pr-4 py-3 w-full rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all"
              />
            </div>
            {debouncedQuery && citySuggestions && (
              <div className="mt-2 space-y-2">
                {citySuggestions.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setSelectedCity(city.name);
                      setSearchQuery(city.name);
                      handleNext();
                    }}
                    className="w-full p-3 flex items-center space-x-3 rounded-xl hover:bg-indigo-50 transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-indigo-500" />
                    <span>{city.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="relative">
              <DatePicker
                selected={dates.start}
                onChange={(date) => setDates({ ...dates, start: date })}
                placeholderText="Start Date"
                dateFormat="dd-MM-yyyy"
                minDate={new Date()} // Block previous days from today
                className="py-3 w-full rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all text-gray-700"
                popperPlacement="auto-end" // Automatically adjust placement, prefer right
                showPopperArrow={false}
                popperClassName="z-50" // Ensure calendar is in front
                popperModifiers={[
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 8], // Add vertical offset to avoid overlap
                    },
                  },
                  {
                    name: 'preventOverflow',
                    options: {
                      padding: 8, // Ensure the calendar stays within the viewport
                      boundariesElement: 'viewport', // Use viewport as boundary
                    },
                  },
                  {
                    name: 'flip',
                    options: {
                      behavior: ['top', 'bottom'], // Flip to top if there's not enough space below
                      fallbackPlacements: ['top-end', 'bottom-end'], // Fallback placements
                    },
                  },
                ]}
                customInput={
                  <div className="relative">
                    <input
                      type="text"
                      value={dates.start ? dates.start.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                      placeholder="Start Date"
                      className="pl-4 pr-10 py-3 w-full rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all text-gray-700"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer" />
                  </div>
                }
              />
            </div>
            <div className="relative">
              <DatePicker
                selected={dates.end}
                onChange={(date) => setDates({ ...dates, end: date })}
                placeholderText="End Date"
                dateFormat="dd-MM-yyyy"
                minDate={dates.start || new Date()} // Block previous days from start date or today
                className="py-3 w-full rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all text-gray-700"
                popperPlacement="auto-end" // Automatically adjust placement, prefer right
                showPopperArrow={false}
                popperClassName="z-50" // Ensure calendar is in front
                popperModifiers={[
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 8], // Add vertical offset to avoid overlap
                    },
                  },
                  {
                    name: 'preventOverflow',
                    options: {
                      padding: 8, // Ensure the calendar stays within the viewport
                      boundariesElement: 'viewport', // Use viewport as boundary
                    },
                  },
                  {
                    name: 'flip',
                    options: {
                      behavior: ['top', 'bottom'], // Flip to top if there's not enough space below
                      fallbackPlacements: ['top-end', 'bottom-end'], // Fallback placements
                    },
                  },
                ]}
                customInput={
                  <div className="relative mb-20">
                    <input
                      type="text"
                      value={dates.end ? dates.end.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                      placeholder="End Date"
                      className="pl-4 pr-10 py-3 w-full rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all text-gray-700"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer " />
                  </div>
                }
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="relative">
              <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                min={1}
                className="pl-10 pr-4 py-3 w-full rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Custom Calendar Styling */}
      <style>
        {`
          .react-datepicker {
            font-family: 'Inter', sans-serif;
            border: none; /* Remove border to match the image */
            border-radius: 0.75rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            background-color: white;
            z-index: 50; /* Ensure calendar is in front */
            width: 280px; /* Set a fixed width to match the image */
          }

          .react-datepicker__header {
            background: linear-gradient(to right, #4f46e5, #7c3aed);
            color: white;
            border-top-left-radius: 0.75rem;
            border-top-right-radius: 0.75rem;
            padding: 0.75rem;
            border-bottom: none;
            position: relative;
          }

          .react-datepicker__current-month {
            font-size: 1rem; /* Slightly smaller to match the image */
            font-weight: 600;
            color: white; /* White text to match the image */
          }

          .react-datepicker__navigation {
            top: 0.55rem; /* Adjust position to match the image */
          }

          .react-datepicker__navigation--previous,
          .react-datepicker__navigation--next {
            border: none;
            outline: none;
          }

          .react-datepicker__navigation-icon::before {
            border-color: white;
            border-width: 2px 2px 0 0;
            width: 8px;
            height: 8px;
          }

          .react-datepicker__day-name {
            color: #c2c1d4; /* Light purple to match the image */
            font-size: 0.75rem; /* Smaller font size */
            font-weight: 500;
            width: 2rem; /* Smaller width to match the image */
            line-height: 2rem;
            margin: 0.1rem; /* Reduced margin */
          }

          .react-datepicker__day {
            color: #374151;
            font-size: 0.875rem;
            width: 2rem; /* Smaller width to match the image */
            height: 2rem; /* Ensure height matches width */
            line-height: 2rem;
            margin: 0.1rem; /* Reduced margin */
            border-radius: 0.5rem;
            transition: all 0.2s ease;
          }
          .react-datepicker__day--disabled {
              background-color: none; /* Greyed out */
              color: black;
              cursor: not-allowed;
          }
          .react-datepicker__day:not(.react-datepicker__day--disabled):hover {
            background-color: #4f46e5;
            color: white;
            cursor:pointer;
          }

          .react-datepicker__day--selected,
          .react-datepicker__day--keyboard-selected {
            background-color: #4f46e5;
            color: white;
            font-weight: 600;
          }

          .react-datepicker__day--outside-month {
            color: #0f1929; /* Light purple for outside days */
          }

          .react-datepicker__day--today {
            font-weight: 600;
            background-color: #4f46e5;
            color: white; /* Blue for today to match the image */
          }

          .react-datepicker__footer {
            display: none; /* Hide the footer */
          }

          /* Animation for calendar popup */
          .react-datepicker-wrapper {
            position: relative;
            display: flex;
          }

          /* Confirmation Popup Styling */
          .confirmation-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 100;
          }

          .confirmation-box {
            background: white;
            border-radius: 1rem;
            padding: 1.5rem;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            position: relative;
          }

          .confirmation-box h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #374151;
          }

          .confirmation-box p {
            margin-bottom: 0.5rem;
            color: #6b7280;
          }

          .confirmation-box .buttons {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            margin-top: 1.5rem;
          }

          .confirmation-box .buttons button {
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .confirmation-box .buttons .yes-btn {
            background: linear-gradient(to right, #4f46e5, #7c3aed);
            color: white;
          }

          .confirmation-box .buttons .yes-btn:hover {
            background: linear-gradient(to right, #4338ca, #6d28d9);
          }

          .confirmation-box .buttons .edit-btn {
            background: #e5e7eb;
            color: #374151;
          }

          .confirmation-box .buttons .edit-btn:hover {
            background: #d1d5db;
          }

          .confirmation-box .close-btn {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: none;
            border: none;
            cursor: pointer;
            color: #6b7280;
          }
        `}
      </style>

      <div className="min-h-[2000px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Itinerary Planning Section */}
        <div className="pt-20">
          <div className="max-w-2xl mx-auto px-4 py-16">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="flex justify-between px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600">
                {steps.map((step, index) => (
                  <div key={step.id} className={`flex items-center ${index <= currentStep ? 'text-white' : 'text-white/50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStep ? 'bg-white/20' : 'bg-white/5'}`}>
                      {index + 1}
                    </div>
                    <span className="ml-2 hidden sm:flex">{step.title}</span>
                  </div>
                ))}
              </div>
              <div className="p-8">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={currentStep}
                    custom={currentStep}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="px-8 py-6 bg-gray-50 flex justify-between">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`flex items-center px-6 py-3 rounded-xl ${currentStep === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'} transition-all duration-300`}
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className={`flex items-center px-6 py-3 rounded-xl ${currentStep === steps.length - 1 ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'} text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300`}
                >
                  {currentStep === steps.length - 1 ? 'Create Itinerary' : 'Next'}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Popup */}
        {showConfirmation && (
          <div className="confirmation-overlay">
            <div className="confirmation-box">
              <button className="close-btn" onClick={() => setShowConfirmation(false)}>
                <X className="h-5 w-5" />
              </button>
              <h3>Confirm Your Itinerary</h3>
              <p><strong>Destination:</strong> {selectedCity}</p>
              <p><strong>Travel Dates:</strong> {dates.start?.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} to {dates.end?.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              <p><strong>Duration:</strong> {dates.duration} {dates.duration === 1 ? 'day' : 'days'}</p>
              <p><strong>Travelers:</strong> {travelers} {travelers === 1 ? 'person' : 'people'}</p>
              <div className="buttons">
                <button className="edit-btn" onClick={handleEdit}>Edit</button>
                <button className="yes-btn" onClick={handleConfirm}>Yes</button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Sections to Extend Height */}
        {/* Section 1: Popular Destinations */}
        <div className="py-16 px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Popular Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: 'Goa, India', image: './bbg1.jpg', description: 'Relax on pristine beaches and enjoy vibrant nightlife.' },
              { name: 'Jaipur, India', image: './bbg1.jpg', description: 'Explore the Pink City with its majestic forts and palaces.' },
              { name: 'Kochi, India', image: './bbg1.jpg', description: 'Experience the blend of history and modernity by the backwaters.' },
            ].map((destination, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img src={destination.image} alt={destination.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800">{destination.name}</h3>
                  <p className="mt-2 text-gray-600">{destination.description}</p>
                  <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Explore
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 2: Travel Tips */}
        <div className="py-16 px-4 bg-gray-100">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Travel Tips for Your Next Adventure</h2>
          <div className="max-w-4xl mx-auto space-y-8">
            {[
              { tip: 'Pack Light', description: 'Only bring essentials to make your travel hassle-free.' },
              { tip: 'Plan Ahead', description: 'Book accommodations and activities in advance to avoid last-minute stress.' },
              { tip: 'Stay Safe', description: 'Keep your belongings secure and be aware of your surroundings.' },
              { tip: 'Try Local Cuisine', description: 'Immerse yourself in the culture by tasting authentic dishes.' },
            ].map((tip, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white rounded-xl shadow-md"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold text-gray-800">{tip.tip}</h3>
                <p className="mt-2 text-gray-600">{tip.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 3: Call to Action */}
        <div className="py-16 px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Ready to Plan Your Next Trip?</h2>
          <p className="text-lg text-gray-600 mb-8">Let us help you create an unforgettable journey!</p>
          <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            Get Started
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

// Wrap the component with QueryClientProvider
const queryClient = new QueryClient();

const PlanItineraryWithProvider = () => (
  <QueryClientProvider client={queryClient}>
    <PlanItinerary />
  </QueryClientProvider>
);

export default PlanItineraryWithProvider;