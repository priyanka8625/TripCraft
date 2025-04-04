import React from 'react';
import { Compass } from 'lucide-react';

const Logo = () => {
  return (
    <div className="p-6 flex items-center gap-2">
      <div className="bg-emerald-600 p-2 rounded-lg">
        <Compass className="h-6 w-6 text-white" />
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
        TripCraft
      </span>
    </div>
  );
};

export default Logo;