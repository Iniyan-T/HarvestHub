// Authentication utility for buyer app
const API_URL = "http://localhost:5000/api";

// Store for auth token
let authToken: string | null = null;

/**
 * Initialize authentication - get token for buyer user
 */
export async function initializeAuth(): Promise<boolean> {
  try {
    // Check if we already have a token
    const storedToken = localStorage.getItem('buyerAuthToken');
    if (storedToken) {
      authToken = storedToken;
      return true;
    }

    // Try to login with test buyer credentials
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'buyer@example.com',
        password: 'password123'
      })
    });

    if (!response.ok) {
      console.error('Failed to authenticate buyer');
      return false;
    }

    const result = await response.json();
    if (result.success && result.token) {
      authToken = result.token;
      localStorage.setItem('buyerAuthToken', result.token);
      localStorage.setItem('buyerUserId', result.user._id);
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
    authToken = localStorage.getItem('buyerAuthToken');
  }
  return authToken;
}

/**
 * Get current user ID
 */
export function getUserId(): string {
  return localStorage.getItem('buyerUserId') || 'buyer_001';
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
  localStorage.removeItem('buyerAuthToken');
  localStorage.removeItem('buyerUserId');
}
