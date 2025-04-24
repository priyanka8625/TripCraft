import React, { useState } from "react";
import PropTypes from "prop-types";
import { Send } from "lucide-react";

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="bg-white rounded-b-3xl p-4 shadow-inner">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell me your dream destination..."
          className="flex-1 px-4 py-3 bg-gray-100 text-gray-800 rounded-full focus:outline-none focus:bg-gray-200 transition-colors duration-300 text-base"
        />
        <button
          type="submit"
          className="bg-emerald-500 text-white rounded-full p-3 hover:bg-emerald-700 transition-colors duration-100 flex items-center justify-center"
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

ChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
};

export default ChatInput;
