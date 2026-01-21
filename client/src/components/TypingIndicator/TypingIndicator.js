import React from 'react';
import './TypingIndicator.css';

const TypingIndicator = ({ userName }) => {
    return (
        <div className="typing-indicator-container">
            <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
            </div>
            {userName && <span className="typing-text">{userName} is typing...</span>}
        </div>
    );
};

export default TypingIndicator;
