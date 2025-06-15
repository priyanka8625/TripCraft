import { create } from 'zustand';

export const useItineraryStore = create((set, get) => ({
  tripId: undefined, // Initial state
  days: [],
  collaborators: [],
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
  budget: 0,
  suggestedPeople: 1,
  
  addDay: (date) =>
    set((state) => ({
      days: [
        ...state.days,
        {
          id: crypto.randomUUID(),
          date,
          items: [],
        },
      ],
    })),
    
  addItem: (dayId, item) =>
    set((state) => {
      console.log('addItem - dayId:', dayId, 'item:', item);
      const newState = {
        days: state.days.map((day) =>
          day.id === dayId
            ? { ...day, items: [...day.items, item] }
            : day
        ),
      };
      console.log('addItem - new state:', newState);
      return newState;
    }),
    
  updateItem: (dayId, updatedItem) =>
    set((state) => ({
      days: state.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              items: day.items.map((item) =>
                item.id === updatedItem.id ? updatedItem : item
              ),
            }
          : day
      ),
    })),
    
  removeItem: (dayId, itemId) =>
    set((state) => ({
      days: state.days.map((day) =>
        day.id === dayId
          ? { ...day, items: day.items.filter((item) => item.id !== itemId) }
          : day
      ),
    })),
    
  reorderItems: (dayId, items) =>
    set((state) => ({
      days: state.days.map((day) =>
        day.id === dayId
          ? { ...day, items }
          : day
      ),
    })),
    
  addCollaborator: (email) =>
    set((state) => ({
      collaborators: [...state.collaborators, email],
    })),
    
    setTripId: (id) => set({ tripId: id }), // Add setter
    
  setCollaborators: (collaborators) =>
    set(() => ({
      collaborators,
    })),
    
  setTitle: (title) =>
    set(() => ({
      title,
    })),
    
  setDestination: (destination) =>
    set(() => ({
      destination,
    })),
    
  setDates: (startDate, endDate) =>
    set(() => ({
      startDate,
      endDate,
    })),
    
  setBudget: (budget) =>
    set(() => ({
      budget,
    })),
    
  setSuggestedPeople: (suggestedPeople) =>
    set(() => ({
      suggestedPeople,
    })),
    
  setDays: (newDays) => set({ days: newDays }),
  
  getState: () => get(),
}));