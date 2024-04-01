import axios from 'axios'


const API = axios.create({ baseURL: 'https://chat-application-qd00.onrender.com/' });

export const logIn= (formData)=> API.post('/auth/login',formData);

export const signUp = (formData) => API.post('/auth/register', formData);

export const logout = () => API.post('/auth/logout');
