import React, { useEffect, useState } from 'react';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useLocation, useParams } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ItineraryDay } from './components/ItineraryDay';
import { useItineraryStore } from './store/itineraryStore';
import { Calendar, Plus, Save, MapPin, Users, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { createItinerary } from '../services/itineraryService';
import { addCollaborator } from '../services/collaboratorService';
import useWebSocket from '../hooks/useWebSocket';

function PlanFromScratch() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const location = useLocation();
  const { mode } = useParams();
  const isEditMode = mode === 'edit';

  const {
    days,
    addDay,
    addItem,
    title,
    destination,
    setDestination,
    startDate,
    endDate,
    budget,
    suggestedPeople,
    setTitle,
    setDates,
    setBudget,
    setSuggestedPeople,
    setDays,
    tripId,
    setTripId, // Added to destructure the setter
  } = useItineraryStore();

  const [recommendations, setRecommendations] = useState({});

  useEffect(() => {
    if (location.state) {
      const { tripId, tripData, lunch, stay, spots, itinerary } = location.state;
      setTitle(tripData.title);
      setDestination(tripData.destination);
      setDates(tripData.startDate, tripData.endDate);
      setBudget(tripData.budget);
      setSuggestedPeople(tripData.people);
      setTripId(tripId); // Added to set tripId in the store

      if (isEditMode && itinerary) {
        setDays(itinerary.map(day => ({
          id: day.id || crypto.randomUUID(),
          date: day.date,
          items: day.items.map(item => ({
            ...item,
            id: item.id || crypto.randomUUID(),
          })),
        })));
        setRecommendations({});
      } else {
        setRecommendations({
          lunch: lunch || [],
          stay: stay || [],
          spots: spots || [],
        });
        const start = new Date(tripData.startDate);
        const end = new Date(tripData.endDate);
        const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const newDays = Array.from({ length: dayCount }, (_, i) => {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          return {
            id: crypto.randomUUID(),
            date: date.toISOString().split('T')[0],
            items: [],
          };
        });
        setDays(newDays);
      }
    } else {
      toast.error('No trip data found. Please create a trip first.');
      setTitle('');
      setDestination('');
      setDates('', '');
      setBudget(0);
      setSuggestedPeople(0);
      setRecommendations({ lunch: [], stay: [], spots: [] });
      setDays([]);
    }
  }, [
    location.state,
    isEditMode,
    setTitle,
    setDestination,
    setDates,
    setBudget,
    setSuggestedPeople,
    setDays,
    setTripId, // Added to dependencies
  ]);

   const { sendUpdate } = useWebSocket(tripId, (incomingEdit) => {
    // Update your itinerary state here based on incomingEdit
    console.log("Real-time edit: ", incomingEdit);
  }); 


  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.data.current) {
      const droppedItem = active.data.current;
      const dayId = over.data.current?.dayId;
      if (dayId) {
        const newItem = {
          id: `${droppedItem.id || 'unknown'}-${Date.now()}`,
          name: droppedItem.name || 'Untitled',
          category: droppedItem.category || 'Popular',
          location: droppedItem.location || 'N/A',
          estimatedCost: droppedItem.estimatedCost || droppedItem.price || droppedItem.pricePerNight || 0,
          timeSlot: droppedItem.timeSlot || 'N/A',
          rating: droppedItem.rating || 0,
          latitude: droppedItem.latitude || null,
          longitude: droppedItem.longitude || null,
          duration: droppedItem.duration || 2,
          durationUnit: droppedItem.durationUnit || 'hours',
          type: droppedItem.type || 'spot',
          ...(droppedItem.type === 'lunch' && { price: droppedItem.price || droppedItem.estimatedCost || 0 }),
          ...(droppedItem.type === 'stay' && { pricePerNight: droppedItem.pricePerNight || droppedItem.estimatedCost || 0 }),
        };
        addItem(dayId, newItem);
        toast.success(`Added ${newItem.name} to your itinerary!`);
      }
    }
  };

  const handleAddDay = () => {
    const currentLastDay = days[days.length - 1];
    let newDate;
    if (currentLastDay) {
      const lastDate = new Date(currentLastDay.date);
      lastDate.setDate(lastDate.getDate() + 1);
      newDate = lastDate.toISOString().split('T')[0];
    } else {
      newDate = new Date(startDate).toISOString().split('T')[0];
    }
    addDay(newDate);
    toast.success('New day added to your itinerary!');
  };

  const handleAddCollaborator = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCollaboratorEmail('');
  };

  const handleSubmitCollaborator = async (e) => {
    e.preventDefault();
    if (!collaboratorEmail) {
      toast.error('Please enter an email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(collaboratorEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (collaborators.includes(collaboratorEmail)) {
      toast.error('This email is already added as a collaborator.');
      return;
    }
    if (!tripId) {
      toast.error('No trip found. Please create a trip first.');
      return;
    }

    try {
      await addCollaborator(tripId, collaboratorEmail);
      setCollaborators([...collaborators, collaboratorEmail]);
      toast.success(`Added ${collaboratorEmail} as a collaborator!`);
      setCollaboratorEmail('');
    } catch (error) {
      toast.error(error.message || 'Failed to add collaborator. Please try again.');
    }
  };

  const calculateRemainingDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays + 1 - days.length);
  };

  const handleSaveItinerary = async () => {
    if (!tripId) {
      toast.error('No trip ID found. Please create a trip first.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const itineraryData = {
        tripId,
        itinerary: days.map((day, index) => {
          const dayDate = new Date(day.date);
          const formattedDate = dayDate.toISOString().split('T')[0];

          const activities = day.items
            .filter(item => item.type === 'spot' || !item.type)
            .map(item => ({
              name: item.name || 'Untitled',
              category: item.category || 'Popular',
              location: item.location || 'N/A',
              time_slot: item.timeSlot || 'N/A',
              duration: Number(item.duration) || 2.0,
              durationUnit: item.durationUnit || 'hours',
              estimatedCost: Number(item.estimatedCost) || 0,
              rating: Number(item.rating) || 0,
              latitude: Number(item.latitude) || 0,
              longitude: Number(item.longitude) || 0,
            }));

          const lunch = day.items
            .filter(item => item.type === 'lunch')
            .map(item => ({
              name: item.name || 'Untitled',
              location: item.location || 'N/A',
              price: Number(item.price || item.estimatedCost) || 0,
              rating: Number(item.rating) || 0,
              latitude: Number(item.latitude) || 0,
              longitude: Number(item.longitude) || 0,
            }));

          const stay = day.items
            .filter(item => item.type === 'stay')
            .map(item => ({
              name: item.name || 'Untitled',
              location: item.location || 'N/A',
              pricePerNight: Number(item.pricePerNight || item.estimatedCost) || 0,
              rating: Number(item.rating) || 0,
              latitude: Number(item.latitude) || 0,
              longitude: Number(item.longitude) || 0,
            }));

          return { day: index + 1, date: formattedDate, activities, lunch, stay };
        }),
      };

      console.log("Sending itinerary data:", itineraryData);
      const response = await createItinerary(itineraryData);
      console.log("Saved response:", response);
      
      setSaveSuccess(true);
      toast.success('Itinerary saved successfully!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving itinerary:', error);
      setSaveError(error.message);
      toast.error(error.message || 'Failed to save itinerary. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const remainingDays = calculateRemainingDays();

  return (
    <>
      <Toaster position="top-right" />
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex h-screen bg-gray-50">
          {!isEditMode && (
            <div className="w-80 bg-white shadow-lg flex flex-col">
              <Sidebar recommendations={recommendations} />
            </div>
          )}
          <div className="flex-1 flex flex-col">
            <div className="bg-white shadow-sm border-b">
              <div className="px-8 py-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Itinerary Planner</h1>
                    {destination && (
                      <div className="flex items-center gap-2 mt-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-lg">Planning your trip to {destination}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleAddCollaborator}
                      disabled={isSaving || !tripId}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                        isSaving || !tripId
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <Users className="w-5 h-5" />
                      <span>Add Collaborator</span>
                    </button>
                    <button
                      onClick={handleSaveItinerary}
                      disabled={isSaving || !tripId}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                        isSaving || !tripId
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <Save className="w-5 h-5" />
                      <span>{isSaving ? 'Saving...' : 'Save Itinerary'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Add Collaborator</h2>
                    <button onClick={handleCloseModal} className="text-gray-600 hover:text-gray-800">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="mb-6">
                    <input
                      type="email"
                      value={collaboratorEmail}
                      onChange={(e) => setCollaboratorEmail(e.target.value)}
                      placeholder="Enter collaborator's email"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      onClick={handleSubmitCollaborator}
                      className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Email
                    </button>
                  </div>
                  {collaborators.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Collaborators</h3>
                      <ul className="space-y-2">
                        {collaborators.map((email, index) => (
                          <li key={index} className="text-gray-700 bg-gray-100 p-2 rounded-lg">
                            {email}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            {title && startDate && endDate && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Duration</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {startDate === endDate ? startDate : `${startDate} - ${endDate}`}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Travelers</h4>
                    <p className="text-lg font-semibold text-gray-900">{suggestedPeople} people</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Budget</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{(budget * suggestedPeople).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto p-8">
                <div className="mb-6 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Your Itinerary</h3>
                  {remainingDays > 0 && (
                    <button
                      onClick={handleAddDay}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Day ({remainingDays} remaining)</span>
                    </button>
                  )}
                </div>
                <div className="space-y-6">
                  {days.map((day) => (
                    <ItineraryDay key={day?.id} day={day} />
                  ))}
                  {days.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
                      <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg mb-2">No days planned yet</p>
                      <p className="text-gray-400">Click "Add Day" to start planning your itinerary</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DndContext>
    </>
  );
}

export default PlanFromScratch;