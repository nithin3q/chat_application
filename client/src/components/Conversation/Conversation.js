import React, { useEffect, useState } from "react";
import { getUser } from "../../api/UserRequest";
import defaultProfileImage from "../../images/defaultProfile.png";
import { useDispatch } from 'react-redux';

const Conversation = ({ data, currentUser, online }) => {
  const [userData, setUserData] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const userId = data?._id;
    const getUserData = async () => {
      try {
        const { data } = await getUser(userId);
        setUserData(data);
        dispatch({ type: "SAVE_USER", data: data });
      } catch (error) {
        console.log(error);
      }
    };

    getUserData();
  }, [currentUser, data.members, dispatch]);

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
            <span>{online ? "Online" : "Offline"}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Conversation;
