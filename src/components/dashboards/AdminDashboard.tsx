import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Users, UserPlus, ShieldAlert, Key, Clipboard, Trash, Filter, Search, ShieldCheck, Pencil, X } from 'lucide-react';

export default function AdminDashboard() {
  const { users, createStaffAccount, updateStaffAccount } = useAuth();
  
  // Manage staff states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('doctor');
  const [department, setDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

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
