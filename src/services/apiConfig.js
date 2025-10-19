// API Configuration utility
// In browser environment, we need to detect development vs production differently

// Determine if we're in development based on the hostname
const isDevelopment = () => {
  // Check if we're running on localhost or 127.0.0.1
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.startsWith('192.168.') || // Common local network IPs
           window.location.hostname.startsWith('10.'); // Common local network IPs
  }
  
  // For Node.js environment
  return process.env.NODE_ENV === 'development';
};

// Determine the correct API base URL based on environment
export const getApiBaseUrl = () => {
  // In development, use localhost with the correct port (5001)
  if (isDevelopment()) {
    return 'http://localhost:5001';
  }
  
  // In production, use the same origin (relative URLs)
  // This assumes the backend is served from the same domain
  return '';
};

// Get the full API URL for a specific endpoint
export const getApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  
  // If baseUrl is empty (production), return relative URL
  if (!baseUrl) {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }
  
  // In development, combine base URL with endpoint
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Create a default export object
const apiConfig = {
  getApiBaseUrl,
  getApiUrl
};

export default apiConfig;