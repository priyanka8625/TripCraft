import React from 'react';
import { Send, Mic } from 'lucide-react';

const InputBox = ({ inputValue, setInputValue, handleSendMessage, handleKeyPress }) => {
  return (
    <div className="fixed bottom-0 z-20 backdrop-blur-xl bg-white/80 border-t border-emerald-100/50 shadow-2xl w-full">
      <div className="ml-[200px] max-w-4xl px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Hey, suggest some cool travel spots for a weekend getaway! ✈️"
              className="w-full px-5 py-4 bg-white/90 backdrop-blur-xl border border-emerald-200/50 rounded-full text-emerald-900 placeholder-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400/50 transition-all duration-300 shadow-lg"
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-700 backdrop-blur-xl rounded-full text-white hover:from-emerald-600 hover:to-emerald-800 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 shadow-xl"
          >
            <Send size={20} />
          </button>
          <button
            className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 backdrop-blur-xl rounded-full text-white hover:from-emerald-500 hover:to-emerald-700 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 shadow-xl"
          >
            <Mic size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBox;