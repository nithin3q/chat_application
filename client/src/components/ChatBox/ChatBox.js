import React, { useEffect, useRef, useState } from "react";
import { getUser } from "../../api/UserRequest";
import defaultProfileImage from "../../images/defaultProfile.png";
import { addMessage, getMessages } from "../../api/MessageRequests";
import { format } from "timeago.js";
import "./ChatBox.css";
import InputEmoji from "react-input-emoji";
import Typing from "./Typing";

const ChatBox = ({ chat, currentUser, setSendMessage, receivedMessage, socket }) => {
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false); // State to track if the user is typing
  const scroll = useRef();

  const handleChange = (newMessage) => {
    setNewMessage(newMessage);
    // Set typing state to true when user starts typing
    setIsTyping(true);
  };

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

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const receiverId = chat.members.find((id) => id !== currentUser);
    const message = {
      senderId: currentUser,
      text: newMessage,
      chatId: chat._id,
      receiverId,
    };
    setSendMessage({ ...message, receiverId });
    try {
      const { data } = await addMessage(message);
      setMessages([...messages, data]);
      setNewMessage("");
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
    }
  }, [receivedMessage, chat]);

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
              <div key={index} ref={scroll} className={message.senderId === currentUser ? "message own" : "message opp"}>
                <span>{message.text}</span>
                <span>{format(message.createdAt)}</span>
              </div>
            ))}
          </div>
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
    </div>
  );
};

export default ChatBox;
