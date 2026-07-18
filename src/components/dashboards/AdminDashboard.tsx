import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, UserPlus, ShieldAlert, Key, Clipboard, Trash, Filter, Search, 
  ShieldCheck, Pencil, X, Terminal, RefreshCw, Trash2, Play, Square, Flame 
} from 'lucide-react';

export default function AdminDashboard() {
  const { users, createStaffAccount, updateStaffAccount } = useAuth();
  
  // Dashboard view toggle tab
  const [activeTab, setActiveTab] = useState<'registry' | 'logs'>('registry');

  // Vercel server-side console logs state
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [logsSearchQuery, setLogsSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLogLoading, setIsLogLoading] = useState(false);
  const [logsError, setLogsError] = useState('');
  
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Manage staff states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('doctor');
  const [department, setDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Load Vercel Console Logs
  const fetchSystemLogs = async (silent = false) => {
    if (!silent) setIsLogLoading(true);
    setLogsError('');
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setSystemLogs(data.logs || []);
      } else {
        setLogsError('Failed to fetch backend console streams.');
      }
    } catch (err: any) {
      setLogsError('Clinical logging service unreachable.');
    } finally {
      if (!silent) setIsLogLoading(false);
    }
  };

  const triggerDiagnosticPing = async () => {
    try {
      await fetch('/api/logs/test', { method: 'POST' });
      fetchSystemLogs(true);
    } catch (err) {
      console.error(err);
    }
  };

  const clearLogsBuffer = async () => {
    try {
      await fetch('/api/logs/clear', { method: 'POST' });
      setSystemLogs([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Poll Vercel system logs periodically
  useEffect(() => {
    if (activeTab === 'logs') {
      fetchSystemLogs();
      const interval = setInterval(() => {
        if (autoRefresh) {
          fetchSystemLogs(true);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab, autoRefresh]);

  // Scroll terminal to bottom on new logs
  useEffect(() => {
    if (activeTab === 'logs' && terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [systemLogs, activeTab]);

  // Edit staff states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('doctor');
  const [editDepartment, setEditDepartment] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditDepartment(user.department || '');
    setEditError('');
    setEditSuccess('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError('');
    setEditSuccess('');

    if (!editName || !editEmail) {
      setEditError('Please fill out all required fields.');
      return;
    }

    try {
      await updateStaffAccount(editingUser.id, editName, editEmail, editRole, editDepartment);
      setEditSuccess('Information updated successfully!');
      setTimeout(() => {
        setEditingUser(null);
      }, 1000);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update account information.');
    }
  };

  // Notification states
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!fullName || !email) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      // Map department based on roles if left empty
      let finalDept = department;
      if (!finalDept) {
        if (role === 'pharmacist') finalDept = 'Main Pharmacy';
        else if (role === 'lab') finalDept = 'Diagnostic Laboratory';
        else if (role === 'nurse') finalDept = 'Outpatients Triage';
        else if (role === 'receptionist') finalDept = 'Admissions';
        else if (role === 'doctor') finalDept = 'Cardiology';
      }

      await createStaffAccount(fullName, email, role, finalDept);
      setSuccess(`Successfully created account for ${fullName} (${role})!`);
      
      // Reset form
      setFullName('');
      setEmail('');
      setDepartment('');
      setRole('doctor');
    } catch (e: any) {
      setError(e.message || 'Failed to create staff account.');
    }
  };

  // Filter users based on query
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate statistics
  const patientCount = users.filter((u) => u.role === 'patient').length;
  const doctorCount = users.filter((u) => u.role === 'doctor').length;
  const nurseCount = users.filter((u) => u.role === 'nurse').length;
  const staffCount = users.filter((u) => u.role !== 'patient' && u.role !== 'admin').length;

  return (
    <div className="space-y-6 text-left">
      {/* Header Admin Welcome */}
      <div className="bg-gradient-to-r from-red-800 to-primary p-6 rounded-2xl text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-mono text-red-300 font-bold uppercase tracking-wider">
              CareBridge Executive Command Station
            </span>
            <h2 className="text-2xl font-display font-extrabold">Executive System Admin</h2>
            <p className="text-xs text-white/70 font-mono mt-1">
              Superuser Node • HIPAA Compliance Coordinator
            </p>
          </div>
          <div className="bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 font-mono text-xs flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-green-400" /> SECURE ROOT PORTAL ACTIVE
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-gray-150 card-shadow">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Registered Patients</span>
          <strong className="text-2xl font-mono text-primary">{patientCount}</strong>
        </div>
        <div className="bg-white p-4.5 rounded-xl border border-gray-150 card-shadow">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Active Doctors</span>
          <strong className="text-2xl font-mono text-secondary">{doctorCount}</strong>
        </div>
        <div className="bg-white p-4.5 rounded-xl border border-gray-150 card-shadow">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Triage Nurses</span>
          <strong className="text-2xl font-mono text-amber-500">{nurseCount}</strong>
        </div>
        <div className="bg-white p-4.5 rounded-xl border border-gray-150 card-shadow">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Hospital Staff</span>
          <strong className="text-2xl font-mono text-success">{staffCount}</strong>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-gray-150 gap-4">
        <button
          onClick={() => setActiveTab('registry')}
          className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'registry'
              ? 'border-secondary text-secondary font-black'
              : 'border-transparent text-gray-400 hover:text-gray-600 font-medium'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Staff & Users Directory</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'logs'
              ? 'border-secondary text-secondary font-black'
              : 'border-transparent text-gray-400 hover:text-gray-600 font-medium'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>Vercel Backend Console Logs</span>
          <span className="bg-red-50 text-red-700 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold animate-pulse">
            LIVE
          </span>
        </button>
      </div>

      {activeTab === 'registry' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Create Staff Account Form */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-150 p-6 card-shadow space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <UserPlus className="h-5 w-5 text-secondary" />
            <h3 className="font-display font-bold text-gray-800 text-sm">Register Hospital Staff</h3>
          </div>

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-semibold">
              {success}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div>
              <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Olumide George"
                className="w-full text-xs p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary focus:border-secondary focus:outline-none"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. o.george@carebridge.com"
                className="w-full text-xs p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary focus:border-secondary focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">
                Role & Permission Tier <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full text-xs p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary focus:border-secondary focus:outline-none"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="admin">Administrator</option>
                <option value="doctor">Doctor (Medical Specialist)</option>
                <option value="nurse">Nurse (Triage Officer)</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="lab">Laboratory Scientist</option>
                <option value="receptionist">Receptionist (Admissions)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">
                Clinical Department (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Pediatrics, Cardiology, Pathology"
                className="w-full text-xs p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary focus:border-secondary focus:outline-none"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl space-y-1.5">
              <span className="text-[9px] font-mono font-bold text-primary block uppercase">🗝️ SECURITY CREDENTIAL NOTE</span>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Staff accounts are created secure by default. Their temporary password is set to <strong>password123</strong>.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-secondary hover:bg-secondary/90 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-secondary/10"
            >
              + Provision Staff Member
            </button>
          </form>
        </div>

        {/* Right Side: Manage Accounts Registry */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-150 p-6 card-shadow space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-display font-bold text-gray-800 text-sm">System Users Registry</h3>
            </div>
            <span className="text-xs font-mono font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded">
              Showing {filteredUsers.length} of {users.length} accounts
            </span>
          </div>

          {/* Controls: Search and Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, department..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400 shrink-0" />
              <select
                className="flex-1 text-xs p-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Filter: All Roles</option>
                <option value="admin">Administrators</option>
                <option value="doctor">Doctors</option>
                <option value="nurse">Nurses</option>
                <option value="pharmacist">Pharmacists</option>
                <option value="lab">Lab Staff</option>
                <option value="receptionist">Receptionists</option>
                <option value="patient">Patients</option>
              </select>
            </div>
          </div>

          {/* User database list */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-600">
              <thead className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Full Name & ID</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Access Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-gray-800">{u.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{u.id}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-gray-700">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono ${
                          u.role === 'admin'
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : u.role === 'doctor'
                            ? 'bg-teal-50 text-secondary border border-secondary/20'
                            : u.role === 'nurse'
                            ? 'bg-blue-50 text-primary border border-primary/20'
                            : u.role === 'patient'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-green-50 text-success border border-success/20'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-gray-500 font-medium">{u.department || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleStartEdit(u)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-gray-50 hover:bg-secondary hover:text-white border border-gray-200 hover:border-secondary text-gray-600 rounded-lg font-bold transition-all"
                        title="Edit information"
                      >
                        <Pencil className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-150 p-6 card-shadow space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-red-700 animate-pulse" />
              <div>
                <h3 className="font-display font-bold text-gray-800 text-sm">Vercel Runtime Logs Console</h3>
                <p className="text-[10px] text-gray-400 font-mono">Stream live standard output of backend serverless threads</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={triggerDiagnosticPing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-all animate-fade-in"
                title="Inserts a test log message into the system to verify streams are active"
              >
                <Flame className="h-3.5 w-3.5 animate-pulse" />
                <span>Test Ping Log</span>
              </button>
              <button
                type="button"
                onClick={() => fetchSystemLogs(false)}
                disabled={isLogLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg text-xs font-bold transition-all"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLogLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={clearLogsBuffer}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg text-xs font-bold transition-all"
                title="Clears the memory buffer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Filtering and Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter logs (e.g. error, mongo, api)..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                value={logsSearchQuery}
                onChange={(e) => setLogsSearchQuery(e.target.value)}
              />
              {logsSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLogsSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs font-mono">
              <label className="flex items-center gap-1.5 cursor-pointer text-gray-600 select-none">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-secondary focus:ring-secondary h-3.5 w-3.5"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span>Auto-Refresh (3s)</span>
              </label>
              
              <span className="text-gray-400">|</span>
              
              <span className="text-gray-500">
                Total Logs Buffered: <strong className="text-gray-700 font-bold">{systemLogs.length}</strong>
              </span>
            </div>
          </div>

          {logsError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-semibold">
              {logsError}
            </div>
          )}

          {/* Terminal Code Box */}
          <div className="relative">
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                BUFFER_STATUS: ACTIVE
              </span>
            </div>
            <div className="h-96 overflow-y-auto bg-gray-950 rounded-xl p-4 font-mono text-[11px] text-gray-300 leading-relaxed border border-gray-900 scrollbar-thin">
              {systemLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
                  <Terminal className="h-8 w-8 text-gray-700 animate-pulse" />
                  <p>Console buffer is empty. Trigger some system actions (like logging in, registering staff, or booking appointments) or click "Test Ping Log" to see outputs.</p>
                </div>
              ) : (
                <div className="space-y-1 text-left">
                  {systemLogs
                    .filter(log => log.toLowerCase().includes(logsSearchQuery.toLowerCase()))
                    .map((log, idx) => {
                      let colorClass = 'text-gray-300';
                      if (log.includes('[ERROR]')) {
                        colorClass = 'text-red-400 font-bold bg-red-950/20 px-1 rounded';
                      } else if (log.includes('[WARN]')) {
                        colorClass = 'text-amber-400 bg-amber-950/10 px-1 rounded';
                      } else if (log.includes('[INFO] 🔌 Successfully') || log.includes('✅') || log.includes('👍')) {
                        colorClass = 'text-emerald-400 font-medium';
                      } else if (log.includes('🚀') || log.includes('🧪')) {
                        colorClass = 'text-blue-400 font-bold';
                      }
                      return (
                        <div key={idx} className={`${colorClass} hover:bg-gray-900/50 py-0.5 transition-colors whitespace-pre-wrap font-mono`}>
                          {log}
                        </div>
                      );
                    })}
                  <div ref={terminalBottomRef} />
                </div>
              )}
            </div>
          </div>

          {/* Useful Sandbox DB configuration card */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 space-y-2 text-xs text-gray-600">
            <h4 className="font-bold text-gray-700 flex items-center gap-1.5">
              💡 Vercel Deployment Troubleshooting Guide
            </h4>
            <p className="leading-relaxed">
              Vercel executes applications using short-lived stateless Serverless functions. This means standard memory is recycled occasionally and direct file writes via <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800 font-mono">fs.writeFileSync</code> to the build folder are restricted.
            </p>
            <p className="leading-relaxed font-semibold text-secondary">
              We have fully resolved this constraint! CareBridge automatically detects the Vercel environment and routes the JSON file fallback database to the fully writable, ephemeral <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-850 font-mono">/tmp/local_db.json</code> directory. Your sandbox database will run smoothly on Vercel without crashing or throwing EROFS read-only errors!
            </p>
            <p className="leading-relaxed">
              If you wish to configure a persistent cloud database, simply declare your <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800 font-mono">MONGODB_URI</code> environment variable in your project's settings. Make sure to whitelist dynamic access from anywhere (<code className="bg-gray-200 px-1 py-0.5 rounded text-gray-850 font-mono">0.0.0.0/0</code>) in your MongoDB Atlas Network Access Panel so that Vercel's edge nodes are allowed to connect.
            </p>
          </div>
        </div>
      )}

      {/* Edit Staff Modal overlay */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-2xl max-w-md w-full space-y-5 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="h-4.5 w-4.5 text-secondary" />
                <h3 className="font-display font-bold text-gray-800 text-sm">Update Staff Information</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {editSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-semibold">
                {editSuccess}
              </div>
            )}

            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Olumide George"
                  className="w-full text-xs p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary focus:border-secondary focus:outline-none font-medium text-gray-800"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. o.george@carebridge.com"
                  className="w-full text-xs p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary focus:border-secondary focus:outline-none font-medium text-gray-800"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">
                  Role & Permission Tier <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full text-xs p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary focus:border-secondary focus:outline-none font-medium text-gray-800"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                >
                  <option value="admin">Administrator</option>
                  <option value="doctor">Doctor (Medical Specialist)</option>
                  <option value="nurse">Nurse (Triage Officer)</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="lab">Laboratory Scientist</option>
                  <option value="receptionist">Receptionist (Admissions)</option>
                  <option value="patient">Patient</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">
                  Clinical Department (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pediatrics, Cardiology, Pathology"
                  className="w-full text-xs p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary focus:border-secondary focus:outline-none font-medium text-gray-800"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-secondary hover:bg-secondary/90 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-secondary/10"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
