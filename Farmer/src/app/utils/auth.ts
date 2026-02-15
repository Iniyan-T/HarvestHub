// Simple authentication utility for farmer app
const API_URL = "http://localhost:5000/api";

// Store for auth token
let authToken: string | null = null;

/**
 * Initialize authentication - get token for farmer user
 */
export async function initializeAuth(): Promise<boolean> {
  try {
    // Check if we already have a token
    const storedToken = localStorage.getItem('farmerAuthToken');
    if (storedToken) {
      authToken = storedToken;
      return true;
    }

    // Try to login with test farmer credentials
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'farmer@example.com',
        password: 'password123'
      })
    });

    if (!response.ok) {
      console.error('Failed to authenticate farmer');
      return false;
    }

    const result = await response.json();
    if (result.success && result.token) {
      authToken = result.token;
      localStorage.setItem('farmerAuthToken', result.token);
      localStorage.setItem('farmerUserId', result.user._id);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}

/**
 * Get current auth token
 */
export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('farmerAuthToken');
  }
  return authToken;
}

/**
 * Get current user ID
 */
export function getUserId(): string {
  return localStorage.getItem('farmerUserId') || 'farmer_001';
}

/**
 * Make authenticated API call
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();
  
  if (!token) {
    await initializeAuth();
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

/**
 * Logout and clear auth
 */
export function logout(): void {
  authToken = null;
  localStorage.removeItem('farmerAuthToken');
  localStorage.removeItem('farmerUserId');
}
