import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, PencilRuler } from 'lucide-react';

function PlanMethodSelection() {
  const navigate = useNavigate();

  const handleOptionClick = (option) => {
    navigate(`/dashboard/plan/${option}`);
  };

  return (
    <div className="flex-1 h-full flex items-start justify-center box-border pt-12 px-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center text-emerald-900 mb-4">
          Plan Your Perfect Trip
        </h1>
        <p className="text-center text-emerald-700 mb-12 text-lg">
          Choose how you'd like to create your itinerary
        </p>

        <div className="grid md:grid-cols-2 gap-8 px-4">
          <button
            onClick={() => handleOptionClick('ai')}
            className="group relative rounded-2xl p-8 transition-all duration-300 border backdrop-blur-sm bg-white/30 border-white/20 hover:scale-105 hover:shadow-[0_8px_30px_rgb(16,185,129,0.2)] hover:bg-emerald-50/30 shadow-[0_8px_30px_rgb(0,0,0,0.1)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="w-16 h-16 bg-emerald-100/50 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-100/70 transition-colors duration-300">
                <Sparkles className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-semibold text-emerald-900 mb-4">
                Plan with AI
              </h2>
              <p className="text-emerald-700/90 mb-4">
                Let our AI assistant help you create the perfect itinerary based on your preferences and requirements.
              </p>
              <div className="text-emerald-600 font-medium flex items-center gap-2">
                Get started 
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleOptionClick('manual')}
            className="group relative rounded-2xl p-8 transition-all duration-300 border backdrop-blur-sm bg-white/30 border-white/20 hover:scale-105 hover:shadow-[0_8px_30px_rgb(16,185,129,0.2)] hover:bg-emerald-50/30 shadow-[0_8px_30px_rgb(0,0,0,0.1)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="w-16 h-16 bg-emerald-100/50 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-100/70 transition-colors duration-300">
                <PencilRuler className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-semibold text-emerald-900 mb-4">
                Plan from Scratch
              </h2>
              <p className="text-emerald-700/90 mb-4">
                Create your own custom itinerary with complete control over every detail of your journey.
              </p>
              <div className="text-emerald-600 font-medium flex items-center gap-2">
                Get started 
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlanMethodSelection;
