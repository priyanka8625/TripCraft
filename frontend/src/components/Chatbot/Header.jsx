import React from 'react';
import { Circle, Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <div className="backdrop-blur-xl bg-white/80 border-b border-emerald-100/50 shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src="./assets/img/rohit.jpg"
                alt="Rohit Sir Avatar"
                className="w-12 h-12 rounded-full object-cover shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <Circle className="w-2 h-2 text-white fill-current" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                Rohit Negi
              </h1>
              <div className="flex items-center space-x-2 text-sm text-emerald-600">
                <Circle className="w-2 h-2 text-emerald-500 fill-current" />
                <span>Online • Founder, Coder Army</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <span className="text-2xl">🚀</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;