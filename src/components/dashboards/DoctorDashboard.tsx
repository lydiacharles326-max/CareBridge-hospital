import React, { useState, useEffect } from 'react';
import { Appointment, User, Prescription, LabRequest } from '../../types';
import { Calendar, User as UserIcon, FileText, Pill, FlaskConical, CheckCircle, Activity, Heart, Eye, ArrowRight, Save, RefreshCw } from 'lucide-react';

interface DoctorDashboardProps {
  currentUser: User;
}

export default function DoctorDashboard({ currentUser }: DoctorDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('active');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  // Forms for consultation
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [labTestType, setLabTestType] = useState('');
  const [labInstructions, setLabInstructions] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchAppointments = () => {
      const stored = localStorage.getItem('carebridge_appointments');
      if (stored) {
        try {
          const appts: Appointment[] = JSON.parse(stored);
          // Standard: Doctors can see all or those matching their specialty/name
          // To be inclusive, let's filter by the doctor's name (case insensitive match)
          // Since we seeded 'usr-doctor' with 'Dr. Chinedu Okafor', let's check
          const filtered = appts.filter(
            (a) =>
              a.doctor.toLowerCase().includes(currentUser.name.toLowerCase()) ||
              currentUser.name === 'Dr. Chinedu Okafor' || // handle fallback
              a.department.toLowerCase() === currentUser.department?.toLowerCase()
          );
          setAppointments(filtered);
        } catch (e) {
          console.error(e);
        }
      }
    };

    fetchAppointments();
    // Refresh database every 4 seconds or when tab changes
    const interval = setInterval(fetchAppointments, 4000);
    return () => clearInterval(interval);
  }, [currentUser, activeTab]);

  const saveAppointmentUpdate = (updatedAppt: Appointment) => {
    const stored = localStorage.getItem('carebridge_appointments');
    if (stored) {
      try {
        const appts: Appointment[] = JSON.parse(stored);
        const updatedList = appts.map((a) => (a.id === updatedAppt.id ? updatedAppt : a));
        localStorage.setItem('carebridge_appointments', JSON.stringify(updatedList));
        
        // Update local state
        setAppointments(
          updatedList.filter(
            (a) =>
              a.doctor.toLowerCase().includes(currentUser.name.toLowerCase()) ||
              currentUser.name === 'Dr. Chinedu Okafor' ||
              a.department.toLowerCase() === currentUser.department?.toLowerCase()
          )
        );
        
        if (selectedAppt?.id === updatedAppt.id) {
          setSelectedAppt(updatedAppt);
        }
        
        // Trigger generic storage event for syncing
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCheckIn = (appt: Appointment) => {
    const updated: Appointment = {
      ...appt,
      status: 'checked_in',
    };
    saveAppointmentUpdate(updated);
  };

  const handleSaveConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    let prescription: Prescription | undefined = undefined;
    if (medicineName.trim()) {
      prescription = {
        medicineName: medicineName.trim(),
        dosage: dosage.trim() || 'As directed',
        frequency: frequency.trim() || 'Once daily',
        status: 'pending',
        prescribedBy: currentUser.name,
        prescribedAt: new Date().toISOString(),
      };
    }

    let labRequest: LabRequest | undefined = undefined;
    if (labTestType.trim()) {
      labRequest = {
        testType: labTestType.trim(),
        instructions: labInstructions.trim() || 'Standard diagnostic protocol',
        status: 'pending',
        requestedBy: currentUser.name,
      };
    }

    const updated: Appointment = {
      ...selectedAppt,
      status: 'completed',
      message: clinicalNotes.trim() || selectedAppt.message,
      ...(prescription ? { prescription } : {}),
      ...(labRequest ? { labRequest } : {}),
    };

    saveAppointmentUpdate(updated);
    
    // Clear form
    setMedicineName('');
    setDosage('');
    setFrequency('');
    setLabTestType('');
    setLabInstructions('');
    setClinicalNotes('');
    
    setSuccessMessage('Consultation and clinical records completed successfully!');
    setTimeout(() => {
      setSuccessMessage('');
      setSelectedAppt(null);
    }, 3000);
  };

  // Filter based on selected Tab
  const pendingQueue = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed');
  const activeQueue = appointments.filter((a) => a.status === 'checked_in');
  const completedQueue = appointments.filter((a) => a.status === 'completed');

  const getActiveList = () => {
    if (activeTab === 'pending') return pendingQueue;
    if (activeTab === 'active') return activeQueue;
    return completedQueue;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-primary p-6 rounded-2xl text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-mono text-teal-300 font-bold uppercase tracking-wider">
              CareBridge Clinical Specialist Portal
            </span>
            <h2 className="text-2xl font-display font-extrabold">{currentUser.name}</h2>
            <p className="text-xs text-white/70 font-mono mt-1">
              Department: {currentUser.department || 'Cardiology'} • Clinical Coordinator ID: {currentUser.id}
            </p>
          </div>
          <div className="flex gap-4 text-center shrink-0">
            <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10">
              <span className="block text-xl font-bold font-mono">{activeQueue.length}</span>
              <span className="text-[10px] text-teal-200 font-semibold uppercase tracking-wider">Checked In</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10">
              <span className="block text-xl font-bold font-mono">{pendingQueue.length}</span>
              <span className="text-[10px] text-teal-200 font-semibold uppercase tracking-wider">Awaiting</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Queue List (Tabbed) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-150 p-5 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-display font-bold text-gray-800 text-sm">Patient Clinical Queue</h3>
            
            {/* Quick Refresh Icon */}
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin text-secondary" /> Auto-syncing
            </span>
          </div>

          {/* Queue Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 text-[11px] font-bold uppercase tracking-wide rounded-lg transition-all ${
                activeTab === 'pending' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Waiting ({pendingQueue.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`py-2 text-[11px] font-bold uppercase tracking-wide rounded-lg transition-all ${
                activeTab === 'active' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Triage ({activeQueue.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-2 text-[11px] font-bold uppercase tracking-wide rounded-lg transition-all ${
                activeTab === 'completed' ? 'bg-white text-success shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Consulted ({completedQueue.length})
            </button>
          </div>

          {/* Queue list */}
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {getActiveList().length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-xs text-gray-400 italic">No patients currently in this queue section.</p>
              </div>
            ) : (
              getActiveList().map((appt) => (
                <div
                  key={appt.id}
                  onClick={() => setSelectedAppt(appt)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    selectedAppt?.id === appt.id
                      ? 'border-secondary bg-secondary/5 ring-1 ring-secondary'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-display font-bold text-gray-800 text-xs">{appt.fullName}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {appt.id}</p>
                    </div>
                    <span className="text-[9px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">
                      {appt.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-gray-500">
                    <span className="font-mono">
                      {new Date(appt.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    {/* Visual alert if vitals have been logged */}
                    {appt.vitals ? (
                      <span className="text-red-500 font-semibold flex items-center gap-1 font-mono">
                        <Activity className="h-3 w-3 animate-pulse" /> Vitals Logged
                      </span>
                    ) : (
                      <span className="text-gray-400 italic font-mono">No triage vitals</span>
                    )}
                  </div>

                  {appt.status !== 'checked_in' && appt.status !== 'completed' && (
                    <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckIn(appt);
                        }}
                        className="px-3 py-1 bg-secondary hover:bg-secondary/90 text-white text-[9px] font-extrabold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1"
                      >
                        Check-in (Admit) <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Treatment / Consultation Area */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-150 p-6 card-shadow">
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {!selectedAppt ? (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center">
              <div className="h-14 w-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-gray-300" />
              </div>
              <h3 className="font-display font-semibold text-gray-700 text-sm mb-1">No Active Case Selected</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                Select a checked-in patient from the active Triage queue on the left to start writing clinical records, prescribing medication, or requesting laboratory testing.
              </p>
            </div>
          ) : (
            <div className="space-y-6 text-left">
              {/* Header Profile */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">
                      Active Case File
                    </span>
                    <h3 className="text-lg font-display font-extrabold text-primary">{selectedAppt.fullName}</h3>
                    <p className="text-xs text-gray-500 font-mono">
                      Email: {selectedAppt.email} • Phone: {selectedAppt.phone}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-secondary bg-secondary/5 px-3 py-1 rounded-full uppercase border border-secondary/15">
                    {selectedAppt.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Patient Vitals Card (Registered by Nurse) */}
              <div className="bg-red-50/20 rounded-xl border border-red-100 p-4 space-y-3">
                <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5 uppercase font-mono tracking-wide">
                  <Activity className="h-4 w-4" /> Registered Triage Vitals
                </h4>
                {selectedAppt.vitals ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Blood Pressure</span>
                      <strong className="text-gray-800 font-mono text-sm">{selectedAppt.vitals.bloodPressure} mmHg</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Heart Rate</span>
                      <strong className="text-gray-800 font-mono text-sm">{selectedAppt.vitals.heartRate} bpm</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Temperature</span>
                      <strong className="text-gray-800 font-mono text-sm">{selectedAppt.vitals.temperature} °C</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Body Weight</span>
                      <strong className="text-gray-800 font-mono text-sm">{selectedAppt.vitals.weight} kg</strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600/90 italic flex items-center gap-1 font-mono">
                    ⚠️ Clinical warning: Triage nurse has not registered patient vitals yet. Please coordinate check-in first.
                  </p>
                )}
                {selectedAppt.vitals && (
                  <span className="block text-[9px] text-gray-400 text-right">
                    Triage Nurse: {selectedAppt.vitals.registeredBy} • Registered: {new Date(selectedAppt.vitals.registeredAt).toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* Consultation and Treatment Logging Form */}
              {selectedAppt.status === 'completed' ? (
                <div className="space-y-4">
                  <div className="bg-green-50/20 border border-green-150 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-green-800 uppercase font-mono mb-2">Completed Consultation Records</h4>
                    <p className="text-xs text-gray-700 italic">" {selectedAppt.message || 'No specific clinical notes written.'} "</p>
                  </div>

                  {selectedAppt.prescription && (
                    <div className="bg-light-bg border border-gray-100 p-4 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 uppercase font-mono">
                        <Pill className="h-4 w-4 text-success" /> Synced Prescription Form
                      </h4>
                      <p className="text-xs font-bold text-gray-800">{selectedAppt.prescription.medicineName}</p>
                      <p className="text-[11px] text-gray-500">
                        Dosage: {selectedAppt.prescription.dosage} • Frequency: {selectedAppt.prescription.frequency}
                      </p>
                    </div>
                  )}

                  {selectedAppt.labRequest && (
                    <div className="bg-light-bg border border-gray-100 p-4 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 uppercase font-mono">
                        <FlaskConical className="h-4 w-4 text-amber-500" /> Lab Request
                      </h4>
                      <p className="text-xs font-bold text-gray-800">{selectedAppt.labRequest.testType}</p>
                      <p className="text-[11px] text-gray-500">Instructions: {selectedAppt.labRequest.instructions}</p>
                      <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Status: {selectedAppt.labRequest.status}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSaveConsultation} className="space-y-5">
                  {/* Clinical Consultation Notes */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Clinical Consultation Notes & Diagnosis
                    </label>
                    <textarea
                      required
                      placeholder="Write patient notes, symptoms, and diagnostic outcome..."
                      rows={3}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                    />
                  </div>

                  {/* Accordion prescription log */}
                  <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase font-mono">
                      <Pill className="h-4 w-4 text-success" /> Prescribe Medication (Optional)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-semibold uppercase mb-1">Medication Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Paracetamol"
                          className="w-full text-xs p-2 bg-white border border-gray-200 rounded focus:outline-none"
                          value={medicineName}
                          onChange={(e) => setMedicineName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-semibold uppercase mb-1">Dosage</label>
                        <input
                          type="text"
                          placeholder="e.g. 500mg"
                          className="w-full text-xs p-2 bg-white border border-gray-200 rounded focus:outline-none"
                          value={dosage}
                          onChange={(e) => setDosage(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-semibold uppercase mb-1">Frequency</label>
                        <input
                          type="text"
                          placeholder="e.g. Twice Daily"
                          className="w-full text-xs p-2 bg-white border border-gray-200 rounded focus:outline-none"
                          value={frequency}
                          onChange={(e) => setFrequency(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Laboratory Requests */}
                  <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase font-mono">
                      <FlaskConical className="h-4 w-4 text-amber-500" /> Order Diagnostic Lab Test (Optional)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-semibold uppercase mb-1">Lab Test Type</label>
                        <input
                          type="text"
                          placeholder="e.g. Full Blood Count"
                          className="w-full text-xs p-2 bg-white border border-gray-200 rounded focus:outline-none"
                          value={labTestType}
                          onChange={(e) => setLabTestType(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-semibold uppercase mb-1">Special Instructions</label>
                        <input
                          type="text"
                          placeholder="e.g. Fasting sample requested"
                          className="w-full text-xs p-2 bg-white border border-gray-200 rounded focus:outline-none"
                          value={labInstructions}
                          onChange={(e) => setLabInstructions(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="pt-2 border-t border-gray-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedAppt(null)}
                      className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Close Case
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-success text-white hover:bg-success/90 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-success/10"
                    >
                      <Save className="h-4 w-4" /> Save & Complete Consultation
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
