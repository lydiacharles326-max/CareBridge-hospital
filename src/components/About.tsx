import React, { useState } from 'react';
import { Target, Eye, HeartHandshake, Award, Cpu, ShieldCheck } from 'lucide-react';

export default function About() {
  const [activeTab, setActiveTab] = useState<'mission' | 'vision'>('mission');

  const coreValues = [
    {
      id: 'compassion',
      title: 'Compassionate Care',
      description: 'Listening to our patients, treating everyone with gentle kindness, and building a comfortable healing haven.',
      icon: HeartHandshake,
      color: 'text-secondary bg-secondary/5 border-secondary/15'
    },
    {
      id: 'excellence',
      title: 'Clinical Excellence',
      description: 'Maintaining absolute medical precision, rigorous hygiene protocols, and elite surgical standards.',
      icon: Award,
      color: 'text-primary bg-primary/5 border-primary/15'
    },
    {
      id: 'innovation',
      title: 'Digital Innovation',
      description: 'Equipping our diagnostic labs with next-generation medical imaging, automation, and instant portal sync.',
      icon: Cpu,
      color: 'text-accent bg-accent/5 border-accent/15'
    },
    {
      id: 'integrity',
      title: 'Absolute Integrity',
      description: 'Guaranteeing transparent billing, ethical insurance networks, and strict HIPAA records compliance.',
      icon: ShieldCheck,
      color: 'text-success bg-success/5 border-success/15'
    }
  ];

  return (
    <section id="about" className="py-20 md:py-28 font-sans bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
            ABOUT OUR HEALTHCARE CENTER
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-primary mt-3">
            Bridging Care, Building <br />Healthier Lives Daily.
          </h2>
          <div className="h-1.5 w-16 bg-secondary rounded-full mx-auto mt-5" />
        </div>

        {/* Core Layout Split */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Image Stack */}
          <div className="lg:col-span-6 relative">
            {/* Soft backdrop blur decoration */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary/10 rounded-full blur-2xl z-0" />
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-accent/10 rounded-full blur-3xl z-0" />

            <div className="relative z-10 bg-white p-3 rounded-[32px] shadow-xl border border-gray-100">
              <div className="relative overflow-hidden rounded-[24px] aspect-[16/10] sm:aspect-[16/10]">
                <img
                  src="/src/assets/images/medical_team_1784146249431.jpg"
                  alt="CareBridge Medical Team of Experts"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Float medical accreditation banner */}
              <div className="absolute -bottom-6 left-6 right-6 navy-gradient text-white p-4.5 rounded-[24px] shadow-lg border border-white/10 flex items-center gap-4">
                <div className="h-11 w-11 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <span className="block text-xs font-mono uppercase tracking-widest text-secondary font-bold">
                    JCI Accredited
                  </span>
                  <span className="block text-xs text-white/80 font-sans mt-0.5">
                    Gold Seal of Approval for Patient Safety
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mission, Vision, Values */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6 mt-6 lg:mt-0">
            
            {/* Interactive Tab Buttons for Mission/Vision */}
            <div className="flex border-b border-gray-100 w-full mb-2">
              <button
                onClick={() => setActiveTab('mission')}
                className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold tracking-wide border-b-2 transition-all duration-300 focus:outline-none ${
                  activeTab === 'mission'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-gray-400 hover:text-primary'
                }`}
              >
                <Target className="h-4 w-4" />
                Our Mission
              </button>
              <button
                onClick={() => setActiveTab('vision')}
                className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold tracking-wide border-b-2 transition-all duration-300 focus:outline-none ${
                  activeTab === 'vision'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-gray-400 hover:text-primary'
                }`}
              >
                <Eye className="h-4 w-4" />
                Our Vision
              </button>
            </div>

            {/* Tab Panels */}
            <div className="min-h-[100px] transition-all duration-300">
              {activeTab === 'mission' ? (
                <div className="space-y-3.5">
                  <h3 className="font-display font-bold text-gray-800 text-xl">
                    Delivering Compassionate, World-Class Healthcare.
                  </h3>
                  <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                    Our mission is to bridge healthcare accessibility, advanced digital medical intelligence, and warm human care. We strive to provide personalized treatment plans that respect patient dignity, maximize clinical recovery, and build healthier futures for our global community.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <h3 className="font-display font-bold text-gray-800 text-xl">
                    Setting the Global Standard for Private Clinical Care.
                  </h3>
                  <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                    We envision a healthcare model where bleeding-edge science meets patient comfort. CareBridge Hospital aims to be the leading healthcare network of choice, celebrated for clinical breakthrough procedures, digitalized patient diagnostics, and a commitment to zero-friction billing transparency.
                  </p>
                </div>
              )}
            </div>

            {/* Core Values Heading */}
            <div className="pt-4 w-full">
              <h4 className="font-display font-bold text-primary text-base mb-4 uppercase tracking-wider font-mono text-xs">
                OUR CLINICAL CORE VALUES
              </h4>
              
              {/* Values Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {coreValues.map((value) => {
                  const IconComp = value.icon;
                  return (
                    <div 
                      key={value.id}
                      className="p-5 rounded-[24px] border border-gray-100 bg-white hover:border-secondary hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300 flex flex-col items-start card-shadow"
                    >
                      <div className={`h-10 w-10 rounded-[12px] flex items-center justify-center mb-3 border ${value.color}`}>
                        <IconComp className="h-5 w-5" />
                      </div>
                      <h5 className="font-display font-bold text-gray-800 text-sm mb-1">
                        {value.title}
                      </h5>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
