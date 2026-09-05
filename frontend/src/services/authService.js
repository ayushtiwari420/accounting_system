import api from "./api.js";

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response;
};

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response;
};

export const refreshToken = async (refreshTokenValue) => {
  const response = await api.post("/auth/refresh", { refreshToken: refreshTokenValue });
  return response;
};
