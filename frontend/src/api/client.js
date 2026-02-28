import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function fetchStreams() {
  const res = await api.get("/api/streams");
  return res.data;
}

export async function fetchCombinations(domain) {
  const res = await api.get(`/api/combinations/${encodeURIComponent(domain)}`);
  return res.data;
}

export async function fetchQuestions(domain) {
  const res = await api.get(`/api/questions/${encodeURIComponent(domain)}`);
  return res.data;
}

export async function calculateWeights(domain, answers) {
  const res = await api.post("/api/calculate-weights", { domain, answers });
  return res.data;
}

export async function rankCourses(combinationId, userWeights) {
  const res = await api.post("/api/rank-courses", {
    combination_id: combinationId,
    user_weights: userWeights,
  });
  return res.data;
}

export async function generateExplanation(payload) {
  const res = await api.post("/api/generate-explanation", payload);
  return res.data;
}

