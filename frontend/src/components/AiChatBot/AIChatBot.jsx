import React, { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { PREDEFINED_QA } from "../../data/aiAssistant";

const AIChatBot = () => {
  const [chatState, setChatState] = useState({
    messages: [],
    aiState: {
      isRealTimeMode: false,
      hasCompletedPreset: false,
      firstAISelection: true,
      selectedQuestion: null,
    },
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    console.log(messagesEndRef.current);
  };

  const handleSendMessage = (content) => {
    const newUserMessage = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newUserMessage],
    }));
    handleAIResponse(content);
    scrollToBottom();
  };

  const typingSimulation = (finalContent, isSubQuestion = false) => {
    return new Promise((resolve) => {
      const typingMessage = {
        id: Date.now().toString(),
        content: '<span class="animate-pulse">Typing...</span>',
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      scrollToBottom();
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, typingMessage],
      }));
      scrollToBottom();

      setTimeout(() => {
        setChatState((prev) => {
          const newMessages = [...prev.messages];
          const typingIndex = newMessages.findIndex(
            (m) => m.id === typingMessage.id
          );
          if (typingIndex !== -1) {
            newMessages.splice(typingIndex, 1);
            newMessages.push({
              id: (Date.now() + 1).toString(),
              content: isSubQuestion
                ? `Great! Your response is "${finalContent}".`
                : finalContent,
              sender: "ai",
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            });
            scrollToBottom();
            return { ...prev, messages: newMessages };
          }
          return prev;
        });
        scrollToBottom();
        resolve();
      }, 2000);
    });
  };

  const handleQuestionClick = (
    questionIndex,
    subQuestion = null,
    subQuestionMessage = null
  ) => {
    if (questionIndex >= 0) {
      scrollToBottom(); // Scroll to bottom when question is clicked
      const qa = PREDEFINED_QA[questionIndex];
      const subQuestions = qa.subQuestions || [qa.answer];
      const subQuestionContent = subQuestions
        .map(
          (q) =>
            `<button data-sub-question="${q}" class="bg-[#f3f9ef] rounded-lg p-3 w-full text-center text-gray-800 mb-2 hover:bg-gray-200 transition-colors duration-300">${q}</button>`
        )
        .join("");
      typingSimulation(subQuestionContent).then(() => {
        setChatState((prev) => ({
          ...prev,
          aiState: {
            ...prev.aiState,
            selectedQuestion: questionIndex,
            hasCompletedPreset: true,
          },
        }));
      });
      scrollToBottom();
    } else if (questionIndex === -1 && subQuestion) {
      typingSimulation(subQuestion, true); // Scroll handled in typingSimulation
    } else if (questionIndex === -2 && subQuestionMessage) {
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, subQuestionMessage],
      }));
      scrollToBottom();
    }
  };

  const handleAIResponse = (userMessage) => {
    if (chatState.aiState.isRealTimeMode) {
      const aiMessage = {
        id: Date.now().toString(),
        content: `I understand your message: "${userMessage}". How can I assist you further?`,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      scrollToBottom();
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
      }));
      scrollToBottom();
    }
  };

  const handleFeedback = (isHelpful) => {
    const feedbackMessage = {
      id: Date.now().toString(),
      content: isHelpful
        ? "I'm glad I could help! Feel free to ask more or select another preference."
        : "Sorry to hear that! Please let me know how I can improve.",
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    scrollToBottom();
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, feedbackMessage],
      aiState: {
        ...prev.aiState,
        isRealTimeMode: !isHelpful,
        hasCompletedPreset: !isHelpful,
      },
    }));
    scrollToBottom();
  };

  useEffect(() => {
    if (chatState.aiState.firstAISelection) {
      const greeting = {
        id: Date.now().toString(),
        content:
          "Hello! I'm your Travel Itinerary Assistant. I can help you create the perfect itinerary for your dream vacation. <div class='mt-3 font-semibold text-emerald-800'>Select Your Trip Preferences</div><div class='flex flex-col space-y-2 mt-2'>",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const questionsButtons = {
        id: (Date.now() + 1).toString(),
        content:
          PREDEFINED_QA.map(
            (qa, index) =>
              `<button data-question-index="${index}" class="bg-[#f3f9ef] rounded-lg p-3 w-full text-center text-gray-800 font-[450] mb-2 hover:bg-gray-200 cursor-pointer transition-colors duration-100">${qa.question}</button>`
          ).join("") + "</div>",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [greeting, questionsButtons],
        aiState: {
          ...prev.aiState,
          firstAISelection: false,
        },
      }));
      // scrollToBottom();
    }
  }, [chatState.aiState.firstAISelection]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br emerald-50 to-emerald-100 p-4">
      <div className="w-full max-w-[60%] h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden transform transition-all duration-300 hover:shadow-3xl text-wrap">
        <ChatHeader
          user={{
            name: "Travel Itinerary Assistant",
            avatar: "./istockphoto-1957053641-612x612.jpg",
          }}
        />
        <ChatMessages
          messages={chatState.messages}
          currentUser={{ id: "user" }}
          selectedUser={{ id: "ai" }}
          onQuestionClick={handleQuestionClick}
          onFeedback={handleFeedback}
          messagesEndRef={messagesEndRef}
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          currentUser={{ id: "user" }}
        />
      </div>
    </div>
  );
};

export default AIChatBot;
