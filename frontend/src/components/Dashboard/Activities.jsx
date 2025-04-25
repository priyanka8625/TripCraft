import React, { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';

const Activities = ({ activities = [] }) => {

  return (
    <div className="col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Your Activities</h2>
        <a href="#" className="text-emerald-600 hover:text-emerald-700 cursor-pointer">
          View All
        </a>
      </div>
      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm overflow-hidden flex hover:shadow-md transition-shadow duration-200 cursor-pointer"
          >
            <img 
              src={activity?.images[0] || 'https://via.placeholder.com/192x128'} 
              alt={activity?.title || 'Activity'} 
              className="w-48 h-32 object-cover"
            />
            <div className="p-4 flex-1">
              <h3 className="font-semibold text-gray-800">{activity?.title || 'Untitled Post'}</h3>
              <p className="text-gray-600 mt-1">{activity?.caption || 'No caption available'}</p>
              <div className="flex items-center mt-3 space-x-4">
                <button
                  className={`flex items-center cursor-pointer 'text-gray-600'`}
                  
                >
                  <Heart 
                    className="h-4 w-4 mr-1" 
                    fill="none"
                  />
                  <span>{(activity?.likes || 0)}</span>
                </button>
                <div className="flex items-center text-gray-600 cursor-pointer">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span>{activity?.comments?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Activities;