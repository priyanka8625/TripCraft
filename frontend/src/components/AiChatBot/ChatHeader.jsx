import React from 'react';
import PropTypes from 'prop-types';

const ChatHeader = ({ user }) => {
  return (
    <div className="h-20 flex items-center px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-t-3xl text-white shadow-lg">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-14 h-14 rounded-full border-2 border-white shadow-sm"
          />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">{user.name}</h2>
          <p className="text-sm font-medium opacity-80">Your personal AI travel planner</p>
        </div>
      </div>
    </div>
  );
};

ChatHeader.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
  }).isRequired,
};

export default ChatHeader;