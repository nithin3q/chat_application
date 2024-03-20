import React, { useEffect, useRef, useState } from "react";
import { getUser } from "../../api/UserRequest";
import defaultProfileImage from "../../images/defaultProfile.png";
import { addMessage, getMessages } from "../../api/MessageRequests";
import {format} from "timeago.js"
import "./ChatBox.css"
import InputEmoji from "react-input-emoji";

const ChatBox = ({ chat, currentUser,setSendMessage,receivedMessage }) => {
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scroll = useRef()
  const handleChange = (newMessage)=> {
    setNewMessage(newMessage)
  }


 // fetching data for header
 useEffect(() => {
  const userId = chat?.members?.find((id) => id !== currentUser);
  const getUserData = async () => {
    try {
      const { data } = await getUser(userId);
      setUserData(data);
    } catch (error) {
      console.log(error);
    }
  };

  if (chat !== null) getUserData();
}, [chat, currentUser]);

  
// fetch messages
useEffect(() => {
  const fetchMessages = async () => {
    try {
      const { data } = await getMessages(chat._id);
      setMessages(data);
    } catch (error) {
      console.log(error);
    }
  };

  if (chat !== null) fetchMessages();
}, [chat]);

//scroll
  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  },[messages])
  
  // Send Message
  const handleSend = async(e)=> {
    e.preventDefault()
    const message = {
      senderId : currentUser,
      text: newMessage,
      chatId: chat._id,
  }
  const receiverId = chat.members.find((id)=>id!==currentUser);
  // send message to socket server
  setSendMessage({...message, receiverId})
  // send message to database
  try {
    const { data } = await addMessage(message);
    setMessages([...messages, data]);
    setNewMessage("");
  }
  catch
  {
    console.log("error")
  }
}
// Receive Message from parent component
useEffect(()=> {
  console.log("Message Arrived: ", receivedMessage)
  if (receivedMessage !== null && receivedMessage.chatId === chat._id) {
    setMessages([...messages, receivedMessage]);
  }

},[receivedMessage])

 // Typing indicator
 
  return (
    <div className="ChatBox-container">
      {chat?(
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
                {/* // typing */}
                {isTyping && <span>typing...</span>}
              </div>
            </div>
          </div>
          <hr style={{ width: "85%", border: "0.1px solid #ececec" }} />
        </div>
        {/* chatbox */}
        <div className="chat-body">
          {messages.map((message) => (
            <>
              <div ref={scroll}
                className={
                  message.senderId === currentUser ? "message own" : "message opp"
                }
              >
            <span>{message.text}</span>
            <span>{format(message.createdAt)}</span>
              </div>
            </>
          ))}
        </div>
        {/* sender */}
         <div className="chat-sender">
          <div>+</div>
            <InputEmoji value={newMessage} onChange={handleChange} />
            <div className="send-button button" onClick={handleSend}>Send</div>
         </div>
      </>
      ):(<span className="chatbox-empty-message">
        Tap on an user to start chatting
      </span>)} 
      
    </div>
  );
};

export default ChatBox;
