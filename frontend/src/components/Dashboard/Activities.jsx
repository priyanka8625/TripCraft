import React, { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';

const Activities = ({ activities = [] }) => {
  const [likedPosts, setLikedPosts] = useState(new Set());

  const handleLike = (index) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

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
              src={activity?.image || 'https://via.placeholder.com/192x128'} 
              alt={activity?.title || 'Activity'} 
              className="w-48 h-32 object-cover"
            />
            <div className="p-4 flex-1">
              <h3 className="font-semibold text-gray-800">{activity?.title || 'Untitled Activity'}</h3>
              <p className="text-gray-600 mt-1">{activity?.description || 'No description available'}</p>
              <div className="flex items-center mt-3 space-x-4">
                <button
                  className={`flex items-center cursor-pointer ${likedPosts.has(index) ? 'text-red-500' : 'text-gray-600'}`}
                  onClick={() => handleLike(index)}
                >
                  <Heart 
                    className="h-4 w-4 mr-1" 
                    fill={likedPosts.has(index) ? "currentColor" : "none"} 
                  />
                  <span>{likedPosts.has(index) ? (activity?.likes || 0) + 1 : (activity?.likes || 0)}</span>
                </button>
                <div className="flex items-center text-gray-600 cursor-pointer">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span>{activity?.comments || 0}</span>
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