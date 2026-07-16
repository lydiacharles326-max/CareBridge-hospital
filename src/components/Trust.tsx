import React, { useState, useEffect } from 'react';
import { Users, Shield, Award, Clock, Activity } from 'lucide-react';

interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
}

function CountUp({ end, suffix = '', duration = 1500 }: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const stepTime = Math.abs(Math.floor(duration / end));
    
    // For large numbers, increment by larger steps to avoid lagging
    const increment = Math.max(1, Math.floor(end / 80)); 
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, Math.min(stepTime, 20));

    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <span className="font-display font-bold text-4xl md:text-5xl tracking-tight text-white">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Trust() {
  const [currentTime, setCurrentTime] = useState('');

  // Sync active local standard operation clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative z-20 -mt-10 px-6 md:px-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-primary via-[#154175] to-[#123661] rounded-2xl shadow-xl p-8 md:p-12 border border-white/10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 items-center divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            
            {/* Stat 1: Happy Patients */}
            <div className="flex items-center gap-5 pt-0">
              <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                <Users className="h-7 w-7 text-secondary" />
              </div>
              <div className="flex flex-col">
                <CountUp end={10000} suffix="+" />
                <span className="text-sm text-white/70 font-semibold mt-1">Happy Patients Served</span>
              </div>
            </div>

            {/* Stat 2: Medical Experts */}
            <div className="flex items-center gap-5 pt-6 md:pt-0 lg:pl-8">
              <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                <Award className="h-7 w-7 text-secondary" />
              </div>
              <div className="flex flex-col">
                <CountUp end={250} suffix="+" />
                <span className="text-sm text-white/70 font-semibold mt-1">Board-Certified Specialists</span>
              </div>
            </div>

            {/* Stat 3: Departments */}
            <div className="flex items-center gap-5 pt-6 md:pt-0 lg:pl-8">
              <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                <Activity className="h-7 w-7 text-secondary" />
              </div>
              <div className="flex flex-col">
                <CountUp end={25} suffix="" />
                <span className="text-sm text-white/70 font-semibold mt-1">Specialized Wards</span>
              </div>
            </div>

            {/* Stat 4: 24/7 Emergency Care */}
            <div className="flex items-center gap-5 pt-6 md:pt-0 lg:pl-8">
              <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5 relative">
                <Clock className="h-7 w-7 text-secondary" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent animate-ping" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-4xl md:text-5xl tracking-tight text-accent animate-pulse">24/7</span>
                  <span className="px-2 py-0.5 bg-accent/20 border border-accent/20 rounded text-[9px] font-mono text-accent uppercase font-bold tracking-wider">LIVE</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-white/80 font-mono tracking-wider font-semibold">
                    Local Op Clock: {currentTime || 'Active'}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
