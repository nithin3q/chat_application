import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSelector } from "react-redux";
import "./Chat.css";
import { userChats } from "../../api/ChatRequests";
import Conversation from "../../components/Conversation/Conversation";
import ChatBox from "../../components/ChatBox/ChatBox";
import { io } from "socket.io-client";

const Chat = () => {
  const user = useSelector((state) => state.authReducer.authData);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [sendMessage, setSendMessage] = useState(null);
  const [receivedMessage, setReceivedMessage] = useState(null);
  const socket = useRef();

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
    socket.current = io("ws://localhost:8800");
    socket.current.emit("new-user-add", user._id);
    socket.current.on("get-users", (users) => {
      setOnlineUsers(users);
    });
  }, [user]);
  // Send Message to socket server
  useEffect(() => {
    if (sendMessage!==null) {
      socket.current.emit("send-message", sendMessage);}
  }, [sendMessage]);

 // Get the message from socket server
 useEffect(() => {
  socket.current.on("recieve-message", (data) => {
    console.log(data)
    setReceivedMessage(data);
  }

  );
}, []);
 const checkOnlineStatus = (chat) => {
   const chatMember = chat.members.find((member) => member !== user._id);
   const online = onlineUsers.find((user) => user.userId === chatMember);
   return online? true : false
 }
 //check TypingStatus

  return (
    <div>
      <div className="Chat">
        <div className="Left-side-chat">
          <h2>Chats</h2>
          <div className="chat-list">
            {chats.map((chat) => (
              <div onClick={() => setCurrentChat(chat)}>
                <Conversation data={chat}
                 currentUser={user._id}
                 online={checkOnlineStatus(chat)} />
              </div>
            ))}
          </div>
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
