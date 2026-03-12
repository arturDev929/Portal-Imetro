import axios from "axios";
const backendPort = import.meta.env.VITE_BACKEND_PORT || "8080";
const host = window.location.hostname;

const baseURL =
  import.meta.env.VITE_API_URL ||
  `http://${host}:${backendPort}`;

export const api = axios.create({
  baseURL,
});

export default api;
