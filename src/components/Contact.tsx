import React, { useState } from 'react';
import { Phone, Mail, MapPin, AlertCircle, Clock, Navigation, Map, Compass, ShieldCheck } from 'lucide-react';

export default function Contact() {
  const [mapMode, setMapMode] = useState<'standard' | 'transit' | 'valet'>('standard');
  const [zoomLevel, setZoomLevel] = useState(14);

  return (
    <section id="contact" className="py-20 md:py-28 font-sans bg-[#F8FBFC] relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Coordinates */}
          <div className="lg:col-span-5 text-left space-y-7">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
                CONNECT WITH US
              </span>
              <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-primary mt-3 leading-tight">
                Our Facilities & Coordinates.
              </h2>
              <div className="h-1.5 w-16 bg-secondary rounded-full mt-5" />
            </div>

            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              CareBridge Hospital is situated at the heart of Garki, Abuja, built with modern facilities, seamless access, ample underground multi-level parking, and automated family valet services.
            </p>

            {/* Coordinates Grid */}
            <div className="space-y-5 pt-2">
              
              {/* Emergency Dial (High priority red) */}
              <div className="flex gap-4 p-4 rounded-2xl border border-red-100 bg-red-50/20">
                <div className="h-11 w-11 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                  <AlertCircle className="h-5.5 w-5.5 animate-pulse" />
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-red-600 font-bold">
                    24/7 Critical Trauma Line
                  </span>
                  <a href="tel:+2348039009111" className="block text-lg font-sans font-bold text-red-800 hover:underline">
                    +234 (803) 900-9111
                  </a>
                </div>
              </div>

              {/* Administrative Desk */}
              <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white card-shadow">
                <div className="h-11 w-11 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 text-primary">
                  <Phone className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                    General Inquiries & Reservations
                  </span>
                  <a href="tel:+23494613700" className="block text-base font-sans font-bold text-primary hover:underline">
                    +234 (9) 461-3700
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white card-shadow">
                <div className="h-11 w-11 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 text-primary">
                  <Mail className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                    Clinical Administration Email
                  </span>
                  <a href="mailto:info@carebridgehospital.com" className="block text-base font-sans font-bold text-primary hover:underline">
                    info@carebridgehospital.com
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white card-shadow">
                <div className="h-11 w-11 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 text-primary">
                   <MapPin className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                    Physical Pavilion Location
                  </span>
                  <span className="block text-sm font-sans font-medium text-gray-800 leading-relaxed">
                    30 Mahatma Gandhi Street, Off Lord Lugard<br />Garki, Abuja, Nigeria
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Interactive Map Canvas */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-gray-100 rounded-[24px] overflow-hidden shadow-xl p-3 flex flex-col space-y-4 card-shadow">
              
              {/* Map controls header bar */}
              <div className="bg-[#F8FBFC] px-4 py-3 rounded-xl border border-gray-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Map className="h-4.5 w-4.5 text-secondary" />
                  <span className="text-xs font-semibold text-primary font-mono">MAP: GARKI, ABUJA DISTRICT</span>
                </div>
                
                {/* Mode Selectors */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setMapMode('standard')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md focus:outline-none transition-all cursor-pointer ${
                      mapMode === 'standard' ? 'bg-secondary text-white shadow-sm' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    Clinical Map
                  </button>
                  <button
                    onClick={() => setMapMode('transit')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md focus:outline-none transition-all cursor-pointer ${
                      mapMode === 'transit' ? 'bg-secondary text-white shadow-sm' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    Public Transit
                  </button>
                  <button
                    onClick={() => setMapMode('valet')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md focus:outline-none transition-all cursor-pointer ${
                      mapMode === 'valet' ? 'bg-secondary text-white shadow-sm' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    Valet & Parking
                  </button>
                </div>
              </div>

              {/* Map Screen container */}
              <div className="relative aspect-[16/10] bg-[#E8ECEF] rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                
                {/* SVG-based customized map layer */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250" fill="none">
                  {/* Grid Lines/Streets background */}
                  <rect width="400" height="250" fill="#E8ECEF" />
                  
                  {/* Local Streets */}
                  <path d="M 0,100 L 400,100" stroke="#FFFFFF" strokeWidth="18" />
                  <path d="M 0,100 L 400,100" stroke="#CCD5DB" strokeWidth="1" strokeDasharray="3" />
                  <path d="M 120,0 L 120,250" stroke="#FFFFFF" strokeWidth="22" />
                  <path d="M 120,0 L 120,250" stroke="#CCD5DB" strokeWidth="1" strokeDasharray="3" />
                  
                  <path d="M 0,40 C 100,40 100,160 250,160 L 400,160" stroke="#FFFFFF" strokeWidth="14" />
                  <path d="M 280,0 L 280,250" stroke="#FFFFFF" strokeWidth="14" />

                  {/* Stanford Arboretum Area */}
                  <rect x="10" y="10" width="80" height="60" rx="6" fill="#D3E5D7" opacity="0.8" />
                  <text x="50" y="45" textAnchor="middle" fill="#6A8D73" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Garki Park</text>

                  {/* Medical Campus Outline */}
                  <rect x="150" y="50" width="100" height="90" rx="12" fill="#FFFFFF" stroke="#22B8B5" strokeWidth="3" shadow-lg="true" />
                  
                  {/* Hospital Icon Node */}
                  <circle cx="200" cy="95" r="14" fill="#0D2B52" />
                  
                  {/* Cross Symbol on Node */}
                  <path d="M200 89V101M194 95H206" stroke="#22B8B5" strokeWidth="3" strokeLinecap="round" />

                  {/* Text Markers */}
                  <text x="200" y="125" textAnchor="middle" fill="#0D2B52" fontSize="9" fontFamily="sans-serif" fontWeight="extrabold">CareBridge Hospital</text>
                  <text x="340" y="93" fill="#8E9AA2" fontSize="6" fontFamily="sans-serif">Mahatma Gandhi St</text>
                  <text x="132" y="210" fill="#8E9AA2" fontSize="6" fontFamily="sans-serif" transform="rotate(-90, 132, 210)">Lord Lugard Rd</text>

                  {/* Transit Toggles Overlay */}
                  {mapMode === 'transit' && (
                    <>
                      {/* Train Track Line */}
                      <path d="M 330,0 L 330,250" stroke="#F1C40F" strokeWidth="4" strokeDasharray="6 3" />
                      {/* Transit station node */}
                      <circle cx="330" cy="100" r="7" fill="#F1C40F" stroke="#FFFFFF" strokeWidth="2" />
                      {/* Text label */}
                      <rect x="342" y="92" width="50" height="15" rx="3" fill="#FFFFFF" stroke="#F1C40F" strokeWidth="1" />
                      <text x="367" y="102" textAnchor="middle" fill="#333333" fontSize="6" fontFamily="sans-serif" fontWeight="bold">Transit Station</text>
                    </>
                  )}

                  {/* Valet / Parking overlay */}
                  {mapMode === 'valet' && (
                    <>
                      {/* Valet Drop off circle */}
                      <circle cx="170" cy="95" r="8" fill="#2ECC71" stroke="#FFFFFF" strokeWidth="1.5" />
                      <text x="170" y="98" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontFamily="sans-serif" fontWeight="bold">V</text>
                      
                      {/* Public underground parking */}
                      <circle cx="230" cy="95" r="8" fill="#3498DB" stroke="#FFFFFF" strokeWidth="1.5" />
                      <text x="230" y="98" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontFamily="sans-serif" fontWeight="bold">P</text>

                      {/* Info labels */}
                      <rect x="145" y="15" width="110" height="20" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                      <text x="200" y="27" textAnchor="middle" fill="#2D3748" fontSize="6.5" fontFamily="sans-serif" fontWeight="semibold">
                        🟢 Complementary Valet at Main Canopy
                      </text>
                    </>
                  )}
                </svg>

                {/* Floating GPS Target Icon */}
                <div className="absolute right-4 bottom-4 flex flex-col gap-2">
                  <div className="h-10 w-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-primary hover:text-secondary cursor-pointer hover:shadow-lg transition-shadow">
                    <Navigation className="h-4.5 w-4.5" />
                  </div>
                </div>

                {/* Satellite overlay indicator */}
                <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-[#0D2B52]/80 backdrop-blur rounded-full text-[9px] font-mono text-white tracking-widest font-bold">
                  <Compass className="h-3.5 w-3.5 text-secondary animate-spin" style={{ animationDuration: '10s' }} />
                  GPS ACTIVE: {zoomLevel}x ZOOM
                </span>

              </div>

              {/* Map zoom slider */}
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">Map Zoom</span>
                <input
                  type="range"
                  min="10"
                  max="18"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="flex-1 accent-secondary h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-primary w-8">{zoomLevel}x</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
