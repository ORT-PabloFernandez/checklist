'use client';

/**
 * Application configuration constants
 * Centralized configuration for easy maintenance and environment management
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
  'https://tp2-backend-htarb0a8gqazcmfh.eastus2-01.azurewebsites.net';
export const TOKEN_KEY = 'token';

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/users/login',
  REGISTER: '/api/users/register',
  LOGOUT: '/api/users/logout',
  
  // Users
  USERS: '/api/users',
  CURRENT_USER: '/api/users/me',
  
  // Tasks/Assignments (when backend is ready)
  TASKS: '/api/tasks',
  ASSIGNMENTS: '/api/assignments',
  EXECUTIONS: '/api/executions',
};

/**
 * Helper function to build full API URL
 * @param {string} endpoint - API endpoint path
 * @returns {string} Full API URL
 */
export function getApiUrl(endpoint) {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
}

/**
 * Helper function to get full URL for a specific endpoint
 * @param {keyof typeof API_ENDPOINTS} endpointKey - Key from API_ENDPOINTS
 * @returns {string} Full API URL
 */
export function getEndpointUrl(endpointKey) {
  const endpoint = API_ENDPOINTS[endpointKey];
  if (!endpoint) {
    throw new Error(`Endpoint key "${endpointKey}" not found in API_ENDPOINTS`);
  }
  return getApiUrl(endpoint);
}

