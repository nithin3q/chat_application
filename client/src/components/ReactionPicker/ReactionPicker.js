import React from 'react';
import './ReactionPicker.css';

const ReactionPicker = ({ onEmojiSelect, onClose }) => {
    const emojis = ['❤️', '😂', '😮', '😢', '😡', '👍'];

    return (
        <>
            <div className="reaction-picker-overlay" onClick={onClose}></div>
            <div className="reaction-picker">
                {emojis.map((emoji) => (
                    <button
                        key={emoji}
                        className="reaction-emoji"
                        onClick={() => {
                            onEmojiSelect(emoji);
                            onClose();
                        }}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </>
    );
};

export default ReactionPicker;
