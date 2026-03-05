// lib/axiosinstance.ts
 
import axios from 'axios';
 
 
const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/`, // Ensure this is set in your .env.local file
  headers: {
    'Content-Type': 'application/json',
   
  },
  withCredentials: true,
});
 
 
axiosInstance.interceptors.request.use(
  (config) => {
    const auth =
      sessionStorage.getItem("currentAuth") ||
      localStorage.getItem("currentAuth");
 
    if (auth) {
      const { token } = JSON.parse(auth);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
 
    return config;
  },
  (error) => Promise.reject(error)
);
 
 
export default axiosInstance;
 
 
 
