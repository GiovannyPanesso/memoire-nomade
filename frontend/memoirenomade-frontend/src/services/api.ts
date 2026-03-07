import axios from "axios";

const api = axios.create({
  baseURL: "/api", // El proxy de Vite redirige al backend
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Necesario para las HttpOnly Cookies del Refresh Token
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

    // Si es 401 y no es un reintento, intentar renovar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          "/api/auth/refresh",
          {},
          { withCredentials: true },
        );

        const newToken = response.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch {
        // Refresh token expirado → limpiar sesión
        localStorage.removeItem("accessToken");
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
