// apiClient.ts
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Project endpoints
export const projectApi = {
  getAllProjects: () => apiClient.get('/projects'),
  getProjectById: (id: string) => apiClient.get(`/projects/${id}`),
  createProject: (data: { project_name: string; description: string }) =>
    apiClient.post('/projects', data),
  updateProject: (id: string, data: { name: string; description: string }) =>
    apiClient.put(`/projects/${id}`, data),
  deleteProject: (id: string) => apiClient.delete(`/projects/${id}`),
  getProjectDetails: (id: string) => apiClient.get(`/projects/${id}/details`),
};

// Prompt endpoints
export const promptApi = {
  getAllPrompts: (projectId: string) =>
    apiClient.get(`/projects/${projectId}/prompts`),
  getPromptById: (id: string) => apiClient.get(`/prompts/${id}`),
  createPrompt: (projectId: string, data: {
    prompt_name: string;
    prompt: string;
    description: string;
    confidence_score: number;
  }) => apiClient.post(`/projects/${projectId}/prompts`, data),
  updatePrompt: (id: string, data: {
    name: string;
    prompt: string;
    description: string;
    confidence_score: number;
  }) => apiClient.put(`/prompts/${id}`, data),
  deletePrompt: (id: string) => apiClient.delete(`/prompts/${id}`),
  getPromptDetails: (id: string) => apiClient.get(`/prompts/${id}/details`),
  validateSecretKey: (data: { secret_key: string }) =>
    apiClient.post('/validate-secret-key', data),
};

export default apiClient;