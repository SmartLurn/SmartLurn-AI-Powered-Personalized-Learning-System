import axios from "axios";

// One axios instance for every backend call
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}/api`,
  withCredentials: true,
});

// Attach the login token to every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// If the token is expired or invalid, log out and go to the login page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = Boolean(sessionStorage.getItem("token"));

    if (error.response?.status === 401 && hadToken) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
