import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

const DEFAULT_SIMULATED_USERS: User[] = [
  {
    id: 'usr-admin-james',
    name: 'James Anini',
    email: 'admin@carebridge.com',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-doctor-chinedu',
    name: 'Dr. Chinedu Okafor',
    email: 'doctor.chinedu@carebridge.com',
    role: 'doctor',
    department: 'Cardiology',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-doctor-emade',
    name: 'Dr. Emade Sunday',
    email: 'doctor.emade@carebridge.com',
    role: 'doctor',
    department: 'Pediatrics',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-doctor-marcus',
    name: 'Dr. Babatunde Balogun',
    email: 'doctor.marcus@carebridge.com',
    role: 'doctor',
    department: 'Neurology',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-doctor-sarah',
    name: 'Dr. Funmilayo Adebayo',
    email: 'doctor.sarah@carebridge.com',
    role: 'doctor',
    department: 'Obstetrics & Gynecology',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-nurse-clara',
    name: 'Nurse Clara Barton',
    email: 'nurse.clara@carebridge.com',
    role: 'nurse',
    department: 'Primary Care',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-nurse-jane',
    name: 'Nurse Jane Doe',
    email: 'nurse.jane@carebridge.com',
    role: 'nurse',
    department: 'Emergency Care',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-pharmacist-george',
    name: 'Pharmacist George',
    email: 'pharmacist@carebridge.com',
    role: 'pharmacist',
    department: 'Clinical Pharmacy',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-lab-sarah',
    name: 'Lab Tech Sarah',
    email: 'lab@carebridge.com',
    role: 'lab',
    department: 'Pathology & Labs',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-receptionist-blessing',
    name: 'Receptionist Blessing',
    email: 'receptionist@carebridge.com',
    role: 'receptionist',
    department: 'Front Desk & Triage',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-patient-john',
    name: 'John Doe',
    email: 'patient@carebridge.com',
    role: 'patient',
    phone: '+234 801 234 5678',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-patient-jane',
    name: 'Jane Smith',
    email: 'patient.jane@carebridge.com',
    role: 'patient',
    phone: '+234 802 345 6789',
    createdAt: new Date().toISOString()
  }
];

function getLocalUsers(): User[] {
  const stored = localStorage.getItem('carebridge_users');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing local users:', e);
    }
  }
  localStorage.setItem('carebridge_users', JSON.stringify(DEFAULT_SIMULATED_USERS));
  return DEFAULT_SIMULATED_USERS;
}

function saveLocalUser(user: User) {
  const users = getLocalUsers();
  if (users.some(u => u.id === user.id)) {
    const updated = users.map(u => u.id === user.id ? user : u);
    localStorage.setItem('carebridge_users', JSON.stringify(updated));
  } else {
    localStorage.setItem('carebridge_users', JSON.stringify([...users, user]));
  }
}

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
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setUsers(data);
          localStorage.setItem('carebridge_users', JSON.stringify(data));
          return;
        } catch (e) {
          console.warn('API returned non-JSON. Falling back to local storage.');
        }
      }
    } catch (err) {
      console.error('Error fetching users registry:', err);
    }
    const local = getLocalUsers();
    setUsers(local);
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
        try {
          const statusRes = await fetch('/api/db-status');
          if (statusRes.ok) {
            const text = await statusRes.text();
            try {
              const statusData = JSON.parse(text);
              setDbStatus(statusData);
            } catch (jsonErr) {
              setDbStatus({
                provider: 'Vercel Client Database',
                mongodbUriConfigured: false,
                googleClientConfigured: false
              });
            }
          } else {
            setDbStatus({
              provider: 'Vercel Client Database',
              mongodbUriConfigured: false,
              googleClientConfigured: false
            });
          }
        } catch (dbErr) {
          setDbStatus({
            provider: 'Vercel Client Database',
            mongodbUriConfigured: false,
            googleClientConfigured: false
          });
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
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const { user } = await res.json();
        setCurrentUser(user);
        localStorage.setItem('carebridge_active_session', JSON.stringify(user));
        return user;
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Authentication failed.' }));
        throw new Error(errorData.error || 'Authentication failed.');
      }
    } catch (err: any) {
      console.warn('Authentication server unreachable. Utilizing local sandbox database...');
      const emailNorm = email.toLowerCase().trim();
      const localUsers = getLocalUsers();
      const found = localUsers.find(u => u.email.toLowerCase().trim() === emailNorm);
      if (found) {
        setCurrentUser(found);
        localStorage.setItem('carebridge_active_session', JSON.stringify(found));
        return found;
      }
      throw new Error(err.message || 'No account with this email address was found in CareBridge clinical records.');
    }
  };

  const signupPatient = async (name: string, email: string, password: string, phone: string): Promise<User> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });

      if (res.ok) {
        const { user } = await res.json();
        setCurrentUser(user);
        localStorage.setItem('carebridge_active_session', JSON.stringify(user));
        setUsers(prev => {
          if (prev.some(u => u.id === user.id)) return prev;
          return [...prev, user];
        });
        return user;
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Registration failed.' }));
        throw new Error(errorData.error || 'Registration failed.');
      }
    } catch (err: any) {
      console.warn('Registration server offline. Initializing local sandbox account...');
      const emailNorm = email.toLowerCase().trim();
      const localUsers = getLocalUsers();
      if (localUsers.some(u => u.email.toLowerCase().trim() === emailNorm)) {
        throw new Error('An account with this email address already exists.');
      }

      const newUser: User = {
        id: `usr-patient-${Date.now()}`,
        name,
        email: emailNorm,
        role: 'patient',
        phone,
        createdAt: new Date().toISOString()
      };

      saveLocalUser(newUser);
      setCurrentUser(newUser);
      localStorage.setItem('carebridge_active_session', JSON.stringify(newUser));
      setUsers(prev => [...prev, newUser]);
      return newUser;
    }
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
    try {
      const res = await fetch('/api/users/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, department })
      });

      if (res.ok) {
        const { user } = await res.json();
        setUsers(prev => {
          if (prev.some(u => u.id === user.id)) return prev;
          return [...prev, user];
        });
        return user;
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to create staff account.' }));
        throw new Error(errorData.error || 'Failed to create staff account.');
      }
    } catch (err) {
      console.warn('Clinical server offline. Creating staff profile locally...');
      const emailNorm = email.toLowerCase().trim();
      const localUsers = getLocalUsers();
      if (localUsers.some(u => u.email.toLowerCase().trim() === emailNorm)) {
        throw new Error('A user with this email address already exists in database.');
      }

      const newUser: User = {
        id: `usr-${role}-${Date.now()}`,
        name,
        email: emailNorm,
        role,
        department,
        createdAt: new Date().toISOString()
      };

      saveLocalUser(newUser);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    }
  };

  const updateStaffAccount = async (id: string, name: string, email: string, role?: UserRole, department?: string): Promise<User> => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, department })
      });

      if (res.ok) {
        const { user } = await res.json();
        setUsers(prev => prev.map(u => u.id === id ? user : u));

        if (currentUser && currentUser.id === id) {
          setCurrentUser(user);
          localStorage.setItem('carebridge_active_session', JSON.stringify(user));
          window.dispatchEvent(new Event('storage'));
        }

        return user;
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to update staff account.' }));
        throw new Error(errorData.error || 'Failed to update staff account.');
      }
    } catch (err) {
      console.warn('Clinical server offline. Updating staff profile locally...');
      const localUsers = getLocalUsers();
      const found = localUsers.find(u => u.id === id);
      if (!found) {
        throw new Error('Staff account not found in local records.');
      }

      const updatedUser: User = {
        ...found,
        name,
        email: email.toLowerCase().trim(),
        role: role || found.role,
        department: department || found.department
      };

      saveLocalUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));

      if (currentUser && currentUser.id === id) {
        setCurrentUser(updatedUser);
        localStorage.setItem('carebridge_active_session', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
      }

      return updatedUser;
    }
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
