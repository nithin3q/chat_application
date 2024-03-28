import React from "react";

const Typing = ({ isTyping }) => {
  return (
    <div className="typing">
      {isTyping && (
        <div className="typing-indicator">
       typing
        </div>
      )}
    </div>
  );
};

export default Typing;
