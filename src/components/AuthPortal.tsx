import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogOut, User, Lock, Mail, Phone, Shield, ArrowRight } from 'lucide-react';
import PatientDashboard from './dashboards/PatientDashboard';
import DoctorDashboard from './dashboards/DoctorDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import NurseDashboard from './dashboards/NurseDashboard';
import ReceptionistDashboard from './dashboards/ReceptionistDashboard';
import PharmacyDashboard from './dashboards/PharmacyDashboard';
import LaboratoryDashboard from './dashboards/LaboratoryDashboard';

interface AuthPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBooking?: () => void;
}

export default function AuthPortal({ isOpen, onClose, onNavigateToBooking }: AuthPortalProps) {
  const { currentUser, login, signupPatient, loginWithGoogle, logout, dbStatus } = useAuth();
  
  // View state: 'login' | 'signup'
  const [view, setView] = useState<'login' | 'signup'>('login');

  // Forms states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Status logs
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please provide both your email and password.');
      return;
    }

    try {
      await login(email, password);
      setSuccess('Log in authorized. Syncing portal clinical streams...');
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !phone) {
      setError('Please provide all requested registration details.');
      return;
    }

    try {
      await signupPatient(name, email, password, phone);
      setSuccess('Registration successful! Welcome to CareBridge Clinical Network.');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    }
  };

  if (!isOpen) return null;

  // Render correct dashboard component based on role
  const renderDashboard = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'doctor':
        return <DoctorDashboard currentUser={currentUser} />;
      case 'nurse':
        return <NurseDashboard currentUser={currentUser} />;
      case 'receptionist':
        return <ReceptionistDashboard currentUser={currentUser} />;
      case 'pharmacist':
        return <PharmacyDashboard currentUser={currentUser} />;
      case 'lab':
        return <LaboratoryDashboard currentUser={currentUser} />;
      case 'patient':
      default:
        return <PatientDashboard currentUser={currentUser} onClose={onClose} onNavigateToBooking={onNavigateToBooking} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-primary/50 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-gray-150 animate-in fade-in zoom-in duration-300">
          
          {/* Global Portal Header */}
          <div className="px-6 py-4.5 bg-gradient-to-r from-primary to-teal-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-base tracking-tight leading-none">CareBridge Medical Portal</h2>
                <p className="text-[10px] text-teal-300 font-mono tracking-wider mt-1 uppercase font-bold">Clinical Care Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentUser && (
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/15 transition-colors focus:outline-none"
                aria-label="Close portal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Portal Body Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
            {currentUser ? (
              // Logged in: Render the dashboard
              <div className="max-w-5xl mx-auto space-y-6">
                {renderDashboard()}
              </div>
            ) : (
              // Logged out: Render Auth Forms
              <div className="max-w-md mx-auto w-full">
                
                {/* Form Col */}
                <div className="bg-white rounded-2xl border border-gray-150 p-6 md:p-8 card-shadow space-y-6">
                  <div>
                    <h3 className="text-xl font-display font-black text-primary">
                      {view === 'login' ? 'Clinical Gateway Login' : 'Create Patient Account'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {view === 'login'
                        ? 'Welcome back! Sign in to access your customized dashboard.'
                        : 'Register your account. Public registration is open for patient accounts only.'}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold leading-relaxed">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-semibold leading-relaxed">
                      {success}
                    </div>
                  )}

                  {view === 'login' ? (
                    // Login Form
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                          <input
                            type="email"
                            required
                            placeholder="your.name@carebridge.com"
                            className="w-full text-xs pl-11 pr-4 py-3.5 bg-gray-50/55 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                          Access Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                          <input
                            type="password"
                            required
                            placeholder="••••••••••••"
                            className="w-full text-xs pl-11 pr-4 py-3.5 bg-gray-50/55 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1.5"
                      >
                        Authorize & Login <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  ) : (
                    // Sign Up Form
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Amara Nwosu"
                            className="w-full text-xs pl-11 pr-4 py-3.5 bg-gray-50/55 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                            <input
                              type="email"
                              required
                              placeholder="a.nwosu@gmail.com"
                              className="w-full text-xs pl-11 pr-4 py-3.5 bg-gray-50/55 border border-gray-200 rounded-xl focus:outline-none"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                            Mobile Line
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                            <input
                              type="tel"
                              required
                              placeholder="+234 803 900 9111"
                              className="w-full text-xs pl-11 pr-4 py-3.5 bg-gray-50/55 border border-gray-200 rounded-xl focus:outline-none"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                          Account Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                          <input
                            type="password"
                            required
                            placeholder="Create secure password"
                            className="w-full text-xs pl-11 pr-4 py-3.5 bg-gray-50/55 border border-gray-200 rounded-xl focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-red-50 text-[10px] text-red-700 rounded-xl border border-red-100 font-mono">
                        ⚠️ STAFF REGISTRATION EXCLUSION: Hospital personnel roles are manually provisioned by administrators and cannot register via this public patient form.
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-secondary hover:bg-secondary/95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-secondary/10"
                      >
                        Register Patient Account
                      </button>
                    </form>
                  )}

                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-4 shrink-0">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <span className="relative px-3.5 bg-white text-[10px] font-mono text-gray-400 uppercase font-semibold">
                      Authentication Alternatives
                    </span>
                  </div>

                  {/* Google Sign In Button */}
                  <button
                    onClick={async () => {
                      setError('');
                      setSuccess('');
                      try {
                        await loginWithGoogle();
                        setSuccess('Signed in with Google! Syncing clinical dashboard...');
                      } catch (err: any) {
                        setError(err.message || 'Google Sign-In failed.');
                      }
                    }}
                    className="w-full py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5.04c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.4 15 0 12 0 7.4 0 3.5 2.7 1.7 6.6l3.9 3c1-3 3.8-4.6 6.4-4.6z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.4c-.2-.6-.4-1.3-.4-2.4s.2-1.8.4-2.4l-3.9-3C.6 8.5 0 10.2 0 12s.6 3.5 1.7 5.4l3.9-3z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.2 0 6-1.1 8-2.9l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.8 0-7-2.6-8.2-6.2l-3.9 3C3.5 21.3 7.4 24 12 24z"
                      />
                    </svg>
                    <span>Sign In with Google</span>
                  </button>

                  <div className="text-center pt-2">
                    {view === 'login' ? (
                      <button
                        type="button"
                        onClick={() => setView('signup')}
                        className="text-xs font-bold text-secondary hover:text-secondary/80 hover:underline tracking-wider uppercase"
                      >
                        DONT HAVE AN ACCOUNT? SIGN UP
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setView('login')}
                        className="text-xs font-bold text-secondary hover:text-secondary/80 hover:underline tracking-wider uppercase"
                      >
                        ALREADY HAVE AN ACCOUNT? LOGIN
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer licensing tag */}
          <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 shrink-0 text-center flex flex-col sm:flex-row justify-between items-center gap-2 text-gray-400 font-mono text-[10px]">
            <span>© CAREBRIDGE DIGITAL CLINICS • {dbStatus ? `ACTIVE ENGINE: ${dbStatus.provider}` : 'CONNECTING TO CLINICAL SERVER...'}</span>
            <span>🔒 LOCAL CACHE AND STATE IS HIPPA ENCRYPTED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
