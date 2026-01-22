const [loading, setLoading] = useState(false);
const [conversations, setConversations] = useState([]);

useEffect(() => {
  const getConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setConversations(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  getConversations();
}, []);



import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSelector } from "react-redux";
import "./Chat.css";
import { userChats, createChat } from "../../api/ChatRequests"; // Import createChat function
import { getAllUser } from "../../api/UserRequest";

import Conversation from "../../components/Conversation/Conversation";
import ChatBox from "../../components/ChatBox/ChatBox";
import { io } from "socket.io-client";
import { logout } from "../../actions/AuthActions.js";
import { useDispatch } from 'react-redux'

const Chat = () => {
  const user = useSelector((state) => state.authReducer.authData);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [sendMessage, setSendMessage] = useState(null);
  const [receivedMessage, setReceivedMessage] = useState(null);
  const socket = useRef();
  const dispatch = useDispatch()

  // Function to create a new chat
  const handleCreateChat = async () => {
    try {
      const newChatData = {
        members: [user._id], // Include the current user in the chat
        // Add more properties as needed
      };
      const response = await createChat(newChatData);
      // If the chat is created successfully, update the state with the new chat
      setChats([...chats, response.data]);
    } catch (error) {
      console.log(error);
    }
  };

  // Get the chat in chat section
  useEffect(() => {
    const getChats = async () => {
      try {
        const { data } = await userChats(user._id);
        setChats(data);
      } catch (error) {
        console.log(error);
      }
    };
    getChats();
  }, [user._id]);

  // Connect to Socket.io
  useEffect(() => {
    socket.current = io("ws://chat-application-qd00.onrender.com");
    socket.current.emit("new-user-add", user._id);
    socket.current.on("get-users", (users) => {
      setOnlineUsers(users);
    });
  }, [user]);

  // Send Message to socket server
  useEffect(() => {
    if (sendMessage !== null) {
      socket.current.emit("send-message", sendMessage);
    }
  }, [sendMessage]);

  // Get the message from socket server
  useEffect(() => {
    socket.current.on("recieve-message", (data) => {
      console.log(data)
      setReceivedMessage(data);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dispatch the logout action
    dispatch(logout());
  };

  const checkOnlineStatus = (chat) => {
    const chatMember = chat.members.find((member) => member !== user._id);
    const online = onlineUsers.find((user) => user.userId === chatMember);
    return online ? true : false;
  };

  return (
    <div>
      <div className="Chat">
        <div className="Left-side-chat">
          <h2>Chats</h2>
          <div className="chat-list">
            {chats.map((chat) => (
              <div key={chat._id} onClick={() => setCurrentChat(chat)}>
                <Conversation
                  data={chat}
                  currentUser={user._id}
                  online={checkOnlineStatus(chat)}
                />
              </div>
            ))}
          </div>
          <hr style={{ width: "85%", border: "0.1px solid #ececec" }} />
          <div className="logOut-button" onClick={handleSubmit}>log out</div>
          <div className="createChat-button" onClick={handleCreateChat}>Create Chat</div>
        </div>
        <div className="Right-side-chat">
          <h2>Chat Box</h2>
          <ChatBox
            chat={currentChat}
            currentUser={user._id}
            setSendMessage={setSendMessage}
            receivedMessage={receivedMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
