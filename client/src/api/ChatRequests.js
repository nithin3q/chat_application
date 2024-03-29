import axios from "axios";

const API = axios.create({ baseURL: "https://chat-project-mern-backend-nithin3qs-projects.vercel.app" });

export const createChat = (data) => API.post('/chat/', data);


export const userChats=(id)=>API.get(`/chat/${id}`)

