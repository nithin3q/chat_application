import axios from "axios";

const API = axios.create({ baseURL: "http://127.0.0.1:5000" });

export const createChat = (data) => API.post('/chat/', data);


export const userChats=(id)=>API.get(`/chat/${id}`)

