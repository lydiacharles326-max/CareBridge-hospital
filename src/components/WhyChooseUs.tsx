import React from 'react';
import { 
  HeartHandshake, Cpu, Award, Activity, Coins, ShieldAlert, 
  CheckCircle2, ArrowUpRight, LucideProps
} from 'lucide-react';
import { features } from '../data';

// Map icon strings to components
const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  HeartHandshake: HeartHandshake,
  Cpu: Cpu,
  Award: Award,
  Activity: Activity,
  Coins: Coins,
  ShieldAlert: ShieldAlert,
};

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="py-20 md:py-28 font-sans bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Context Pitch & Accreditations */}
          <div className="lg:col-span-5 text-left space-y-7">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
                WHY CAREBRIDGE HOSPITAL
              </span>
              <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-primary mt-3 leading-tight">
                Modern Healthcare, <br />Empathetic Delivery.
              </h2>
              <div className="h-1.5 w-16 bg-secondary rounded-full mt-5" />
            </div>

            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              We understand that choosing a healthcare partner is one of the most vital decisions of your life. CareBridge reconciles top-tier medical intellect with comfortable, patient-centered spaces to ensure clinical results that bring lasting peace of mind.
            </p>

            {/* Quick check bullets */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
                <span>Zero hidden fees with upfront billing pre-checks</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
                <span>Direct email channels to your physical care board</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
                <span>Complimentary parking and dynamic valet for families</span>
              </div>
            </div>

            {/* Accent badge card */}
            <div className="p-6 rounded-[24px] navy-gradient text-white shadow-xl shadow-blue-950/10 relative overflow-hidden">
              {/* Back glowing pattern */}
              <div className="absolute right-[-10%] top-[-20%] w-24 h-24 rounded-full bg-white/10 blur-xl" />
              
              <h4 className="font-sans font-bold text-base">Inpatient Care Standards</h4>
              <p className="text-white/80 text-xs mt-1 leading-relaxed">
                Our private patient suites are modeled to boutique luxury hotel specifications, featuring high-speed connectivity, smart clinical monitoring, and nutrition menus curated by dietitians.
              </p>
            </div>

          </div>

          {/* Right Column: Bento Features Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feat) => {
                const IconComponent = iconMap[feat.iconName] || Award;
                
                return (
                  <div
                    key={feat.id}
                    className="group bg-[#F8FBFC] p-7 rounded-[24px] border border-gray-100/80 shadow-xs hover:shadow-lg hover:border-secondary/15 transition-all duration-300 flex flex-col justify-between card-shadow"
                  >
                    <div>
                      {/* Icon */}
                      <div className="h-12 w-12 rounded-xl bg-white border border-primary/5 flex items-center justify-center text-primary group-hover:bg-secondary/10 group-hover:text-secondary group-hover:border-secondary/25 transition-all duration-300 mb-5">
                        <IconComponent className="h-6 w-6 text-secondary" />
                      </div>

                      {/* Header */}
                      <h3 className="font-sans font-bold text-base text-gray-800 group-hover:text-secondary transition-colors">
                        {feat.title}
                      </h3>

                      {/* Detail */}
                      <p className="text-gray-400 text-xs mt-2.5 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>

                    {/* Accent arrow */}
                    <div className="flex justify-end pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowUpRight className="h-4 w-4 text-secondary" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
