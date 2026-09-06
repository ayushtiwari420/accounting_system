import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
const BASE_URL = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Network Error: Unable to connect to backend server";

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/request-otp") &&
      !originalRequest.url?.includes("/auth/reset-password")
    ) {
      originalRequest._retry = true;
      const storedRefreshToken = localStorage.getItem("refreshToken");

      if (storedRefreshToken) {
        try {
          // Attempt token refresh
          const res = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken: storedRefreshToken,
          });

          const { accessToken, token: legacyToken, refreshToken: newRefreshToken } =
            res.data?.data || res.data || {};
          const newAccessToken = accessToken || legacyToken;

          if (newAccessToken) {
            localStorage.setItem("token", newAccessToken);
            localStorage.setItem("accessToken", newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem("refreshToken", newRefreshToken);
            }

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest).then((r) => r.data);
          }
        } catch (refreshErr) {
          console.error("Token refresh failed:", refreshErr);
        }
      }

      // If refresh failed or no refresh token, perform cleanup & redirect
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register" &&
        window.location.pathname !== "/forgot-password"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
