import axios from "axios";

const API = axios.create({ baseURL: "https://chat-project-mern-backend-nithin3qs-projects.vercel.app" });

export const getMessages=(id)=>API.get(`/message/${id}`)

export const addMessage=(data)=>API.post('/message/',data)