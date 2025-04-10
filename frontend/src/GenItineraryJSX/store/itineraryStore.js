import { create } from 'zustand';

export const useItineraryStore = create((set) => ({
  days: [],
  collaborators: [],
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
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
    set((state) => ({
      days: state.days.map((day) =>
        day.id === dayId
          ? { ...day, items: [...day.items, item] }
          : day
      ),
    })),
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
  addCollaborator: (safariId) =>
    set((state) => ({
      collaborators: [...state.collaborators, safariId],
    })),
  setTitle: (title) =>
    set(() => ({
      title
    })),
  setDestination: (destination) =>
    set(() => ({
      destination
    })),
  setDates: (startDate, endDate) =>
    set(() => ({
      startDate,
      endDate
    })),
}));
