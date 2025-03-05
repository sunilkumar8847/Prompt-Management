//apiClinet.ts
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Add token as query parameter as expected by the backend
      const separator = config.url?.includes('?') ? '&' : '?';
      config.url = `${config.url}${separator}token=${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    apiClient.post('/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/login', data),
};

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
    name: string;
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
  getPromptVersions: (id: string) => apiClient.get(`/prompts/${id}/versions`),
  revertPrompt: (id: string, versionId: string) => 
    apiClient.post(`/prompts/${id}/revert/${versionId}`),
  validateSecretKey: (projectId: string, promptId: string, secretKey: string) =>
    apiClient.post('/validate-secret-key', { 
      project_id: projectId, 
      prompt_id: promptId, 
      secret_key: secretKey 
    }),
};

export default apiClient;