import React from 'react';
import { User, MapPin } from 'lucide-react';

const ChatBubble = ({ message, isTyping }) => {
  if (isTyping) {
    return (
      <div className="flex items-start space-x-3 mt-6 animate-slide-in-left">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div className="bg-gradient-to-br from-emerald-500/90 to-emerald-700/90 backdrop-blur-xl border border-emerald-300/30 px-5 py-4 rounded-2xl rounded-tl-md shadow-xl">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start space-x-3 animate-slide-in-left ${
        message.sender === 'user' ? 'flex-row-reverse space-x-reverse animate-slide-in-right' : ''
      }`}
    >
      <div className="flex-shrink-0 relative">
        {message.sender === 'tripcraftBot' ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
            <MapPin className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      <div
        className={`max-w-md px-5 py-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
          message.sender === 'tripcraftBot'
            ? 'bg-gradient-to-br from-emerald-500/90 to-emerald-700/90 border-emerald-300/30 text-white rounded-tl-md shadow-xl'
            : 'bg-white/90 border-emerald-200/50 text-emerald-900 rounded-tr-md shadow-lg'
        }`}
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div
          className="text-sm leading-relaxed formatted-message"
          dangerouslySetInnerHTML={{ __html: message.text }}
        />
        <style jsx>{`
          .formatted-message ul {
            list-style-type: disc;
            margin-left: 20px;
            margin-top: 8px;
            margin-bottom: 8px;
          }
          .formatted-message li {
            margin-bottom: 4px;
          }
          .formatted-message strong {
            font-weight: 600;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ChatBubble;