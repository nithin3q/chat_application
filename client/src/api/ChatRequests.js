import axios from "axios";

const API = axios.create({ baseURL: "https://chat-application-qd00.onrender.com/" });

export const createChat = (data) => API.post('/chat/', data);


export const userChats=(id)=>API.get(`/chat/${id}`)

