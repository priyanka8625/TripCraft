import React, { useState, useEffect } from 'react';
import { Plane, MapPin, CalendarDays, Coffee } from 'lucide-react';

const LoadingScreen = ({ onComplete, loadingTime = 3000 }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const loadingMessages = [
    "Finding the best local spots for you...",
    "Curating the perfect experiences...",
    "Checking the weather for your trip...",
    "Discovering hidden gems in your destination...",
    "Matching activities to your preferences...",
    "Planning a journey you'll never forget...",
    "Calculating optimal routes for exploration...",
    "Securing the best recommendations just for you..."
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, loadingTime);

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => 
        (prev + 1) % loadingMessages.length
      );
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(messageInterval);
    };
  }, [loadingTime, onComplete]);

  const renderIcon = () => {
    const icons = [
      <Plane className="text-emerald-600 w-12 h-12" />,
      <MapPin className="text-emerald-600 w-12 h-12" />,
      <CalendarDays className="text-emerald-600 w-12 h-12" />,
      <Coffee className="text-emerald-600 w-12 h-12" />
    ];
    return icons[currentMessageIndex % icons.length];
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="relative p-4">
            <div className="animate-bounce">
              {renderIcon()}
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-emerald-800 text-center mb-2">
          Crafting Your Perfect Itinerary
        </h2>
        
        <div className="h-16 flex items-center justify-center">
          <p
            key={currentMessageIndex}
            className="text-emerald-700 text-center animate-fadeIn"
          >
            {loadingMessages[currentMessageIndex]}
          </p>
        </div>
        
        <div className="mt-6 bg-emerald-100 rounded-lg p-3">
          <p className="text-emerald-800 text-sm text-center">
            This usually takes less than a minute. Thanks for your patience!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
