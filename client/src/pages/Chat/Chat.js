import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSelector } from "react-redux";
import "./Chat.css";
// import { userChats } from "../../api/ChatRequests";
import Conversation from "../../components/Conversation/Conversation";
import ChatBox from "../../components/ChatBox/ChatBox";
import { io } from "socket.io-client";
import { logout } from "../../actions/AuthActions.js";
import { useDispatch } from 'react-redux'
import { getAllUser } from "../../api/UserRequest.js";
import defaultProfileImage from "../../images/defaultProfile.png";
import { createChat } from '../../api/ChatRequests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'

const Chat = () => {
  const user = useSelector((state) => state.authReducer.authData);
  const [users, setUsers] = useState([]);
  // const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [sendMessage, setSendMessage] = useState(null); // Define sendMessage state here
  const [receivedMessage, setReceivedMessage] = useState(null);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false); // State to manage modal visibility
  const [showSidebar, setShowSidebar] = useState(true); // State to manage sidebar visibility on mobile
  const socket = useRef();
  const dispatch = useDispatch();
  const modalRef = useRef();



  // Get the chat in chat section
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const { data } = await userChats(user._id);
  //       // setChats(data);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   fetchData();
  // }, [user._id]);

  // Get all users
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const { data } = await getAllUser();
        const filteredUsers = data.filter((u) => u._id !== user._id);
        setUsers(filteredUsers);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllUsers();
  }, [user._id]);

  const handleSend = async (e, receiver) => {
    e.preventDefault();
    if (receiver._id === user._id) {
      console.log("Cannot start a chat with yourself");
      return;
    }
    const chat = {
      senderId: user._id,
      receiverId: receiver._id
    };
    try {
      const { data } = await createChat(chat);
      setCurrentChat(data);
      setShowSidebar(false); // Hide sidebar on mobile when chat is selected
    } catch (error) {
      console.log("Error creating chat: ", error);
    }
  };

  // Connect to Socket.io
  useEffect(() => {
    socket.current = io("wss://chat-application-qd00.onrender.com/");
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
      console.log(data);
      setReceivedMessage(data);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dispatch the logout action
    dispatch(logout());
  };

  const checkOnlineStatus = (user) => {
    const userMemberId = user._id;
    const online = onlineUsers.some((user) => user.userId === userMemberId);
    return online;
  };

  const handleUserInfoClick = () => {
    setShowUserInfoModal(true);
  };

  const handleCloseUserInfoModal = () => {
    setShowUserInfoModal(false);
  };

  // Close modal when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowUserInfoModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <div>
      <div className="Chat">
        <div className={`Left-side-chat ${showSidebar ? 'show-sidebar' : 'hide-sidebar'}`}>
          <h2>Chats</h2>

          <div className="chat-list">
            {users.map((user) => (
              <div key={user._id} onClick={(e) => handleSend(e, user)}>
                <Conversation
                  data={user}
                  currentUser={user._id}
                  online={checkOnlineStatus(user)}
                />
              </div>
            ))}
          </div>
          <hr style={{ width: "85%", border: "0.1px solid #ececec" }} />
          <div className="logOut-button" onClick={handleSubmit}>log out</div>
        </div>
        <div className={`Right-side-chat ${!showSidebar ? 'show-chat' : 'hide-chat'}`}>
          <div className="chat-headers">
            <div className="chat-header-left">
              {currentChat && (
                <button className="back-button" onClick={() => setShowSidebar(true)}>
                  <span className="back-arrow">←</span>
                </button>
              )}
              <h2>Chat Box</h2>
            </div>
            <div className="user-info" onClick={handleUserInfoClick}>
              <img
                src={defaultProfileImage}
                alt="profile"
                className="followerImage"
                style={{ width: "20px", height: "20px" }}
              />
              <span>{user.firstname}</span>
              <FontAwesomeIcon icon={showUserInfoModal ? faAngleUp : faAngleDown} />
            </div>
          </div>
          <ChatBox
            chat={currentChat}
            currentUser={user._id}
            setSendMessage={setSendMessage}
            receivedMessage={receivedMessage}
            socket={socket.current}
            sendMessage={sendMessage}
          />
        </div>
      </div>

      {/* User Info Modal */}
      {showUserInfoModal && (
        <div className="user-info-modal" ref={modalRef}>
          <div className="modal-content">
            <div className="modal-header">
              <h5>User Information</h5>
              <button onClick={handleCloseUserInfoModal}>Close</button>
            </div>
            <div className="modal-body">
              <img
                src={defaultProfileImage}
                alt="profile"
                className="followerImage"
                style={{ width: "50px", height: "50px" }}
              />
              <div className="user_infos">
                <p>Name: {user.firstname}</p>
                <p>Email: {user.username}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleSubmit}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
