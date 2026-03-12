import axios from "axios";

export const api = axios.create({
  baseURL: "https://portal-imetro-shyd.vercel.app",
});
