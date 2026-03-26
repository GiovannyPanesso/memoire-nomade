import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor de petición: añade el token JWT a cada llamada
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de respuesta: si el token expiró, intenta renovarlo
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshUrl = import.meta.env.VITE_API_URL
          ? `${import.meta.env.VITE_API_URL}/api/auth/refresh`
          : "/api/auth/refresh";

        const response = await axios.post(
          refreshUrl,
          {},
          { withCredentials: true },
        );

        const newToken = response.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
