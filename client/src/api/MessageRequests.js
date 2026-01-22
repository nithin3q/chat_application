import axios from "axios";

const API = axios.create({ baseURL: "https://chat-application-qd00.onrender.com/" });

export const getMessages = (id) => API.get(`/message/${id}`)

export const addMessage = (data) => API.post('/message/', data)

export const addReaction = (messageId, data) => API.put(`/message/${messageId}/react`, data)

export const markMessagesSeen = (chatId, viewerId) => API.put(`/message/${chatId}/seen/${viewerId}`)