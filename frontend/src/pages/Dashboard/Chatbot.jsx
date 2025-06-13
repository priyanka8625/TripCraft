import React, { useState, useRef, useEffect } from 'react';
import Header from '../../components/Chatbot/Header.jsx';
import ChatBubble from '../../components/Chatbot/ChatBubble.jsx';
import InputBox from '../../components/Chatbot/InputBox.jsx';
import { fetchGeminiResponse } from '../../services/geminiAPI.js';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (showWelcome) {
      setShowWelcome(false);
    }

    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      text: inputValue,
      avatar: "https://via.placeholder.com/40?text=U",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const botResponseText = await fetchGeminiResponse(inputValue, messages);
      const botResponse = {
        id: messages.length + 2,
        sender: "tripcraftBot",
        text: botResponseText,
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
      const errorResponse = {
        id: messages.length + 2,
        sender: "tripcraftBot",
        text: "Oops, looks like we hit a roadblock! 🗺️ Let’s try again in a bit, or ask me something else about your trip!",
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 font-poppins text-emerald-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-300/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pt-30 pb-32 relative z-10">
        {showWelcome && (
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-700/10 backdrop-blur-xl border border-emerald-300/20 px-8 py-6 rounded-3xl shadow-xl text-center max-w-md">
              <div className="text-6xl mb-4 animate-wave">👋</div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
                Welcome to TripCraft!
              </h2>
              <p className="text-emerald-700 text-sm">
                Namaste travelers! 🙏 I’m your TripCraft assistant, here to help you plan the perfect trip. Want to find amazing destinations, plan your budget, or get travel tips? Let’s make your journey unforgettable—where are we going today? ✈️
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {isTyping && <ChatBubble isTyping={true} />}
        </div>

        <div ref={chatEndRef} />
      </div>

      <InputBox
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSendMessage={handleSendMessage}
        handleKeyPress={handleKeyPress}
      />
    </div>
  );
}

export default Chatbot;