import React, { useEffect, useState } from "react";
import { getUser } from "../../api/UserRequest";
import defaultProfileImage from "../../images/defaultProfile.png";
import { logout } from "../../actions/AuthActions.js";
import {useDispatch, useSelector} from 'react-redux'


const Conversation = ({ data, currentUser,online }) => {
  const [userData, setUserData] = useState(null);
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.authReducer.authData);

  useEffect(() => {
    const userId = data.members.find((id) => id !== currentUser);
    // console.log(userId)
    const getUserData = async () => {
      const { data } = await getUser(userId);
      setUserData(data);
      // console.log(data);
    };
    getUserData();
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    // Dispatch the logout action
    dispatch(logout());
  };
  return (
    <>
    <div className="follower conversation">
      <div>
       {online ? <div className="online-dot"></div> : <div className="offline-dot"></div>}
        <img
          src={defaultProfileImage}
          alt="profile"
          className="followerImage"
          style={{ width: "50px", height: "50px" }}
        />
        <div className="name" style={{ fontSize: "0.8rem" }}>
          <span>{userData?.firstname} {userData?.lastname}</span>
          <span>{online? "Online" : "offline"}</span>
        </div>
        </div>
    </div>
    <hr style={{ width: "85%", border: "0.1px solid #ececec" }}/>
    <div className="logOut-button" onClick={handleSubmit}>log out</div>

    </>
  );
};

export default Conversation;
