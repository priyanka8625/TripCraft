import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { ItineraryItem } from './ItineraryItem';
import { AddActivityForm } from './AddActivityForm';
import { useItineraryStore } from '../store/itineraryStore';

export const ItineraryDay = ({ day }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(undefined);
  const { addItem } = useItineraryStore();
  const { setNodeRef } = useDroppable({
    id: day?.id,
    data: { dayId: day?.id },
  });

  if (!day || !day?.id) {
    console.error('Invalid day object:', day);
    return <div>Error: Invalid day data</div>;
  }

  const handleEdit = (item) => {
    console.log('Editing item:', item);
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingItem(undefined);
  };

  const handleDrop = (event) => {
    const droppedItem = event.active.data.current;
    console.log('Dropped item:', droppedItem); // Debug dropped item
    if (droppedItem && event.over?.id === day.id) {
      const newItem = {
        id: `${droppedItem.id}-${Date.now()}`,
        name: droppedItem.name || droppedItem.title || 'Untitled',
        category: droppedItem.category || droppedItem.type || 'unknown',
        location: droppedItem.location || 'N/A',
        estimatedCost: droppedItem.estimatedCost || droppedItem.cost || 0,
        timeSlot: droppedItem.timeSlot || droppedItem.time || 'N/A',
        rating: droppedItem.rating || 0,
        latitude: droppedItem.latitude || null,
        longitude: droppedItem.longitude || null,
      };
      console.log('Adding item to store:', newItem); // Debug new item
      addItem(day.id, newItem);
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="p-3 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Day {day.date}</h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        </div>
        <SortableContext
          items={day.items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={setNodeRef}
            className="p-4 space-y-3 min-h-[200px] max-h-[600px] overflow-y-auto"
          >
            {day.items.length > 0 ? (
              day.items.map((item) => (
                <ItineraryItem
                  key={item.id}
                  item={item}
                  dayId={day.id}
                  onEdit={handleEdit}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                Drag items here or click Add Activity
              </div>
            )}
          </div>
        </SortableContext>
      </div>
      {showAddForm && (
        <AddActivityForm
          dayId={day.id}
          onClose={handleCloseForm}
          editItem={editingItem}
        />
      )}
    </>
  );
};