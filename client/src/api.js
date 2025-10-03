// src/api.js

/**
 * The base URL for the API, read from an environment variable.
 * Defaults to 'http://localhost:5000/api' for local development.
 */
export const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

/**
 * A wrapper around the native `fetch` function that automatically handles authentication and error responses.
 *
 * @param {string} path - The API endpoint path (e.g., '/agents').
 * @param {object} options - The options object for the `fetch` call.
 * @returns {Promise<any>} - A promise that resolves with the parsed JSON response.
 * @throws {Error} - Throws an error for non-OK responses or network issues.
 */
export async function fetchWithAuth(path, options = {}) {
  // Retrieve the authentication token from localStorage.
  const token = localStorage.getItem('token');

  // Prepare the headers object.
  const headers = {
    ...options.headers,
  };

  // If a token exists, add it to the Authorization header.
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // For FormData, we let the browser set the Content-Type.
  // For other requests, we default to application/json.
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
  }

  // Construct the full URL for the API request.
  const url = API_BASE + path;

  try {
    // Make the fetch request with the prepared URL, headers, and options.
    const response = await fetch(url, { ...options, headers });

    // If the response status is 401 (Unauthorized), log the user out.
    if (response.status === 401) {
      localStorage.removeItem('token');
      // Redirect to the login page.
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    // For non-OK responses, parse the error message from the body.
    if (!response.ok) {
      // The backend is expected to return a JSON object with a 'message' property.
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // If the response is OK, parse and return the JSON body.
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    // Re-throw the error so it can be caught by the calling component.
    throw error;
  }
}
