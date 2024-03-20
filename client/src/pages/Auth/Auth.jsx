import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Auth.css";
import {useDispatch, useSelector} from 'react-redux'
import { logIn, signUp } from "../../actions/AuthActions.js";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.authReducer.loading);
//   console.log(loading)
  const [data, setData] = useState({
    firstname: "",
    lastname: "",
    password: "",
    confirmPass: "",
    username: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const [confirmPass, setConfirmPass] = useState(true);
 

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
       data.password === data.confirmPass 
       ? dispatch(signUp(data)) 
       : setConfirmPass(false);
      }else{
        dispatch(logIn(data))
      }
    
  };

  const resetForm = () => {
    setConfirmPass(true);
    setData({
      firstname: "",
      lastname: "",
      password: "",
      confirmPass: "",
      username: "",
    });
  };

  return (
    <div className="root">
        <h2 className="mb">Chat App</h2>
      <div className="Auth container">
        <div>
          <form className="infoForm authForm" onSubmit={handleSubmit}>
            <h3>{isSignUp ? "Register" : "Login"}</h3>
            {isSignUp && (
              <div className="infoInputGroup">
                <input
                  required
                  type="text"
                  placeholder="First Name"
                  className="infoInput form-control mb-2"
                  name="firstname"
                  value={data.firstname}
                  onChange={handleChange}
                />
                <input
                  required
                  type="text"
                  placeholder="Last Name"
                  className="infoInput form-control mb-2"
                  name="lastname"
                  value={data.lastname}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="form-group">
              <input
                required
                type="text"
                placeholder="Username"
                className="infoInput form-control mb-2"
                name="username"
                value={data.username}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <input
                required
                type="password"
                className="infoInput form-control mb-2"
                placeholder="Password"
                name="password"
                value={data.password}
                onChange={handleChange}
              />
              {isSignUp && (
                <input
                  required
                  type="password"
                  className="infoInput form-control mb-2"
                  name="confirmPass"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                />
              )}
            </div>
            <span
              style={{
                color: "red",
                fontSize: "12px",
                alignSelf: "flex-end",
                marginRight: "5px",
                display: confirmPass ? "none" : "block",
              }}
            >
              *Confirm password is not the same
            </span>
            <div>
              <span
                style={{
                  fontSize: "14px",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
                onClick={() => {
                  resetForm();
                  setIsSignUp((prev) => !prev);
                }}
              >
                {isSignUp
                  ? "Already have an account? Login"
                  : "Don't have an account? Sign up"}
              </span>
              <button
                className="btn btn-primary infoButton ms-2"
                type="Submit"
                disabled={!confirmPass}
              >
                {confirmPass ? (isSignUp ? "Sign Up" : "Login") : "Loading..."}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Auth;
