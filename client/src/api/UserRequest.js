import axios from "axios";

const API = axios.create({ baseURL: "https://chat-application-qd00.onrender.com/" });
export const getUser = (userId) => API.get(`/user/${userId}`);
export const getAllUser = ()=> API.get('/user')



// API.interceptors.request.use((req) => {
//     if (localStorage.getItem('profile')) {
//       req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('profile')).token}`;
//     }
  
//     return req;
//   });

export const updateUser = (id, formData) =>  API.put(`/user/${id}`, formData);
export const followUser = (id,data)=> API.put(`/user/${id}/follow`, data)
export const unfollowUser = (id, data)=> API.put(`/user/${id}/unfollow`, data)