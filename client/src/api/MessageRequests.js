import axios from "axios";

const API = axios.create({ baseURL: "http://127.0.0.1:5000" });

export const getMessages=(id)=>API.get(`/message/${id}`)

export const addMessage=(data)=>API.post('/message/',data)