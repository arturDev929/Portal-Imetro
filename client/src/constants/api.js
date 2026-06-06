// Seu arquivo de configuração (ex: config.js ou api.js)
export const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || "8081"; // Mudar para 8081
export const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:${BACKEND_PORT}`;