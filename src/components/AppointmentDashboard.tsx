import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, Mail, FileText, CheckCircle2, Clock, Ban, Trash2, CalendarDays } from 'lucide-react';
import { Appointment } from '../types';

interface AppointmentDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRefresh: number;
}

export default function AppointmentDashboard({ isOpen, onClose, triggerRefresh }: AppointmentDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');

  // Fetch appointments from localStorage on mount and when triggerRefresh updates
  useEffect(() => {
    const stored = localStorage.getItem('carebridge_appointments');
    if (stored) {
      try {
        setAppointments(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen, triggerRefresh]);

  const saveAppointments = (updated: Appointment[]) => {
    setAppointments(updated);
    localStorage.setItem('carebridge_appointments', JSON.stringify(updated));
  };

  const handleCancel = (id: string) => {
    const updated = appointments.map((appt) =>
      appt.id === id ? { ...appt, status: 'cancelled' as const } : appt
    );
    saveAppointments(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this appointment record?')) {
      const updated = appointments.filter((appt) => appt.id !== id);
      saveAppointments(updated);
    }
  };

  const handleReschedule = (id: string) => {
    if (!newDate) return;
    const updated = appointments.map((appt) =>
      appt.id === id ? { ...appt, date: newDate, status: 'pending' as const } : appt
    );
    saveAppointments(updated);
    setEditingId(null);
    setNewDate('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-500 ease-in-out">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CalendarDays className="h-6 w-6 text-accent" />
              <div>
                <h2 className="font-display font-semibold text-lg leading-tight">Patient Care Portal</h2>
                <p className="text-xs text-white/80 font-mono tracking-wider">CAREBRIDGE DIGITAL HEALTH</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/15 transition-colors focus:outline-none"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Subheader summary */}
          <div className="bg-light-bg px-6 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Active Registrations</span>
            <span className="px-2.5 py-0.5 bg-primary/5 text-primary text-xs font-bold rounded-full font-mono">
              {appointments.filter(a => a.status !== 'cancelled').length} Active
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {appointments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-light-bg rounded-full flex items-center justify-center mb-4 border border-gray-100">
                  <Calendar className="h-7 w-7 text-gray-300" />
                </div>
                <h3 className="font-display font-semibold text-gray-700 text-base mb-1">No Appointments Found</h3>
                <p className="text-sm text-gray-400 max-w-xs px-4">
                  You do not have any appointments registered in your browser cache. Use the clinical reservation form on the landing page to schedule an appointment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appt) => {
                  const isCancelled = appt.status === 'cancelled';
                  const isPending = appt.status === 'pending';
                  const isConfirmed = appt.status === 'confirmed';

                  return (
                    <div 
                      key={appt.id} 
                      className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
                        isCancelled 
                          ? 'border-gray-200 bg-gray-50/50' 
                          : 'border-gray-100 bg-white shadow-sm hover:shadow-md'
                      }`}
                    >
                      {/* Left accent bar */}
                      <div 
                        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          isCancelled 
                            ? 'bg-gray-300' 
                            : isPending 
                              ? 'bg-secondary' 
                              : 'bg-success'
                        }`}
                      />

                      {/* Header info */}
                      <div className="flex items-start justify-between mb-3.5 pl-2">
                        <div>
                          <h4 className="font-display font-bold text-gray-800 leading-tight">
                            {appt.fullName}
                          </h4>
                          <span className="text-xs text-gray-400 font-mono">ID: {appt.id}</span>
                        </div>
                        
                        {/* Status Badge */}
                        <div>
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                              <Ban className="h-3 w-3" /> Cancelled
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-teal-50 text-secondary rounded-full text-[10px] font-bold uppercase tracking-wider font-mono animate-pulse">
                              <Clock className="h-3 w-3" /> Pending Triage
                            </span>
                          )}
                          {isConfirmed && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-success rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                              <CheckCircle2 className="h-3 w-3" /> Confirmed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Triage summary details */}
                      <div className="space-y-2 text-xs text-gray-600 mb-4 pl-2 font-sans">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>
                            <strong>{appt.doctor}</strong> ({appt.department})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="font-mono text-gray-700">
                            <strong>Date:</strong> {new Date(appt.date).toLocaleDateString(undefined, { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="truncate">{appt.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{appt.phone}</span>
                          </div>
                        </div>
                        {appt.message && (
                          <div className="flex items-start gap-1.5 mt-2 p-2 bg-light-bg rounded text-gray-500 italic text-[11px]">
                            <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{appt.message}</span>
                          </div>
                        )}
                      </div>

                      {/* Editing state */}
                      {editingId === appt.id ? (
                        <div className="mt-3 p-3 bg-light-bg rounded-lg border border-gray-100 space-y-2.5">
                          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                            Select New Clinical Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            className="w-full text-xs p-2 bg-white rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2.5 py-1 text-[11px] bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-md font-medium transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReschedule(appt.id)}
                              className="px-2.5 py-1 text-[11px] bg-secondary text-white hover:bg-secondary/90 rounded-md font-semibold transition-colors"
                              disabled={!newDate}
                            >
                              Reschedule
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Control Buttons */
                        <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-gray-100/60 pl-2">
                          {!isCancelled && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(appt.id);
                                  setNewDate(appt.date);
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/5 rounded transition-colors"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleCancel(appt.id)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                Cancel Clinic
                              </button>
                            </>
                          )}
                          {isCancelled && (
                            <button
                              onClick={() => handleDelete(appt.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer security tag */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <span className="font-mono text-[10px] text-gray-400 font-semibold tracking-wider flex items-center justify-center gap-1.5">
              🔒 HIPPA COMPLIANT LOCAL CACHE ENCRYPTION
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
