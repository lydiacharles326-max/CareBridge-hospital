import React from 'react';
import { Calendar, User, Heart, Shield, Activity, Award } from 'lucide-react';

interface HeroProps {
  onBookClick: () => void;
}

export default function Hero({ onBookClick }: HeroProps) {
  const handleScrollTo = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 md:py-32 overflow-hidden bg-[#F8FBFC] scroll-mt-24"
    >
      {/* Background Soft Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-secondary/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[50%] rounded-full bg-[#EBF4F6]/60 blur-[120px]" />
        
        {/* Abstract Medical Grid Motif */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#0D2B52_1px,transparent_1px),linear-gradient(to_bottom,#0D2B52_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Floating Animated Shapes (Aesthetic Clinic-Themed SVGs) */}
      <div className="absolute left-[8%] top-[25%] animate-float-1 pointer-events-none opacity-20 hidden md:block">
        <Heart className="h-10 w-10 text-secondary" />
      </div>
      <div className="absolute right-[5%] top-[15%] animate-float-2 pointer-events-none opacity-30 hidden lg:block">
        <Activity className="h-12 w-12 text-accent" />
      </div>
      <div className="absolute left-[45%] bottom-[12%] animate-float-1 pointer-events-none opacity-25 hidden lg:block">
        <Award className="h-8 w-8 text-primary" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Headline and Copy column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-7">
            
            {/* Accreditation Micro Badge */}
            <div className="inline-flex items-center gap-2 bg-[#E6F7F7] text-secondary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse"></span>
              Level-1 Trauma & Clinical Excellence Certified
            </div>

            {/* Giant Heading */}
            <h1 className="font-sans font-bold tracking-tight text-primary text-4xl sm:text-5xl md:text-[60px] leading-[1.1] max-w-2xl">
              Exceptional <br />
              <span className="teal-accent">
                Healthcare
              </span> You Can Trust.
            </h1>

            {/* Subheading explaining compassionate care */}
            <p className="text-gray-500 font-sans text-base md:text-lg leading-relaxed max-w-xl">
              At CareBridge Hospital, we deliver compassionate, world-class healthcare powered by top Nigerian and global medical specialists, state-of-the-art diagnostic imaging, and highly specialized therapeutic departments.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <button
                onClick={onBookClick}
                className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white text-sm font-semibold px-8 py-4 rounded-2xl transition-all duration-300 active:scale-95 shadow-lg shadow-secondary/20"
              >
                <Calendar className="h-4 w-4" />
                Book Appointment
              </button>
              
              <button
                onClick={() => handleScrollTo('doctors')}
                className="flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 active:scale-95 card-shadow"
              >
                <User className="h-4 w-4" />
                Find a Doctor
              </button>
            </div>

            {/* Core Features list preview */}
            <div className="grid grid-cols-3 gap-4 pt-4 w-full max-w-xl">
              <div className="stat-card border-b-4 border-secondary text-center">
                <span className="text-2xl font-bold text-primary">24/7</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold text-center mt-1">EMERGENCY ROOM</span>
              </div>
              <div className="stat-card border-b-4 border-[#2ECC71] text-center">
                <span className="text-2xl font-bold text-primary">100%</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold text-center mt-1">EHR INTEGRATED</span>
              </div>
              <div className="stat-card border-b-4 border-primary text-center">
                <span className="text-2xl font-bold text-primary">0%</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold text-center mt-1">CO-PAY TRACE</span>
              </div>
            </div>

          </div>

          {/* Luxury Visual Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-[460px] lg:max-w-none">
              
              {/* Back ambient accent */}
              <div className="absolute -inset-1.5 rounded-[32px] bg-gradient-to-tr from-secondary to-accent opacity-15 blur-lg" />
              
              {/* Image Frame */}
              <div className="relative bg-white rounded-[32px] overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] sm:aspect-square lg:aspect-[4/5]">
                <img
                  src="/src/assets/images/hospital_reception_1784146234349.jpg"
                  alt="CareBridge Modern Hospital Lobby"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                
                {/* Image Gradient Shade */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Float Card 1: Patients Rating (Glassmorphic badge) */}
              <div className="absolute bottom-6 -left-6 md:-left-8 glass px-5 py-4 rounded-[24px] card-shadow max-w-[200px] animate-float-1">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <Heart className="h-5 w-5 fill-secondary" />
                  </div>
                  <div>
                    <span className="block text-lg font-bold text-primary leading-none">99.4%</span>
                    <span className="block text-[10px] text-gray-500 font-semibold tracking-wide mt-1">Patient Satisfaction</span>
                  </div>
                </div>
              </div>

              {/* Float Card 2: Specialized Trauma certified badge */}
              <div className="absolute top-10 -right-4 glass px-4 py-3 rounded-[24px] card-shadow max-w-[170px] animate-float-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-accent animate-ping shrink-0" />
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-primary">
                    ER Beds Available
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-sans pl-5">Diagnostic labs open 24/7</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
