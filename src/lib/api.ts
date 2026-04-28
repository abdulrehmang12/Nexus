import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const AUTH_TOKEN_KEY = 'business_nexus_token';

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  delete api.defaults.headers.common.Authorization;
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
if (storedToken) {
  setAuthToken(storedToken);
}

export default api;
