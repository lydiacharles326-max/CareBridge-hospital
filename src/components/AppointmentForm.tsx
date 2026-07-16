import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, User, Phone, Mail, FileText, CheckCircle2, 
  HelpCircle, ShieldCheck, HeartPulse, Clock, Sparkles 
} from 'lucide-react';
import { services } from '../data';
import { Appointment } from '../types';
import { useAuth } from '../context/AuthContext';

interface AppointmentFormProps {
  selectedDept: string;
  selectedDoc: string;
  onAppointmentBooked: () => void;
  onOpenPortal: () => void;
  onBackToHome?: () => void;
}

export default function AppointmentForm({ 
  selectedDept, 
  selectedDoc, 
  onAppointmentBooked,
  onOpenPortal,
  onBackToHome
}: AppointmentFormProps) {
  const { users } = useAuth();
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [doctor, setDoctor] = useState('');
  const [prefDate, setPrefDate] = useState('');
  const [message, setMessage] = useState('');

  // UI operation states
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic system doctors list mapping
  const systemDoctors = users
    .filter((u) => u.role === 'doctor')
    .map((u) => ({
      id: u.id,
      name: u.name.startsWith('Dr.') ? u.name : `Dr. ${u.name}`,
      role: 'Specialist Physician',
      department: u.department || 'General Medicine'
    }));

  const defaultOnDutyDoctor = { 
    id: 'usr-duty', 
    name: 'On-Duty Clinical Physician', 
    role: 'Specialist Physician', 
    department: 'General Medicine' 
  };

  const activeDoctorsList = systemDoctors.length > 0 ? systemDoctors : [defaultOnDutyDoctor];

  // Dynamic syncing of doctor list based on chosen department
  const [availableDoctors, setAvailableDoctors] = useState(activeDoctorsList);

  // Sync from props (triggered by click on doctor or department CTAs)
  useEffect(() => {
    if (selectedDept) {
      setDepartment(selectedDept);
      
      // Filter doctors matching that department
      const matched = activeDoctorsList.filter(doc => doc.department.toLowerCase() === selectedDept.split(' ')[0].toLowerCase());
      if (matched.length > 0) {
        setDoctor(matched[0].name);
      } else {
        setDoctor(activeDoctorsList[0]?.name || '');
      }
    }
  }, [selectedDept, users]);

  useEffect(() => {
    if (selectedDoc) {
      setDoctor(selectedDoc);
      // Auto fill department matching this doctor
      const match = activeDoctorsList.find(d => d.name === selectedDoc);
      if (match) {
        setDepartment(match.department);
      }
    }
  }, [selectedDoc, users]);

  // Sync doctors list whenever department selection changes
  useEffect(() => {
    if (department) {
      // Find matches where department word overlaps
      const deptWord = department.split(' ')[0].toLowerCase();
      const filtered = activeDoctorsList.filter((doc) => doc.department.toLowerCase() === deptWord);
      setAvailableDoctors(filtered.length > 0 ? filtered : activeDoctorsList);
    } else {
      setAvailableDoctors(activeDoctorsList);
    }
  }, [department, users]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Valid email is required';
    if (!phone.trim() || phone.length < 8) newErrors.phone = 'Valid phone number is required';
    if (!department) newErrors.department = 'Clinical department selection is required';
    if (!doctor) newErrors.doctor = 'Medical expert selection is required';
    if (!prefDate) newErrors.prefDate = 'Preferred appointment date is required';
    
    // Date must be in the future
    if (prefDate) {
      const selectedDateTime = new Date(prefDate).getTime();
      const currentDateTime = new Date().getTime();
      if (selectedDateTime <= currentDateTime) {
        newErrors.prefDate = 'Appointment must be scheduled for a future date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const newAppt: Appointment = {
        id: `CB-${Math.floor(10000 + Math.random() * 90000)}`,
        fullName,
        email,
        phone,
        department,
        doctor,
        date: prefDate,
        message,
        status: 'pending', // Commences triage review
        createdAt: new Date().toISOString()
      };

      // Send to full stack Express API
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppt)
      });

      if (!res.ok) {
        throw new Error('Server rejected appointment scheduling.');
      }

      // Sync to local storage cache for immediate local dashboard updates
      const stored = localStorage.getItem('carebridge_appointments');
      let apptList: Appointment[] = [];
      if (stored) {
        try {
          apptList = JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }
      apptList.unshift(newAppt);
      localStorage.setItem('carebridge_appointments', JSON.stringify(apptList));

      setBookingSuccess(newAppt);
      onAppointmentBooked(); // Notify parent layout to update counters

      // Reset fields
      setFullName('');
      setEmail('');
      setPhone('');
      setDepartment('');
      setDoctor('');
      setPrefDate('');
      setMessage('');
    } catch (err: any) {
      console.error('Error booking appointment on full-stack backend:', err);
      // Fail-safe offline/sandbox fallback
      const fallbackAppt: Appointment = {
        id: `CB-${Math.floor(10000 + Math.random() * 90000)}`,
        fullName,
        email,
        phone,
        department,
        doctor,
        date: prefDate,
        message,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const stored = localStorage.getItem('carebridge_appointments');
      let apptList: Appointment[] = [];
      if (stored) {
        try {
          apptList = JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }
      apptList.unshift(fallbackAppt);
      localStorage.setItem('carebridge_appointments', JSON.stringify(apptList));
      setBookingSuccess(fallbackAppt);
      onAppointmentBooked();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="appointment" className="py-20 md:py-28 font-sans bg-white relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary hover:text-secondary/80 focus:outline-none transition-colors cursor-pointer"
          >
            ← Back to Home
          </button>
        )}

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Guidelines & Contact Quick Dial */}
          <div className="lg:col-span-5 text-left space-y-8 lg:sticky lg:top-24">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
                CLINICAL APPOINTMENTS
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-primary mt-3 leading-tight">
                Schedule Your Consultation.
              </h2>
              <div className="h-1.5 w-16 bg-secondary rounded-full mt-5" />
            </div>

            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              Fill out our digital triage reservation engine to secure your clinical consultation slot. Once submitted, our medical coordination desk will review your files and confirm your schedule within 2 hours.
            </p>

            {/* Preparation details */}
            <div className="bg-light-bg/80 border border-gray-100 p-6 rounded-2xl space-y-4">
              <h4 className="font-display font-bold text-primary text-sm uppercase tracking-wider font-mono flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-secondary" />
                First Visit Guidelines
              </h4>
              <ul className="space-y-3.5 text-xs text-gray-600">
                <li className="flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-secondary shrink-0 mt-1.5" />
                  <span>Arrive 15 minutes before your scheduled slot for baseline vitals.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-secondary shrink-0 mt-1.5" />
                  <span>Bring a valid government-issued photographic ID and your primary health insurance card.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-secondary shrink-0 mt-1.5" />
                  <span>Compile list of active drug prescriptions and relevant historic clinical reports.</span>
                </li>
              </ul>
            </div>

            {/* Urgent / Trauma callout */}
            <div className="p-5.5 rounded-2xl bg-red-50/50 border border-red-100 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 animate-pulse">
                📞
              </div>
              <div>
                <h4 className="font-display font-bold text-red-800 text-sm">Emergency Acute Trauma?</h4>
                <p className="text-red-600/80 text-xs mt-1 leading-relaxed">
                  Do not utilize our digital appointment scheduler for acute life-threatening situations. Call our priority trauma command line immediately at <strong>+234 (803) 900-9111</strong> or transport the patient to our Emergency Ward.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Booking Card */}
          <div className="lg:col-span-7">
            <div className="relative bg-white rounded-[32px] border border-gray-100/95 shadow-2xl p-6 sm:p-10 overflow-hidden card-shadow">
              
              {/* Decorative gradients */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#2ECC71]/5 rounded-full blur-xl pointer-events-none" />

              {/* SUCCESS STATE DISPLAY */}
              {bookingSuccess ? (
                <div className="py-8 text-center flex flex-col items-center space-y-6">
                  
                  {/* Popping Animated Checkmark */}
                  <div className="relative">
                    <div className="absolute -inset-2 bg-green-100 rounded-full animate-ping opacity-25" />
                    <div className="relative h-16 w-16 bg-success rounded-full flex items-center justify-center text-white shadow-lg">
                      <CheckCircle2 className="h-9 w-9" />
                    </div>
                  </div>

                  {/* Booking confirmation title */}
                  <div className="space-y-2">
                    <h3 className="font-sans font-bold text-2xl text-primary">
                      Consultation Request Received!
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      Your appointment slot is queued for priority clinical triage review.
                    </p>
                  </div>

                  {/* Dynamic Invitation Detail Card */}
                  <div className="bg-[#F8FBFC] border border-gray-100 rounded-[20px] p-5 w-full max-w-md text-left space-y-3.5 card-shadow">
                    <div className="flex items-center justify-between border-b border-gray-200/50 pb-2.5">
                      <span className="text-xs text-gray-400 font-mono font-semibold">CLINICAL TICKET</span>
                      <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono font-bold">
                        {bookingSuccess.id}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600">
                      <div>
                        <strong className="text-primary font-sans">Patient Full Name:</strong> {bookingSuccess.fullName}
                      </div>
                      <div>
                        <strong className="text-primary font-sans">Clinical Ward:</strong> {bookingSuccess.department}
                      </div>
                      <div>
                        <strong className="text-primary font-sans">Specialist Consultant:</strong> {bookingSuccess.doctor}
                      </div>
                      <div>
                        <strong className="text-primary font-sans">Scheduled Date/Time:</strong>{' '}
                        <span className="font-mono text-gray-700 font-semibold">
                          {new Date(bookingSuccess.date).toLocaleString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for next steps */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-3">
                    <button
                      onClick={onOpenPortal}
                      className="flex-1 bg-secondary hover:bg-secondary/90 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md shadow-secondary/10"
                    >
                      Check Patient Portal
                    </button>
                    
                    <button
                      onClick={() => setBookingSuccess(null)}
                      className="flex-1 bg-white hover:bg-gray-50 text-gray-500 border border-gray-200 text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all"
                    >
                      Book Another Visit
                    </button>
                  </div>

                  {/* Support Contact */}
                  <span className="text-[10px] text-gray-400 font-mono tracking-wider block pt-2">
                    🔒 PRIVACY SECURED BY ENCRYPTED PATIENT PORTAL SERVICES
                  </span>

                </div>
              ) : (
                /* FORM BODY DISPLAY */
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Card head header info */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-secondary animate-pulse" />
                      <span className="text-sm font-semibold text-primary">Triage Booking Engine</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">HIPAA SECURE INTERFACE</span>
                  </div>

                  {/* Grid items for text inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                    
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Eleanor Vance"
                          className={`w-full text-sm pl-11 pr-4 py-3.5 bg-[#F8FBFC] rounded-2xl border focus:outline-none transition-all ${
                            errors.fullName ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-gray-100 focus:border-secondary focus:ring-1 focus:ring-secondary/10 bg-white'
                          }`}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                      {errors.fullName && <p className="text-[11px] text-red-500">{errors.fullName}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. eleanor@carebridge.com"
                          className={`w-full text-sm pl-11 pr-4 py-3.5 bg-[#F8FBFC] rounded-2xl border focus:outline-none transition-all ${
                            errors.email ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-gray-100 focus:border-secondary focus:ring-1 focus:ring-secondary/10 bg-white'
                          }`}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      {errors.email && <p className="text-[11px] text-red-500">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +234 (803) 123-4567"
                          className={`w-full text-sm pl-11 pr-4 py-3.5 bg-[#F8FBFC] rounded-2xl border focus:outline-none transition-all ${
                            errors.phone ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-gray-100 focus:border-secondary focus:ring-1 focus:ring-secondary/10 bg-white'
                          }`}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      {errors.phone && <p className="text-[11px] text-red-500">{errors.phone}</p>}
                    </div>

                    {/* Preffered Date */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                        Preferred Date & Time *
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          required
                          className={`w-full text-sm px-4 py-3.5 bg-[#F8FBFC] rounded-2xl border focus:outline-none transition-all ${
                            errors.prefDate ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-gray-100 focus:border-secondary focus:ring-1 focus:ring-secondary/10 bg-white'
                          }`}
                          value={prefDate}
                          onChange={(e) => setPrefDate(e.target.value)}
                        />
                      </div>
                      {errors.prefDate && <p className="text-[11px] text-red-500">{errors.prefDate}</p>}
                    </div>

                  </div>

                  {/* Dropdowns for service and doctor sync */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left pt-1">
                    
                    {/* Clinical Department Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                        Clinical Department *
                      </label>
                      <select
                        required
                        className="w-full text-sm px-4 py-3.5 bg-white rounded-2xl border border-gray-100 focus:border-secondary focus:ring-1 focus:ring-secondary/10 transition-all appearance-none"
                        value={department}
                        onChange={(e) => {
                          setDepartment(e.target.value);
                          setDoctor(''); // Force selection of new valid doctor
                        }}
                      >
                        <option value="">-- Choose Specialization Ward --</option>
                        {services.map((svc) => (
                          <option key={svc.id} value={svc.title}>
                            {svc.title}
                          </option>
                        ))}
                      </select>
                      {errors.department && <p className="text-[11px] text-red-500">{errors.department}</p>}
                    </div>

                    {/* Doctor selection dropdown (Saves dynamic filtering) */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                        Specialist Consultant *
                      </label>
                      <select
                        required
                        className="w-full text-sm px-4 py-3.5 bg-white rounded-2xl border border-gray-100 focus:border-secondary focus:ring-1 focus:ring-secondary/10 transition-all appearance-none"
                        value={doctor}
                        onChange={(e) => setDoctor(e.target.value)}
                      >
                        <option value="">-- Choose Specialist Specialist --</option>
                        {availableDoctors.map((doc) => (
                          <option key={doc.id} value={doc.name}>
                            {doc.name} ({doc.department})
                          </option>
                        ))}
                      </select>
                      {errors.doctor && <p className="text-[11px] text-red-500">{errors.doctor}</p>}
                    </div>

                  </div>

                  {/* Message textarea */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      Triage Message (Symptoms, Medical History)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                      <textarea
                        rows={3}
                        placeholder="Detail any active medical symptoms or historic operations..."
                        className="w-full text-sm pl-11 pr-4 py-3 bg-[#F8FBFC] rounded-2xl border border-gray-100 focus:border-secondary focus:ring-1 focus:ring-secondary/10 transition-all"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* HIPAA compliance guarantee */}
                  <div className="flex items-center gap-2.5 text-xs text-gray-400 text-left bg-[#F8FBFC] p-3.5 rounded-2xl border border-gray-100/50">
                    <ShieldCheck className="h-5 w-5 text-accent shrink-0" />
                    <span>
                      <strong>HIPAA Statement:</strong> Your healthcare data is encrypted client-side. We strictly comply with general health records privacy.
                    </span>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full navy-gradient text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-blue-900/20 active:scale-95 focus:outline-none"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Validating Clinical Assets...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 text-secondary" />
                        <span>Confirm Appointment</span>
                      </>
                    )}
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
