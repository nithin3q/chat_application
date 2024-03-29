import axios from 'axios'


const API = axios.create({ baseURL: 'https://chat-project-mern-backend-nithin3qs-projects.vercel.app' });

export const logIn= (formData)=> API.post('/auth/login',formData);

export const signUp = (formData) => API.post('/auth/register', formData);

export const logout = () => API.post('/auth/logout');
