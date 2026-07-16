import React, { useState, useEffect } from 'react';
import { Appointment, User } from '../../types';
import { Calendar, User as UserIcon, Activity, Pill, FlaskConical, Clock, Trash2, Ban, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface PatientDashboardProps {
  currentUser: User;
  onClose: () => void;
  onNavigateToBooking?: () => void;
}

export default function PatientDashboard({ currentUser, onClose, onNavigateToBooking }: PatientDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('carebridge_appointments');
    if (stored) {
      try {
        const appts: Appointment[] = JSON.parse(stored);
        // Filter appointments belonging to this patient's email
        const myAppts = appts.filter(
          (a) => a.email.toLowerCase() === currentUser.email.toLowerCase()
        );
        setAppointments(myAppts);
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUser.email, refreshTrigger]);

  const triggerRefresh = () => {
    setRefreshTrigger((p) => p + 1);
    // Also trigger navbar refresh if any
    window.dispatchEvent(new Event('storage'));
  };

  const handleCancel = (id: string) => {
    const stored = localStorage.getItem('carebridge_appointments');
    if (stored) {
      try {
        const appts: Appointment[] = JSON.parse(stored);
        const updated = appts.map((appt) =>
          appt.id === id ? { ...appt, status: 'cancelled' as const } : appt
        );
        localStorage.setItem('carebridge_appointments', JSON.stringify(updated));
        triggerRefresh();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleReschedule = (id: string) => {
    if (!newDate) return;
    const stored = localStorage.getItem('carebridge_appointments');
    if (stored) {
      try {
        const appts: Appointment[] = JSON.parse(stored);
        const updated = appts.map((appt) =>
          appt.id === id ? { ...appt, date: newDate, status: 'pending' as const } : appt
        );
        localStorage.setItem('carebridge_appointments', JSON.stringify(updated));
        setEditingId(null);
        setNewDate('');
        triggerRefresh();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleScrollToBooking = () => {
    onClose();
    if (onNavigateToBooking) {
      onNavigateToBooking();
    } else {
      setTimeout(() => {
        const el = document.getElementById('appointment');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  };

  // Extract vitals, prescriptions, and lab tests from past and active appointments
  const activeAppointmentsWithVitals = appointments.filter((a) => a.vitals);
  const activeAppointmentsWithPrescriptions = appointments.filter((a) => a.prescription);
  const activeAppointmentsWithLabs = appointments.filter((a) => a.labRequest);

  return (
    <div className="space-y-6">
      {/* Patient welcome card */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/5 to-white p-6 rounded-2xl border border-primary/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <UserIcon className="h-7 w-7" />
            </div>
            <div>
              <span className="block text-xs font-mono text-gray-400 font-bold uppercase tracking-wider">Patient Command Dashboard</span>
              <h2 className="text-xl font-display font-extrabold text-primary">Welcome, {currentUser.name}</h2>
              <p className="text-xs text-gray-500 font-mono mt-0.5">Patient ID: {currentUser.id} • Registered: {new Date(currentUser.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <button
            onClick={handleScrollToBooking}
            className="px-5 py-2.5 bg-secondary hover:bg-secondary/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-secondary/10 shrink-0 self-start sm:self-center"
          >
            + Register New Appointment
          </button>
        </div>
      </div>

      {/* Main bento grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Appointment list */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-gray-800 text-base flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-secondary" />
              My Clinical Consultations
            </h3>
            <span className="text-xs font-mono text-gray-400 font-semibold">{appointments.length} Total</span>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center card-shadow">
              <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-gray-300" />
              </div>
              <h4 className="font-display font-semibold text-gray-700 text-sm mb-1">No Active Appointments Found</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                You do not have any appointments recorded under your account. Register an appointment using the general clinical scheduling tool.
              </p>
              <button
                onClick={handleScrollToBooking}
                className="px-4 py-2 border border-secondary text-secondary hover:bg-secondary/5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                Schedule First Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appt) => {
                const isCancelled = appt.status === 'cancelled';
                const isPending = appt.status === 'pending';
                const isConfirmed = appt.status === 'confirmed';
                const isCheckedIn = appt.status === 'checked_in';
                const isCompleted = appt.status === 'completed';

                return (
                  <div
                    key={appt.id}
                    className={`relative overflow-hidden rounded-xl border p-4 bg-white transition-all ${
                      isCancelled ? 'border-gray-100 opacity-75' : 'border-gray-150/80 hover:shadow-md'
                    }`}
                  >
                    {/* Status side accent */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        isCancelled
                          ? 'bg-gray-300'
                          : isPending
                          ? 'bg-amber-400'
                          : isConfirmed
                          ? 'bg-secondary'
                          : isCheckedIn
                          ? 'bg-primary'
                          : 'bg-success'
                      }`}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pl-2.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-bold text-gray-800 text-sm">
                            Clinic Session with {appt.doctor}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono ${
                              isCancelled
                                ? 'bg-gray-100 text-gray-500'
                                : isPending
                                ? 'bg-amber-50 text-amber-700'
                                : isConfirmed
                                ? 'bg-teal-50 text-secondary'
                                : isCheckedIn
                                ? 'bg-blue-50 text-primary'
                                : 'bg-green-50 text-success'
                            }`}
                          >
                            {appt.status.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">Reference Code: {appt.id}</span>
                      </div>

                      <span className="text-[11px] font-mono font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {appt.department}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2.5 text-xs text-gray-600">
                      <div>
                        <strong>Scheduled Date:</strong>{' '}
                        <span className="font-mono text-gray-700">
                          {new Date(appt.date).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <div>
                        <strong>Contact Phone:</strong> <span className="font-mono text-gray-700">{appt.phone}</span>
                      </div>
                    </div>

                    {appt.message && (
                      <div className="mt-2.5 mx-2.5 p-2 bg-gray-50/70 rounded text-[11px] text-gray-500 italic">
                        " {appt.message} "
                      </div>
                    )}

                    {/* Action Panel */}
                    {!isCancelled && !isCompleted && (
                      <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-end gap-2">
                        {editingId === appt.id ? (
                          <div className="w-full flex flex-col sm:flex-row items-center gap-2">
                            <input
                              type="datetime-local"
                              className="w-full sm:flex-1 text-xs p-1.5 border border-gray-200 rounded"
                              value={newDate}
                              onChange={(e) => setNewDate(e.target.value)}
                            />
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2.5 py-1 text-[10px] font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 rounded"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReschedule(appt.id)}
                                className="px-2.5 py-1 text-[10px] font-bold bg-secondary text-white rounded"
                                disabled={!newDate}
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(appt.id);
                                setNewDate(appt.date);
                              }}
                              className="px-2.5 py-1 text-[10px] font-bold text-primary hover:bg-primary/5 rounded transition-all"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancel(appt.id)}
                              className="px-2.5 py-1 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded transition-all"
                            >
                              Cancel Booking
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right col: Clinical results & records */}
        <div className="space-y-6">
          {/* Vitals logs panel */}
          <div className="bg-white rounded-2xl border border-gray-150/80 p-5 card-shadow space-y-4">
            <h3 className="font-display font-bold text-gray-800 text-sm flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-red-400" />
              My Clinical Vitals
            </h3>

            {activeAppointmentsWithVitals.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2">
                No vitals recorded yet. Once you check in at the clinic, your triage nurse will register your vitals here.
              </p>
            ) : (
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {activeAppointmentsWithVitals.map((a) => (
                  <div key={a.id} className="p-3 bg-red-50/30 rounded-xl border border-red-100/60 space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span className="font-semibold">By: {a.vitals?.registeredBy}</span>
                      <span className="font-mono">{a.vitals ? new Date(a.vitals.registeredAt).toLocaleDateString() : ''}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold uppercase">Blood Pressure</span>
                        <strong className="text-gray-800 font-mono">{a.vitals?.bloodPressure} mmHg</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold uppercase">Heart Rate</span>
                        <strong className="text-gray-800 font-mono">{a.vitals?.heartRate} bpm</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold uppercase">Temperature</span>
                        <strong className="text-gray-800 font-mono">{a.vitals?.temperature} °C</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold uppercase">Weight</span>
                        <strong className="text-gray-800 font-mono">{a.vitals?.weight} kg</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Prescriptions panel */}
          <div className="bg-white rounded-2xl border border-gray-150/80 p-5 card-shadow space-y-4">
            <h3 className="font-display font-bold text-gray-800 text-sm flex items-center gap-2">
              <Pill className="h-4.5 w-4.5 text-success" />
              My Prescribed Medications
            </h3>

            {activeAppointmentsWithPrescriptions.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2">
                No active prescriptions recorded. If your doctor prescribes medication, details will sync here for the pharmacy.
              </p>
            ) : (
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {activeAppointmentsWithPrescriptions.map((a) => (
                  <div key={a.id} className="p-3 bg-green-50/20 rounded-xl border border-green-100/50 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono font-bold text-success uppercase">
                        {a.prescription?.status === 'dispensed' ? '● Dispensed' : '○ Pending Dispense'}
                      </span>
                      <span className="text-gray-400 font-mono">{a.prescription ? new Date(a.prescription.prescribedAt).toLocaleDateString() : ''}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">{a.prescription?.medicineName}</h4>
                      <p className="text-[11px] text-gray-500">Dosage: {a.prescription?.dosage} • Frequency: {a.prescription?.frequency}</p>
                    </div>
                    <span className="block text-[10px] text-gray-400 text-right">Prescribed by: {a.prescription?.prescribedBy}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Diagnostic Laboratory reports */}
          <div className="bg-white rounded-2xl border border-gray-150/80 p-5 card-shadow space-y-4">
            <h3 className="font-display font-bold text-gray-800 text-sm flex items-center gap-2">
              <FlaskConical className="h-4.5 w-4.5 text-amber-500" />
              Clinical Lab Reports
            </h3>

            {activeAppointmentsWithLabs.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2">
                No diagnostic test requests or laboratory results registered.
              </p>
            ) : (
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {activeAppointmentsWithLabs.map((a) => (
                  <div key={a.id} className="p-3 bg-amber-50/20 rounded-xl border border-amber-100/50 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className={`font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                        a.labRequest?.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {a.labRequest?.status}
                      </span>
                      <span className="text-gray-400 font-mono">By: {a.doctor}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">{a.labRequest?.testType}</h4>
                      <p className="text-[11px] text-gray-500 italic mt-0.5">Instructions: {a.labRequest?.instructions}</p>
                    </div>
                    {a.labRequest?.status === 'completed' ? (
                      <div className="p-2 bg-white rounded border border-amber-100 text-xs">
                        <span className="block text-[10px] text-gray-400 font-semibold uppercase">Lab Result Outcome:</span>
                        <p className="text-gray-700 font-medium mt-0.5">{a.labRequest.result}</p>
                        <span className="block text-[9px] text-gray-400 text-right mt-1">Authorized: {a.labRequest.completedBy}</span>
                      </div>
                    ) : (
                      <span className="block text-[10px] text-amber-600/80 italic">Awaiting sample testing...</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
