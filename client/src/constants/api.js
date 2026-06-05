export const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || "5000";
export const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:${BACKEND_PORT}`;