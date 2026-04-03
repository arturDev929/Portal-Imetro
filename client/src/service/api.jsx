import axios from "axios";

export const baseURL = "https://api-portal-imetro.onrender.com";

export const api = axios.create({
  baseURL,
});

export default api;
