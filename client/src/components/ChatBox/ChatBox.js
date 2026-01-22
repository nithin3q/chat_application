import React, { useEffect, useRef, useState, useCallback } from "react";
import { getUser } from "../../api/UserRequest";
import defaultProfileImage from "../../images/defaultProfile.png";
import { addMessage, getMessages, addReaction, markMessagesSeen } from "../../api/MessageRequests";
import { format } from "timeago.js";
import "./ChatBox.css";
import InputEmoji from "react-input-emoji";
import TypingIndicator from "../TypingIndicator/TypingIndicator";
import ReactionPicker from "../ReactionPicker/ReactionPicker";
import "../ReactionPicker/ReactionPicker.css";
import { requestNotificationPermission, showMessageNotification, playNotificationSound } from "../../utils/notifications";

const ChatBox = ({ chat, currentUser, setSendMessage, receivedMessage, socket }) => {
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [reactionPickerPosition, setReactionPickerPosition] = useState({ x: 0, y: 0 });
  const [doubleTapHearts, setDoubleTapHearts] = useState([]);
  const [replyToMessage, setReplyToMessage] = useState(null); // Reply state
  const scroll = useRef();
  const typingTimeoutRef = useRef(null);
  const lastTapRef = useRef(null);
  const selectedMessageRef = useRef(null); // Ref to store selected message ID synchronously

  const handleChange = useCallback((newMessage) => {
    setNewMessage(newMessage);

    // Emit typing-start event
    if (chat && socket && newMessage.length > 0) {
      const receiverId = chat.members.find((id) => id !== currentUser);
      socket.emit("typing-start", {
        senderId: currentUser,
        receiverId,
        chatId: chat._id,
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to emit typing-stop after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing-stop", {
          senderId: currentUser,
          receiverId,
          chatId: chat._id,
        });
      }, 2000);
    }
  }, [chat, socket, currentUser]);

  useEffect(() => {
    if (chat) {
      const userId = chat.members?.find((id) => id !== currentUser);
      const getUserData = async () => {
        try {
          const { data } = await getUser(userId);
          setUserData(data);
        } catch (error) {
          console.log(error);
        }
      };
      getUserData();

      // Request notification permission
      requestNotificationPermission();
    }
  }, [chat, currentUser]);

  useEffect(() => {
    if (chat) {
      const fetchMessages = async () => {
        try {
          const { data } = await getMessages(chat._id);
          setMessages(data);
        } catch (error) {
          console.log(error);
        }
      };
      fetchMessages();
    }
  }, [chat]);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-scroll when typing indicator appears
  useEffect(() => {
    if (isTyping) {
      scroll.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isTyping]);

  // Mark messages as seen when chat opens or receives messages
  useEffect(() => {
    if (chat && currentUser && socket) {
      const senderId = chat.members.find((id) => id !== currentUser);

      markMessagesSeen(chat._id, currentUser)
        .then(() => {
          // Emit socket event to notify sender in real-time
          socket.emit("messages-seen", {
            chatId: chat._id,
            senderId,
            viewerId: currentUser
          });
        })
        .catch(err => {
          console.log("Error marking messages as seen:", err);
        });
    }
  }, [chat, currentUser, messages, socket]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const receiverId = chat.members.find((id) => id !== currentUser);
    const message = {
      senderId: currentUser,
      text: newMessage,
      chatId: chat._id,
      receiverId,
      replyTo: replyToMessage?._id || null,
      replyToText: replyToMessage?.text || null,
    };

    // Stop typing indicator
    if (socket) {
      socket.emit("typing-stop", {
        senderId: currentUser,
        receiverId,
        chatId: chat._id,
      });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    try {
      const { data } = await addMessage(message);
      setMessages([...messages, data]);
      setNewMessage("");
      setReplyToMessage(null); // Clear reply after sending

      // Send message via socket with the _id from database
      setSendMessage({ ...data, receiverId });
    } catch {
      console.log("error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    console.log("Message Arrived: ", receivedMessage);
    if (receivedMessage !== null && chat && receivedMessage.chatId === chat._id) {
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);

      // Show notification and play sound for received messages only when tab is not focused
      if (receivedMessage.senderId !== currentUser && userData && !document.hasFocus()) {
        showMessageNotification(
          `${userData.firstname} ${userData.lastname}`,
          receivedMessage.text
        );
        playNotificationSound();
      }
    }
  }, [receivedMessage, chat, currentUser, userData]);

  // Listen for typing events
  useEffect(() => {
    if (!socket || !chat) return;

    const handleUserTyping = (data) => {
      if (data.chatId === chat._id) {
        setIsTyping(true);
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.chatId === chat._id) {
        setIsTyping(false);
      }
    };

    socket.on("user-typing", handleUserTyping);
    socket.on("user-stopped-typing", handleUserStoppedTyping);

    return () => {
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stopped-typing", handleUserStoppedTyping);
    };
  }, [socket, chat]);

  // Listen for messages-marked-seen event
  useEffect(() => {
    if (!socket || !chat) return;

    const handleMessagesSeen = (data) => {
      if (data.chatId === chat._id) {
        // Update all own messages to seen status
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.senderId === currentUser ? { ...msg, seen: true } : msg
          )
        );
      }
    };

    socket.on("messages-marked-seen", handleMessagesSeen);

    return () => {
      socket.off("messages-marked-seen", handleMessagesSeen);
    };
  }, [socket, chat, currentUser]);

  // Handle double-tap to like
  const handleDoubleTap = async (e, message) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      e.preventDefault();

      // Add heart animation
      const rect = e.currentTarget.getBoundingClientRect();
      const heartId = Date.now();
      setDoubleTapHearts(prev => [...prev, {
        id: heartId,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }]);

      // Remove heart animation after 800ms
      setTimeout(() => {
        setDoubleTapHearts(prev => prev.filter(h => h.id !== heartId));
      }, 800);

      // Add reaction
      await handleAddReaction(message._id, '❤️');
    }
    lastTapRef.current = now;
  };

  // Handle long press to show reaction picker
  const handleLongPress = (e, message) => {
    e.preventDefault();

    // Check if currentTarget exists
    if (!e.currentTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setReactionPickerPosition({
      x: rect.left,
      y: rect.top - 60 // Position above the message
    });
    selectedMessageRef.current = message._id; // Store synchronously
    setSelectedMessageId(message._id);
    setShowReactionPicker(true);
  };

  // Add reaction to message
  const handleAddReaction = async (messageId, emoji) => {
    // Validate messageId exists
    if (!messageId || messageId === 'undefined') {
      console.error("Invalid messageId:", messageId);
      return;
    }

    try {
      const { data } = await addReaction(messageId, {
        userId: currentUser,
        emoji
      });

      // Update local messages state
      setMessages(messages.map(msg =>
        msg._id === messageId ? data : msg
      ));

      // Emit socket event for real-time update
      if (socket) {
        const receiverId = chat.members.find((id) => id !== currentUser);
        console.log("Emitting reaction-added socket event:", {
          messageId,
          reaction: { userId: currentUser, emoji },
          receiverId
        });
        socket.emit("reaction-added", {
          messageId,
          reaction: { userId: currentUser, emoji },
          receiverId
        });
      } else {
        console.log("Socket not available!");
      }
    } catch (error) {
      console.log("Error adding reaction:", error);
    }
  };

  // Listen for reaction updates from socket
  useEffect(() => {
    if (!socket) return;

    const handleReactionUpdate = (data) => {
      console.log("reaction-updated event received:", data);
      setMessages(prevMessages => {
        const updated = prevMessages.map(msg => {
          if (msg._id === data.messageId) {
            console.log("Updating message reactions:", msg._id, data.reactions);
            return { ...msg, reactions: data.reactions };
          }
          return msg;
        });
        return updated;
      });
    };

    socket.on("reaction-updated", handleReactionUpdate);

    return () => {
      socket.off("reaction-updated", handleReactionUpdate);
    };
  }, [socket]);

  return (
    <div className="ChatBox-container">
      {chat ? (
        <>
          <div className="chat-header">
            <div className="follower">
              <div>
                <img
                  src={defaultProfileImage}
                  alt="profile"
                  className="followerImage"
                  style={{ width: "50px", height: "50px" }}
                />
                <div className="name" style={{ fontSize: "0.8rem" }}>
                  <span>
                    {userData?.firstname} {userData?.lastname}
                  </span>
                </div>
              </div>
            </div>
            <hr style={{ width: "85%", border: "0.1px solid #ececec" }} />
          </div>
          <div className="chat-body">
            {messages.map((message, index) => (
              <div
                key={index}
                ref={scroll}
                className={message.senderId === currentUser ? "message-wrapper own-wrapper" : "message-wrapper opp-wrapper"}
              >
                <div
                  className={message.senderId === currentUser ? "message own" : "message opp"}
                  onClick={(e) => {
                    const now = Date.now();
                    const DOUBLE_TAP_DELAY = 300;

                    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
                      // Double tap - add ❤️ reaction
                      handleDoubleTap(e, message);
                    } else {
                      // Single click - set as reply for ALL messages
                      setReplyToMessage(message);
                    }
                    lastTapRef.current = now;
                  }}
                  onContextMenu={(e) => handleLongPress(e, message)}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    const longPressTimer = setTimeout(() => {
                      handleLongPress(e, message);
                    }, 500);
                    e.currentTarget.dataset.longPressTimer = longPressTimer;
                  }}
                  onTouchEnd={(e) => {
                    clearTimeout(e.currentTarget.dataset.longPressTimer);
                  }}
                >
                  {/* Display replied message */}
                  {message.replyToText && (
                    <div className="message-reply-quote">
                      ↩ {message.replyToText}
                    </div>
                  )}

                  <span>{message.text}</span>
                  <span className="message-time">
                    {format(message.createdAt)}
                    {message.senderId === currentUser && (
                      <span className={`seen-indicator ${message.seen ? 'seen' : ''}`}>
                        {message.seen ? ' ✓✓' : ' ✓'}
                      </span>
                    )}
                  </span>
                </div>

                {/* Display reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="message-reactions">
                    {Object.entries(
                      message.reactions.reduce((acc, r) => {
                        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([emoji, count]) => {
                      const hasUserReacted = message.reactions.some(
                        r => r.userId === currentUser && r.emoji === emoji
                      );
                      return (
                        <div
                          key={emoji}
                          className={`reaction-pill ${hasUserReacted ? 'own-reaction' : ''}`}
                          onClick={() => handleAddReaction(message._id, emoji)}
                        >
                          <span className="reaction-emoji-display">{emoji}</span>
                          {count > 1 && <span className="reaction-count">{count}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            {/* Typing Indicator - absolute positioned inside chat-body */}
            {isTyping && <TypingIndicator userName={userData?.firstname} />}
          </div>

          {/* Reply Preview */}
          {replyToMessage && (
            <div className="reply-preview">
              <div className="reply-preview-content">
                <div className="reply-preview-label">Replying to</div>
                <div className="reply-preview-text">{replyToMessage.text}</div>
              </div>
              <button
                className="reply-preview-close"
                onClick={() => setReplyToMessage(null)}
              >
                ×
              </button>
            </div>
          )}

          <div className="chat-sender">
            <div>+</div>
            <InputEmoji
              value={newMessage}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
            <div className="send-button button" onClick={handleSend}>Send</div>
          </div>
        </>
      ) : (
        <span className="chatbox-empty-message">Tap on a user to start chatting</span>
      )}

      {/* Reaction Picker */}
      {showReactionPicker && (
        <div
          style={{
            position: 'fixed',
            left: `${reactionPickerPosition.x}px`,
            top: `${reactionPickerPosition.y}px`,
          }}
        >
          <ReactionPicker
            onEmojiSelect={(emoji) => {
              const msgId = selectedMessageRef.current;
              console.log("ReactionPicker - msgId from ref:", msgId);
              handleAddReaction(msgId, emoji);
              setShowReactionPicker(false);
            }}
            onClose={() => setShowReactionPicker(false)}
          />
        </div>
      )}

      {/* Double-tap heart animations */}
      {doubleTapHearts.map(heart => (
        <div
          key={heart.id}
          className="double-tap-heart"
          style={{
            left: `${heart.x}px`,
            top: `${heart.y}px`,
            position: 'fixed'
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
};

export default ChatBox;

