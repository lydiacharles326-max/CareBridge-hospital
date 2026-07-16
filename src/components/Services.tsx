import React, { useState } from 'react';
import { 
  Search, X, Calendar, ArrowRight, Activity, Heart, 
  Baby, Bone, Brain, Smile, Eye, ShieldAlert, FlaskConical, Pill, LucideProps
} from 'lucide-react';
import { services } from '../data';
import { Service } from '../types';

// Map icon string names to React elements
const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Activity: Activity,
  Heart: Heart,
  Baby: Baby,
  Bone: Bone,
  Brain: Brain,
  Smile: Smile,
  Eye: Eye,
  ShieldAlert: ShieldAlert,
  FlaskConical: FlaskConical,
  Pills: Pill,
};

interface ServicesProps {
  onSelectDepartment: (deptName: string) => void;
}

export default function Services({ onSelectDepartment }: ServicesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'primary' | 'specialized' | 'ancillary'>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Categories definition
  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'primary', label: 'Primary Care' },
    { id: 'specialized', label: 'Specialized Centers' },
    { id: 'ancillary', label: 'Diagnostics & Support' }
  ];

  // Helper to resolve service category
  const getCategory = (id: string): string => {
    if (['general', 'pediatrics', 'dentistry'].includes(id)) return 'primary';
    if (['cardiology', 'orthopedics', 'neurology', 'emergency'].includes(id)) return 'specialized';
    return 'ancillary';
  };

  const filteredServices = services.filter((svc) => {
    const matchesSearch = svc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          svc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          svc.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || getCategory(svc.id) === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleServiceSelect = (svc: Service) => {
    setSelectedService(svc);
  };

  const handleBookService = (svc: Service) => {
    setSelectedService(null);
    onSelectDepartment(svc.title); // Trigger state injection to form
    
    // Smooth scroll to appointment form
    const bookingSection = document.getElementById('appointment');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-20 md:py-28 font-sans bg-light-bg/50 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
            OUR DEPARTMENTS & SERVICES
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-primary mt-3">
            Elite Medical Specialties, <br />Personalized Solutions.
          </h2>
          <div className="h-1.5 w-16 bg-secondary rounded-full mx-auto mt-5" />
        </div>

        {/* Filters and Search Dashboard */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white p-4.5 rounded-[24px] border border-gray-100 card-shadow">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-4.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 focus:outline-none ${
                  activeCategory === cat.id
                    ? 'bg-secondary text-white shadow-lg shadow-secondary/15'
                    : 'bg-[#F8FBFC] text-primary/70 hover:bg-gray-100 hover:text-primary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search medical specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm pl-11 pr-4 py-3 bg-[#F8FBFC] border border-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-3.5 p-0.5 text-gray-400 hover:text-primary focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[24px] border border-gray-100 card-shadow max-w-lg mx-auto">
            <p className="text-gray-400 font-sans">No clinical services found matching your parameters.</p>
            <button 
              onClick={() => { setSearchTerm(''); setActiveCategory('all'); }} 
              className="mt-4 text-xs font-bold uppercase tracking-wider text-secondary underline hover:text-primary"
            >
              Reset Search Parameters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((svc) => {
              const IconComponent = iconMap[svc.iconName] || Activity;
              return (
                <div
                  key={svc.id}
                  onClick={() => handleServiceSelect(svc)}
                  className="group relative bg-white p-8 service-card card-shadow cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Icon container */}
                    <div className="h-14 w-14 rounded-xl bg-[#22B8B5]/5 border border-[#22B8B5]/15 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-7 w-7" />
                    </div>

                    {/* Meta */}
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                      {svc.department}
                    </span>

                    {/* Heading */}
                    <h3 className="font-sans font-bold text-lg text-primary mt-2 group-hover:text-secondary transition-colors">
                      {svc.title}
                    </h3>

                    {/* Desc */}
                    <p className="text-gray-400 text-sm mt-3 leading-relaxed line-clamp-3">
                      {svc.description}
                    </p>
                  </div>

                  {/* Arrow action indicator */}
                  <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-secondary mt-6 transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300">
                    <span>Clinical Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Specialty Clinical Detail Modal (Glassmorphic) */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto">
          {/* Backdrop blur */}
          <div 
            className="fixed inset-0 bg-primary/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedService(null)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden transform transition-all z-10">
            
            {/* Gradient Header */}
            <div className="navy-gradient text-white p-6 relative">
              <button
                onClick={() => setSelectedService(null)}
                className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white">
                  {React.createElement(iconMap[selectedService.iconName] || Activity, { className: 'h-7 w-7' })}
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/70 font-semibold">
                    {selectedService.department} DIVISION
                  </span>
                  <h3 className="font-sans font-bold text-2xl leading-none mt-1">
                    {selectedService.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              
              {/* Clinical Description */}
              <div className="space-y-2.5">
                <h4 className="font-sans font-bold text-gray-800 text-sm uppercase tracking-wider font-mono">
                  Clinical Overview
                </h4>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                  {selectedService.description}
                </p>
              </div>

              {/* Service Features list */}
              <div className="space-y-3">
                <h4 className="font-sans font-bold text-gray-800 text-sm uppercase tracking-wider font-mono">
                  Specialized Procedures & Scope
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedService.features.map((feature, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-[16px] border border-gray-50 bg-[#F8FBFC] text-sm text-gray-700"
                    >
                      <span className="h-2 w-2 rounded-full bg-[#2ECC71]" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient Guidelines Notice */}
              <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/15 flex items-start gap-3 text-xs text-[#1C9D9B] leading-relaxed">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  <strong>Clinical Notice:</strong> Patient consultations for this department are handled by appointment only. Diagnostics require 24-hour pre-scheduling except for emergency trauma services.
                </p>
              </div>

            </div>

            {/* Footer Book CTA */}
            <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono font-semibold">
                CareBridge Clinical Services
              </span>
              <button
                onClick={() => handleBookService(selectedService)}
                className="flex items-center gap-2 bg-secondary text-white text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 px-6 py-3 rounded-full transition-all duration-300 shadow-md shadow-secondary/15"
              >
                <Calendar className="h-3.5 w-3.5" />
                Book This Department
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
