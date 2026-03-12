import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.100.167:8080",
});

// default export for convenience
export default api;
