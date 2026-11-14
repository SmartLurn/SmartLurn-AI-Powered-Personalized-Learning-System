import axios from "axios";

// Axios instance for the Python AI service (PDF question answering)
const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_URL || "http://localhost:8000",
  // Gemini can take a while on long PDFs
  timeout: 120000,
});

// Read the error message FastAPI sends back ({ detail: "..." })
export const getAiError = (error, fallback) => {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") return detail;
  if (!error.response) return "AI service is not reachable. Is it running?";

  return fallback;
};

export default aiApi;
