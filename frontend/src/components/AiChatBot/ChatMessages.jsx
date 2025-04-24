import React from "react";
import PropTypes from "prop-types";

const ChatMessages = ({
  messages,
  currentUser,
  selectedUser,
  onQuestionClick,
  onFeedback,
  messagesEndRef,
}) => {
  const handleClick = (e) => {
    const questionIndex = e.target.getAttribute("data-question-index");
    if (questionIndex !== null) {
      onQuestionClick(parseInt(questionIndex, 10));
      return; // Exit after handling question click
    }
    const feedback = e.target.getAttribute("data-feedback");
    if (feedback) {
      onFeedback(feedback === "yes");
    }
    const subQuestion = e.target.getAttribute("data-sub-question");
    if (subQuestion) {
      onQuestionClick(-1, subQuestion); // Trigger typing animation with sub-question
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white" onClick={handleClick}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-2 rounded-lg border border-gray-200 m-2 overflow-hidden break-words ${
            message.sender === currentUser.id
              ? "bg-[#f3f9ee] text-gray-800 ml-auto w-fit max-w-[50%]"
              : "bg-[#f3f9ef] text-gray-800"
          } max-w-[50%] ${message.sender === selectedUser.id ? "mr-auto" : "ml-auto"}`}
          dangerouslySetInnerHTML={{ __html: message.content }}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {/* {message.content} */}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

ChatMessages.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      sender: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
    })
  ).isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  selectedUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
  onQuestionClick: PropTypes.func.isRequired,
  onFeedback: PropTypes.func.isRequired,
  messagesEndRef: PropTypes.object.isRequired,
};

export default ChatMessages;
