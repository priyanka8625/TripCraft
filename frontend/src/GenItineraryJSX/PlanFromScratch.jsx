import React, { useEffect, useState } from 'react';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Sidebar } from './planFromScratch/Sidebar';
import { ItineraryDay } from './planFromScratch/ItineraryDay';
import { useItineraryStore } from './store/itineraryStore';
import { Calendar, Plus, Users, Save } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { createItinerary } from '../services/itineraryService';
import toast from 'react-hot-toast';

function PlanFromScratch() {
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    days,
    addDay,
    addItem,
    addCollaborator,
    collaborators,
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
    setCollaborators,
    getState,
  } = useItineraryStore();

  const location = useLocation();
  const [recommendations, setRecommendations] = useState([]);
  const [tripId, setTripId] = useState(null);

  // Log location.state and tripId on mount
  useEffect(() => {
    console.log('[PlanFromScratch] location.state:', location.state);
    const tripData = location.state?.tripData;
    const spots = location.state?.spots;
    setTripId(location.state?.tripId);
    console.log('[PlanFromScratch] tripData:', tripData);
    console.log('[PlanFromScratch] spots:', spots);
    console.log('[PlanFromScratch] Setting tripId:', tripId);

    if (tripData) {
      setTitle(tripData.title || '');
      setDestination(tripData.destination || '');
      setDates(tripData.startDate || '', tripData.endDate || '');
      setBudget(tripData.budget || 0);
      setSuggestedPeople(tripData.people || 1);
      setCollaborators(tripData.collaborators || []);
      setRecommendations(spots || []);

      if (Array.isArray(spots) && spots.length > 0) {
        const mappedSpots = spots.map((spot) => ({
          id: spot.id || crypto.randomUUID(),
          category: spot.category || 'unknown',
          estimatedCost: spot.estimatedCost || 0,
          latitude: spot.latitude || 0,
          location: spot.location || 'Unknown',
          longitude: spot.longitude || 0,
          name: spot.name || 'Unnamed Spot',
          rating: spot.rating || 0,
          timeSlot: spot.timeSlot || 'Any',
        }));
        console.log('[PlanFromScratch] mappedSpots:', mappedSpots);
        setRecommendations(mappedSpots);
      } else {
        console.log('[PlanFromScratch] No valid spots found, setting recommendations to []');
        setRecommendations([]);
      }
    } else {
      console.warn('[PlanFromScratch] No tripData found in location.state');
    }
  }, [
    location.state,
    setTitle,
    setDestination,
    setDates,
    setBudget,
    setSuggestedPeople,
    setCollaborators,
  ]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = (event) => {
    console.log('[PlanFromScratch] DndContext onDragEnd:', event);
    const { active, over } = event;
    if (over && active.data.current) {
      const droppedItem = active.data.current;
      const dayId = over.data.current?.dayId;
      if (dayId) {
        console.log('[PlanFromScratch] DndContext - Dropped item:', droppedItem);
        console.log('[PlanFromScratch] DndContext - Dropped item keys:', Object.keys(droppedItem || {}));
        console.log('[PlanFromScratch] DndContext - Dropped item fields:', {
          name: droppedItem.name,
          title: droppedItem.title,
          category: droppedItem.category,
          location: droppedItem.location,
          estimatedCost: droppedItem.estimatedCost,
          timeSlot: droppedItem.timeSlot,
          rating: droppedItem.rating,
          latitude: droppedItem.latitude,
          longitude: droppedItem.longitude,
        });
        const newItem = {
          id: `${droppedItem.id || 'unknown'}-${Date.now()}`,
          name: droppedItem.name || droppedItem.title || 'Untitled',
          category: droppedItem.category || droppedItem.type || 'unknown',
          location: droppedItem.location || 'N/A',
          estimatedCost: droppedItem.estimatedCost || droppedItem.cost || 0,
          timeSlot: droppedItem.timeSlot || droppedItem.time || 'N/A',
          rating: droppedItem.rating || 0,
          latitude: droppedItem.latitude || null,
          longitude: droppedItem.longitude || null,
        };
        console.log('[PlanFromScratch] DndContext - Normalized newItem:', newItem);
        addItem(dayId, newItem);
      } else {
        console.warn('[PlanFromScratch] No dayId found in over.data.current:', over);
      }
    } else {
      console.warn('[PlanFromScratch] Invalid drag end:', { active, over });
    }
  };

  const handleAddDay = () => {
    const currentLastDay = days[days.length - 1];
    let newDate;

    if (currentLastDay) {
      const lastDate = new Date(currentLastDay.date);
      lastDate.setDate(lastDate.getDate() + 1);
      newDate = lastDate.toLocaleDateString();
    } else {
      newDate = new Date(startDate).toLocaleDateString();
    }

    addDay(newDate);
  };

  const handleAddCollaborator = (email) => {
    if (email) {
      addCollaborator(email);
      setShowCollaboratorModal(false);
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
    console.log('[PlanFromScratch] handleSaveItinerary called');
    console.log('[PlanFromScratch] tripId:', tripId);
    // console.log('[PlanFromScratch] Store state:', getState());

    if (!tripId) {
      console.warn('[PlanFromScratch] No tripId found');
      setSaveError('No trip ID found. Please create a trip first.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const activities = days.flatMap((day, index) => {
        const date = new Date(day.date);
        if (isNaN(date.getTime())) {
          console.warn(`[PlanFromScratch] Invalid date for day ${index + 1}:`, day.date);
          return [];
        }
        const isoDate = date.toISOString();

        return day.items.map((item) => ({
          day: index + 1,
          date: isoDate,
          name: item.name || 'Untitled',
          location: item.location || 'N/A',
          time_slot: item.timeSlot || 'N/A',
          estimated_cost: Number(item.estimatedCost) || 0,
          rating: Number(item.rating) || 0,
        }));
      });

      const itinerary = {
        tripId: tripId,
        activities,
      };

      console.log('[PlanFromScratch] Sending itinerary to backend:', itinerary);

      const savedItinerary = await createItinerary(itinerary);
      console.log('[PlanFromScratch] Backend response:', savedItinerary);
      
      setSaveSuccess(true);
      toast.success('Itinerary saved successfully!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('[PlanFromScratch] Error saving itinerary:', error);
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const remainingDays = calculateRemainingDays();
  const tripDuration = startDate === endDate ? startDate : `${startDate} - ${endDate}`;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-gray-100">
        <div className="w-72 bg-gray-50 flex flex-col">
          <div className="p-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Recommended Activities
            </h2>
          </div>
          <div className="flex-1 overflow-auto">
            <Sidebar recommendations={recommendations} />
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="w-full bg-white">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Itinerary Planner</h1>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCollaboratorModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                  >
                    <Users className="w-5 h-5" />
                    <span>Add Collaborator</span>
                  </button>
                  <button
                    onClick={() => {
                      console.log('[PlanFromScratch] Save button clicked');
                      handleSaveItinerary();
                    }}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors`}
                  >
                    <Save className="w-5 h-5" />
                    <span>{isSaving ? 'Saving...' : 'Save Itinerary'}</span>
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <h2 className="text-xl">
                  Let's build an itinerary for {destination}
                </h2>
              </div>
            </div>
          </div>
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 p-8 overflow-auto">
              <div className="h-45 bg-gray-50 w-full p-4">
                <h1 className="text-4xl font-semibold mb-4 text-teal-900">
                  {title}
                </h1>
                <div className="flex gap-4">
                  <div className="flex-1 bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-600">
                      Suggested People
                    </h4>
                    <p className="mt-2 text-lg font-semibold">
                      {suggestedPeople}
                    </p>
                  </div>
                  <div className="flex-1 bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-600">
                      Overall Budget
                    </h4>
                    <p className="mt-2 text-lg font-semibold">
                      {(budget * suggestedPeople).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <br />
              <div className="mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {remainingDays > 0 && (
                    <button
                      onClick={handleAddDay}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-lg"
                    >
                      <Plus className="w-6 h-6" />
                      <span>Add Next Day</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-8">
                {days.map((day) => (
                  <ItineraryDay key={day?.id} day={day} />
                ))}
                {days.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-lg">
                    <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">
                      Click the + button to add your first day
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="w-72 bg-white">
              <div className="h-[calc(100vh-96px)] w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d83998.95410696238!2d2.276995235352685!3d48.85883773935407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e1f06e2b70f%3A0x40b82c3688c9460!2sParis%2C%20France!5e0!3m2!1sen!2sus!4v1647280332529!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add Collaborator</h2>
            <p className="text-gray-600 mb-4">
              Enter email address to add a collaborator
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const email = e.target.email.value;
                handleAddCollaborator(email);
              }}
            >
              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                required
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCollaboratorModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 p-3 rounded-lg shadow">
          Itinerary saved successfully!
        </div>
      )}
      {saveError && (
        <div className="fixed top-4 right-4 bg-red-100 text-red-800 p-3 rounded-lg shadow">
          Error: {saveError}
        </div>
      )}
    </DndContext>
  );
}

export default PlanFromScratch;