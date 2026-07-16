import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<User>;
  signupPatient: (name: string, email: string, password: string, phone: string) => Promise<User>;
  loginWithGoogle: (email?: string, name?: string) => Promise<User>;
  createStaffAccount: (name: string, email: string, role: UserRole, department?: string) => Promise<User>;
  updateStaffAccount: (id: string, name: string, email: string, role?: UserRole, department?: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  dbStatus: {
    provider: string;
    mongodbUriConfigured: boolean;
    googleClientConfigured: boolean;
  } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<AuthContextType['dbStatus']>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users registry:', err);
    }
  };

  // Fetch active session and DB status on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Read active session from local storage cache first
        const activeSession = localStorage.getItem('carebridge_active_session');
        if (activeSession) {
          try {
            setCurrentUser(JSON.parse(activeSession));
          } catch (e) {
            console.error('Error parsing session cache:', e);
          }
        }

        // Fetch DB & environment configuration status
        const statusRes = await fetch('/api/db-status');
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setDbStatus(statusData);
        }

        // Fetch registered users/staff to populate dashboard counters
        await fetchUsers();
      } catch (err) {
        console.error('Error connecting to authentication service:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Authentication failed.');
    }

    const { user } = await res.json();
    setCurrentUser(user);
    localStorage.setItem('carebridge_active_session', JSON.stringify(user));
    return user;
  };

  const signupPatient = async (name: string, email: string, password: string, phone: string): Promise<User> => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Registration failed.');
    }

    const { user } = await res.json();
    setCurrentUser(user);
    localStorage.setItem('carebridge_active_session', JSON.stringify(user));
    // Sync newly registered patient to local memory
    setUsers(prev => {
      if (prev.some(u => u.id === user.id)) return prev;
      return [...prev, user];
    });
    return user;
  };

  const loginWithGoogle = async (email?: string, name?: string): Promise<User> => {
    // 1. Fetch Google Sign-In URL from Express server
    const res = await fetch('/api/auth/google/url');
    if (!res.ok) {
      throw new Error('Could not retrieve Google Sign-In endpoint from server.');
    }
    const { url } = await res.json();

    // Convert relative URL paths to absolute URL paths for robust window.open behavior
    let targetUrl = url;
    if (url.startsWith('/')) {
      targetUrl = window.location.origin + url;
    }

    // 2. Open popup pointing directly to Google Auth (or our elegant simulator)
    const popupWidth = 500;
    const popupHeight = 600;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    const popup = window.open(
      targetUrl,
      'carebridge_google_signin',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},status=no,toolbar=no,menubar=no,location=no`
    );

    if (!popup) {
      throw new Error('Popup blocked! Please allow popups to sign in with Google.');
    }

    // 3. Wait for the popup to communicate success via either postMessage OR localStorage synchronization
    return new Promise((resolve, reject) => {
      // Clear any pre-existing success flags from earlier attempts
      localStorage.removeItem('carebridge_google_login_success');

      const cleanup = () => {
        clearInterval(closeChecker);
        clearInterval(storagePoller);
        window.removeEventListener('message', messageListener);
        window.removeEventListener('storage', storageListener);
      };

      const handleSuccess = (user: User) => {
        cleanup();
        setCurrentUser(user);
        localStorage.setItem('carebridge_active_session', JSON.stringify(user));
        // Dispatch custom storage event to sync all dashboard components instantly
        window.dispatchEvent(new Event('storage'));
        // Pull fresh database users to record new patient registration
        fetchUsers();
        resolve(user);
      };

      // A. Message listener for direct postMessage
      const messageListener = (event: MessageEvent) => {
        const origin = event.origin;
        if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
          return;
        }

        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          handleSuccess(event.data.user);
        }
      };

      // B. Storage event listener for cross-window syncing (bypasses window.opener null issue)
      const storageListener = (event: StorageEvent) => {
        if (event.key === 'carebridge_google_login_success' && event.newValue) {
          try {
            const user = JSON.parse(event.newValue);
            localStorage.removeItem('carebridge_google_login_success');
            handleSuccess(user);
          } catch (e) {
            console.error('Error parsing Google Login storage event:', e);
          }
        }
      };

      // C. Interval fallback poller on localStorage (for absolute cross-browser resilience)
      const storagePoller = setInterval(() => {
        const val = localStorage.getItem('carebridge_google_login_success');
        if (val) {
          try {
            const user = JSON.parse(val);
            localStorage.removeItem('carebridge_google_login_success');
            handleSuccess(user);
          } catch (e) {
            console.error('Error parsing Google Login polled storage:', e);
          }
        }
      }, 500);

      window.addEventListener('message', messageListener);
      window.addEventListener('storage', storageListener);

      // Setup poller to reject if popup is closed before completing Google login
      const closeChecker = setInterval(() => {
        if (popup.closed) {
          // Give a brief moment for the storage poller to process any last-minute writes
          setTimeout(() => {
            const val = localStorage.getItem('carebridge_google_login_success');
            if (val) {
              try {
                const user = JSON.parse(val);
                localStorage.removeItem('carebridge_google_login_success');
                handleSuccess(user);
                return;
              } catch (e) {}
            }
            cleanup();
            reject(new Error('Google Sign-In popup closed before completing authentication.'));
          }, 400);
        }
      }, 1000);
    });
  };

  const createStaffAccount = async (name: string, email: string, role: UserRole, department?: string): Promise<User> => {
    const res = await fetch('/api/users/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role, department })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to create staff account.');
    }

    const { user } = await res.json();
    // Add new staff account to current registry list to update dashboard counters
    setUsers(prev => {
      if (prev.some(u => u.id === user.id)) return prev;
      return [...prev, user];
    });
    return user;
  };

  const updateStaffAccount = async (id: string, name: string, email: string, role?: UserRole, department?: string): Promise<User> => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role, department })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update staff account.');
    }

    const { user } = await res.json();
    setUsers(prev => prev.map(u => u.id === id ? user : u));

    // If updating currently logged in user, sync session
    if (currentUser && currentUser.id === id) {
      setCurrentUser(user);
      localStorage.setItem('carebridge_active_session', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));
    }

    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('carebridge_active_session');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        signupPatient,
        loginWithGoogle,
        createStaffAccount,
        updateStaffAccount,
        logout,
        isLoading,
        dbStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
