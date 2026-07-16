import React, { useState } from 'react';
import { Star, Calendar, Award, ShieldCheck, Heart, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Doctor } from '../types';

interface DoctorsProps {
  onSelectDoctor: (doctorName: string, deptName: string) => void;
}

export default function Doctors({ onSelectDoctor }: DoctorsProps) {
  const { users } = useAuth();
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Convert registered system staff of role 'doctor' into UI Doctor models dynamically
  const systemDoctors: Doctor[] = users
    .filter((u) => u.role === 'doctor')
    .map((u, index) => {
      // Pick a professional medical avatar placeholder based on index
      const avatars = [
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop'
      ];
      const avatarUrl = avatars[index % avatars.length];

      return {
        id: u.id,
        name: u.name.startsWith('Dr.') ? u.name : `Dr. ${u.name}`,
        role: 'Specialist Physician',
        department: u.department || 'General Medicine',
        experience: 'Consultant',
        rating: 5.0,
        image: avatarUrl,
        bio: `Dr. ${u.name.replace(/^Dr\.\s+/i, '')} is a dedicated medical specialist in the ${u.department || 'General Medicine'} department at CareBridge, providing state-of-the-art diagnostics and personalized care paths.`,
        schedule: ['Monday', 'Tuesday', 'Thursday']
      };
    });

  const filters = ['All', 'Cardiology', 'Pediatrics', 'Neurology', 'Orthopedics'];

  const filteredDoctors = systemDoctors.filter((doc) => {
    return activeFilter === 'All' || doc.department.toLowerCase() === activeFilter.toLowerCase();
  });

  const handleBookDoctor = (doc: Doctor) => {
    onSelectDoctor(doc.name, doc.department);
    
    // Smooth scroll to appointment form
    const bookingSection = document.getElementById('appointment');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="doctors" className="py-20 md:py-28 font-sans bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
            MEET OUR CLINICAL SPECIALISTS
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-primary mt-3">
            World-Class Medical Experts, <br />Empathetic Clinical Leaders.
          </h2>
          <div className="h-1.5 w-16 bg-secondary rounded-full mx-auto mt-5" />
        </div>

        {systemDoctors.length > 0 ? (
          <>
            {/* Doctor Filters */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 border focus:outline-none ${
                    activeFilter === filter
                      ? 'bg-secondary text-white border-secondary shadow-md shadow-secondary/15'
                      : 'bg-white text-primary/70 hover:bg-gray-50 hover:text-primary border-gray-100'
                  }`}
                >
                  {filter === 'All' ? 'All Specialists' : `${filter} Care`}
                </button>
              ))}
            </div>

            {/* Doctor Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="group bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-secondary/10 transition-all duration-500 overflow-hidden flex flex-col justify-between card-shadow"
                >
                  {/* Photo Area with overlay elements */}
                  <div className="relative aspect-[3/4] bg-[#F8FBFC] overflow-hidden">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Gradient vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-80" />

                    {/* Micro Accreditations */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/95 backdrop-blur shadow rounded-full text-[9px] font-mono font-bold text-primary tracking-wider uppercase">
                        <ShieldCheck className="h-3 w-3 text-secondary" />
                        Board Certified
                      </span>
                    </div>

                    {/* Doctor Basic Quick Details on Card Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-secondary font-bold">
                        {doc.role}
                      </span>
                      <h3 className="font-sans font-bold text-lg leading-tight mt-0.5">
                        {doc.name}
                      </h3>
                    </div>
                  </div>

                  {/* Bio & Details Area */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    
                    {/* Bio paragraph & Rating */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 font-semibold border-b border-gray-50 pb-2.5">
                        <span className="font-mono text-gray-400">{doc.experience}</span>
                        <div className="flex items-center gap-1 text-[#F1C40F]">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="font-mono text-primary font-bold">{doc.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                        {doc.bio}
                      </p>
                    </div>

                    {/* Clinician schedule */}
                    <div className="bg-[#F8FBFC] p-3 rounded-xl border border-gray-100">
                      <span className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest font-semibold mb-1">
                        Clinical Schedule
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {doc.schedule.map((day) => (
                          <span 
                            key={day}
                            className="px-2 py-0.5 bg-white text-[10px] font-sans font-medium text-primary/75 rounded border border-gray-100 shadow-2xs"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Book Doctor Button */}
                    <button
                      onClick={() => handleBookDoctor(doc)}
                      className="w-full bg-secondary hover:bg-secondary/90 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-md active:scale-95 cursor-pointer focus:outline-none shadow-md shadow-secondary/15"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Book Consult</span>
                    </button>

                  </div>
                </div>
              ))}
              {filteredDoctors.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 font-medium text-sm">
                  No specialists are currently registered under the "{activeFilter}" department.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto bg-[#F8FBFC] border border-gray-150 rounded-3xl p-8 text-center space-y-4">
            <div className="mx-auto h-12 w-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h4 className="font-display font-extrabold text-primary text-base">Clinical Directory Standby</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Our specialist rosters are being updated. Administrators can securely onboard clinical practitioners and staff members using the <strong>CareBridge Portal</strong> to list them here.
              </p>
              <p className="text-[11px] text-gray-400 mt-1 italic">
                Direct emergency triage, walk-ins, and on-call consulting remain open 24/7.
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
