import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { ItineraryItem } from './ItineraryItem';
import { AddActivityForm } from './AddActivityForm';

export const ItineraryDay = ({ day }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(undefined);
  const { setNodeRef } = useDroppable({
    id: day.id,
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingItem(undefined);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm">
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
          items={day.items}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef} className="p-4 space-y-3 min-h-[200px] max-h-[600px] overflow-y-auto">
            {day.items.map((item) => (
              <ItineraryItem 
                key={item.id} 
                item={item} 
                dayId={day.id}
                onEdit={handleEdit}
              />
            ))}
            {day.items.length === 0 && (
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