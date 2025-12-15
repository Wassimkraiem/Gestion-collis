// Simple authentication with credentials from environment variables
const VALID_USERNAME = process.env.NEXT_PUBLIC_AUTH_USERNAME || '';
const VALID_PASSWORD = process.env.NEXT_PUBLIC_AUTH_PASSWORD || '';

export function validateCredentials(username: string, password: string): boolean {
  if (!VALID_USERNAME || !VALID_PASSWORD) {
    console.error('Authentication credentials not configured in environment variables');
    return false;
  }
  return username === VALID_USERNAME && password === VALID_PASSWORD;
}

export function setAuthSession() {
  if (typeof window !== 'undefined') {
    const sessionData = {
      user: VALID_USERNAME,
      timestamp: Date.now()
    };
    localStorage.setItem('auth_session', JSON.stringify(sessionData));
    sessionStorage.setItem('auth_active', 'true');
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const session = localStorage.getItem('auth_session');
  const active = sessionStorage.getItem('auth_active');
  
  if (!session || !active) return false;
  
  try {
    const data = JSON.parse(session);
    // Session valid for 24 hours
    const isValid = Date.now() - data.timestamp < 24 * 60 * 60 * 1000;
    return isValid;
  } catch {
    return false;
  }
}

export function clearAuthSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_session');
    sessionStorage.removeItem('auth_active');
  }
}

