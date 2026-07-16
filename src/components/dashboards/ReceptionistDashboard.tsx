import React, { useState, useEffect } from 'react';
import { Appointment, User } from '../../types';
import { doctors } from '../../data';
import { Calendar, UserCheck, CalendarDays, Search, Trash2, Check, RefreshCw, X, FilePlus } from 'lucide-react';

interface ReceptionistDashboardProps {
  currentUser: User;
}

export default function ReceptionistDashboard({ currentUser }: ReceptionistDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Registration forms
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [department, setDepartment] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');

  // Notification states
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchBookings = () => {
    const stored = localStorage.getItem('carebridge_appointments');
    if (stored) {
      try {
        setAppointments(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update department selection automatically based on chosen doctor
  const handleDoctorChange = (docName: string) => {
    setDoctorName(docName);
    const matchedDoc = doctors.find((d) => d.name === docName);
    if (matchedDoc) {
      setDepartment(matchedDoc.department);
    }
  };

  const handleRegisterWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!fullName || !email || !phone || !doctorName || !date) {
      setError('Please fill out all required clinical fields.');
      return;
    }

    const newAppointment: Appointment = {
      id: `APT-${Math.floor(100000 + Math.random() * 900000)}`,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      doctor: doctorName,
      department: department || 'Cardiology',
      date,
      message: message.trim(),
      status: 'confirmed', // Walk-ins are instantly confirmed
      createdAt: new Date().toISOString(),
    };

    const updated = [newAppointment, ...appointments];
    localStorage.setItem('carebridge_appointments', JSON.stringify(updated));
    setAppointments(updated);

    // Reset Form
    setFullName('');
    setEmail('');
    setPhone('');
    setDoctorName('');
    setDepartment('');
    setDate('');
    setMessage('');

    setSuccess(`Successfully registered walk-in reservation for ${fullName}!`);
    setTimeout(() => setSuccess(''), 4000);

    window.dispatchEvent(new Event('storage'));
  };

  const handleStatusChange = (id: string, newStatus: 'confirmed' | 'cancelled' | 'checked_in') => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
    localStorage.setItem('carebridge_appointments', JSON.stringify(updated));
    setAppointments(updated);
    window.dispatchEvent(new Event('storage'));
  };

  // Filter listings
  const filteredBookings = appointments.filter(
    (a) =>
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone.includes(searchQuery) ||
      a.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-primary p-6 rounded-2xl text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-mono text-emerald-300 font-bold uppercase tracking-wider">
              CareBridge Front Desk Admissions Console
            </span>
            <h2 className="text-2xl font-display font-extrabold">{currentUser.name}</h2>
            <p className="text-xs text-white/70 font-mono mt-1">
              Clinic Reception Coordinator • Location: Garki, Abuja
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-center shrink-0 font-mono text-xs">
            📅 TOTAL ADMISSIONS: {appointments.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Admission & Booking Registrar */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-150 p-6 card-shadow space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <FilePlus className="h-5 w-5 text-secondary" />
            <h3 className="font-display font-bold text-gray-800 text-sm">Register Walk-In Patient</h3>
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

          <form onSubmit={handleRegisterWalkIn} className="space-y-4">
            <div>
              <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Patient Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Joy Nwosu"
                className="w-full text-xs p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="j.nwosu@gmail.com"
                  className="w-full text-xs p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 803 123 4567"
                  className="w-full text-xs p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Select Specialist *</label>
              <select
                required
                className="w-full text-xs p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none"
                value={doctorName}
                onChange={(e) => handleDoctorChange(e.target.value)}
              >
                <option value="">-- Choose Physician --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Appointment Date & Time *</label>
              <input
                type="datetime-local"
                required
                className="w-full text-xs p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Reason / Notes (Optional)</label>
              <input
                type="text"
                placeholder="Chief complaints, follow up etc."
                className="w-full text-xs p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-secondary hover:bg-secondary/90 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              + Commit Walk-In Booking
            </button>
          </form>
        </div>

        {/* Right Col: Master Bookings List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-150 p-6 card-shadow space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h3 className="font-display font-bold text-gray-800 text-sm">Admissions Dispatch Desk</h3>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient, doctor, code..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {filteredBookings.length === 0 ? (
              <div className="py-12 text-center text-gray-400 italic">No bookings found.</div>
            ) : (
              filteredBookings.map((b) => {
                const isCancelled = b.status === 'cancelled';
                const isPending = b.status === 'pending';
                const isConfirmed = b.status === 'confirmed';
                const isCheckedIn = b.status === 'checked_in';
                const isCompleted = b.status === 'completed';

                return (
                  <div key={b.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-all bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-extrabold text-gray-800 text-xs">{b.fullName}</h4>
                        <span className="text-[10px] font-mono text-gray-400">ID: {b.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase ${
                          isCancelled ? 'bg-gray-100 text-gray-400' : isCompleted ? 'bg-green-100 text-green-700' : 'bg-secondary/15 text-secondary'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 font-sans">
                        Physician: <strong>{b.doctor}</strong> • Contact: {b.phone}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        Date: {new Date(b.date).toLocaleString()}
                      </div>
                    </div>

                    {/* Action buttons to triage / check-in / cancel */}
                    <div className="flex gap-1.5 shrink-0">
                      {isPending && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'confirmed')}
                          className="px-2.5 py-1.5 bg-secondary text-white hover:bg-secondary/90 text-[10px] font-bold uppercase rounded"
                        >
                          Confirm
                        </button>
                      )}
                      {(isConfirmed || isPending) && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'checked_in')}
                          className="px-2.5 py-1.5 bg-primary text-white hover:bg-primary/90 text-[10px] font-bold uppercase rounded"
                        >
                          Check In
                        </button>
                      )}
                      {!isCancelled && !isCompleted && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'cancelled')}
                          className="px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-[10px] font-bold uppercase rounded"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
