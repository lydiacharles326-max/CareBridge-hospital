import React, { useState, useEffect } from 'react';
import { Appointment, User, Vitals } from '../../types';
import { Activity, Search, RefreshCw, ClipboardList, CheckCircle2, Heart, Scale, Thermometer } from 'lucide-react';

interface NurseDashboardProps {
  currentUser: User;
}

export default function NurseDashboard({ currentUser }: NurseDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  
  // Triage forms
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weight, setWeight] = useState('');
  const [success, setSuccess] = useState('');

  const fetchQueue = () => {
    const stored = localStorage.getItem('carebridge_appointments');
    if (stored) {
      try {
        const appts: Appointment[] = JSON.parse(stored);
        // Nurses manage all active clinical appointments that are pending, confirmed, or checked-in
        const activeQueue = appts.filter((a) => a.status !== 'cancelled' && a.status !== 'completed');
        setAppointments(activeQueue);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRegisterVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    const vitals: Vitals = {
      bloodPressure: bloodPressure.trim(),
      heartRate: heartRate.trim(),
      temperature: temperature.trim(),
      weight: weight.trim(),
      registeredBy: currentUser.name,
      registeredAt: new Date().toISOString(),
    };

    const updatedAppt: Appointment = {
      ...selectedAppt,
      vitals,
      // Auto-check in if vitals are registered so that they move immediately to the doctor's action queue
      status: 'checked_in',
    };

    const stored = localStorage.getItem('carebridge_appointments');
    if (stored) {
      try {
        const appts: Appointment[] = JSON.parse(stored);
        const updatedList = appts.map((a) => (a.id === selectedAppt.id ? updatedAppt : a));
        localStorage.setItem('carebridge_appointments', JSON.stringify(updatedList));
        
        // Refresh local queues
        setAppointments(updatedList.filter((a) => a.status !== 'cancelled' && a.status !== 'completed'));
        
        setBloodPressure('');
        setHeartRate('');
        setTemperature('');
        setWeight('');
        setSuccess(`Triage vitals recorded successfully for ${selectedAppt.fullName}! Patient is now admitted into the physician waiting room.`);
        setSelectedAppt(null);

        setTimeout(() => {
          setSuccess('');
        }, 4000);

        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-800 to-primary p-6 rounded-2xl text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-mono text-blue-300 font-bold uppercase tracking-wider">
              CareBridge Outpatient Triage Portal
            </span>
            <h2 className="text-2xl font-display font-extrabold">{currentUser.name}</h2>
            <p className="text-xs text-white/70 font-mono mt-1">
              Registered Nurse (RN) • Department: {currentUser.department || 'Outpatients Triage'}
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-center shrink-0">
            <span className="block text-xl font-bold font-mono">
              {appointments.filter((a) => !a.vitals).length}
            </span>
            <span className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">Awaiting Triage</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Daily Triage Queue */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-150 p-5 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-display font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <ClipboardList className="h-4.5 w-4.5 text-primary" /> Active Clinic Intake
            </h3>
            <span className="text-[10px] font-mono text-gray-400 font-bold flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin text-secondary" /> Syncing Live
            </span>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {appointments.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-xs text-gray-400 italic">No patients currently requiring triage checks.</p>
              </div>
            ) : (
              appointments.map((appt) => (
                <div
                  key={appt.id}
                  onClick={() => {
                    setSelectedAppt(appt);
                    if (appt.vitals) {
                      setBloodPressure(appt.vitals.bloodPressure);
                      setHeartRate(appt.vitals.heartRate);
                      setTemperature(appt.vitals.temperature);
                      setWeight(appt.vitals.weight);
                    } else {
                      setBloodPressure('');
                      setHeartRate('');
                      setTemperature('');
                      setWeight('');
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    selectedAppt?.id === appt.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-display font-bold text-gray-800 text-xs">{appt.fullName}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">Contact: {appt.phone}</p>
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                      {appt.department}
                    </span>
                  </div>

                  <div className="mt-2.5 flex justify-between items-center text-[10px] text-gray-500">
                    <span className="font-medium text-gray-600">Session with {appt.doctor}</span>
                    <div>
                      {appt.vitals ? (
                        <span className="text-success font-semibold flex items-center gap-0.5 font-mono">
                          ✓ Vitals Logged
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold flex items-center gap-1 font-mono animate-pulse">
                          ⚠️ Needs Intake
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Log Vitals Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-150 p-6 card-shadow">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5" />
              <span>{success}</span>
            </div>
          )}

          {!selectedAppt ? (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center">
              <div className="h-14 w-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4 text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-gray-700 text-sm mb-1">Select Patient Intake</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                Select an active outpatient from the intake queue list on the left to measure and register clinical triage vitals before they meet their consulting physician.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">
                  Outpatient Intake File
                </span>
                <h3 className="text-lg font-display font-extrabold text-primary">{selectedAppt.fullName}</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  Assigned Physician: {selectedAppt.doctor} ({selectedAppt.department})
                </p>
              </div>

              <form onSubmit={handleRegisterVitals} className="space-y-5">
                <h4 className="text-xs font-bold text-gray-700 uppercase font-mono tracking-wide">
                  Clinical Measurement Panel
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Blood Pressure */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-red-500" /> Blood Pressure <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. 120/80"
                        className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                        value={bloodPressure}
                        onChange={(e) => setBloodPressure(e.target.value)}
                      />
                      <span className="absolute right-3 top-3 text-[10px] text-gray-400 font-mono font-bold">mmHg</span>
                    </div>
                  </div>

                  {/* Heart Rate */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5 text-primary" /> Heart Rate <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        placeholder="e.g. 72"
                        className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value)}
                      />
                      <span className="absolute right-3 top-3 text-[10px] text-gray-400 font-mono font-bold">bpm</span>
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Thermometer className="h-3.5 w-3.5 text-amber-500" /> Body Temperature <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. 36.8"
                        className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                      />
                      <span className="absolute right-3 top-3 text-[10px] text-gray-400 font-mono font-bold">°C</span>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Scale className="h-3.5 w-3.5 text-success" /> Body Weight <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. 74.5"
                        className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                      <span className="absolute right-3 top-3 text-[10px] text-gray-400 font-mono font-bold">kg</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedAppt(null)}
                    className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-primary/10"
                  >
                    ✓ Log Vitals & Admit
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
