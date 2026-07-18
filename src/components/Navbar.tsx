import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenPortal: () => void;
  activeCount: number;
  currentPage: 'home' | 'booking';
  onPageChange: (page: 'home' | 'booking', targetSection?: string) => void;
}

export default function Navbar({ onOpenPortal, activeCount, currentPage, onPageChange }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('HOME');
  const { dbStatus } = useAuth();

  const navLinks = [
    { label: 'HOME', targetId: 'home' },
    { label: 'ABOUT', targetId: 'about' },
    { label: 'SERVICES', targetId: 'services' },
    { label: 'DOCTORS', targetId: 'doctors' },
    { label: 'DEPARTMENTS', targetId: 'services' },
    { label: 'CONTACT', targetId: 'contact' },
  ];

  // Listen to scroll to apply glassmorphism and update active sections
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (currentPage === 'booking') {
        setActiveSection('');
        return;
      }

      // Simple active link tracker on scroll
      const scrollPosition = window.scrollY + 120;
      for (const link of navLinks) {
        const el = document.getElementById(link.targetId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(link.label);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string, label: string) => {
    e.preventDefault();
    if (currentPage === 'booking') {
      onPageChange('home', targetId);
    } else {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(label);
      }
    }
  };

  const handleBookClick = () => {
    onPageChange('booking');
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 font-sans ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm py-2.5 border-b border-gray-100'
            : 'bg-white/80 backdrop-blur-sm py-4 border-b border-gray-100/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col gap-3">
          {/* Top Row: Logo & Actions */}
          <div className="flex items-center justify-between w-full">
            {/* Brand Logo & DB Indicator */}
            <div className="flex items-center gap-3">
              <a href="#home" onClick={(e) => handleScrollTo(e, 'home', 'HOME')} className="focus:outline-none">
                <Logo variant="color" size={34} />
              </a>

              {/* MongoDB Connection Status Indicator */}
              <div 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-mono font-black transition-all duration-300 ${
                  !dbStatus 
                    ? 'border-gray-100 bg-gray-50 text-gray-400' 
                    : dbStatus.provider === 'MongoDB Atlas Cloud'
                    ? 'border-emerald-100 bg-emerald-50/80 text-emerald-600'
                    : 'border-amber-100 bg-amber-50/80 text-amber-600'
                }`}
                title={dbStatus ? `Database Provider: ${dbStatus.provider}` : 'Connecting to database...'}
              >
                {!dbStatus ? (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gray-400"></span>
                    </span>
                    <span className="hidden sm:inline tracking-tight uppercase">DB CONNECTING...</span>
                  </>
                ) : dbStatus.provider === 'MongoDB Atlas Cloud' ? (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span className="hidden sm:inline tracking-tight uppercase">MONGODB CONNECTED</span>
                    <span className="sm:hidden tracking-tight uppercase">DB ONLINE</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                    </span>
                    <span className="hidden sm:inline tracking-tight uppercase">MONGODB OFFLINE</span>
                    <span className="sm:hidden tracking-tight uppercase">DB OFFLINE</span>
                  </>
                )}
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 mx-auto">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={`#${link.targetId}`}
                  onClick={(e) => handleScrollTo(e, link.targetId, link.label)}
                  className={`text-xs font-bold tracking-wider transition-colors duration-300 relative py-1.5 focus:outline-none ${
                    activeSection === link.label
                      ? 'text-secondary font-black'
                      : 'text-gray-600 hover:text-secondary'
                  }`}
                >
                  {link.label}
                  {activeSection === link.label && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />
                  )}
                </a>
              ))}
            </div>

            {/* Top Right Action Buttons (No icons) */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* LOGIN Button */}
              <button
                onClick={onOpenPortal}
                className="relative text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary border border-gray-200 bg-white hover:bg-gray-50 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 focus:outline-none card-shadow"
              >
                <span>LOGIN</span>
                {activeCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-success text-[9px] font-bold text-white shadow-sm">
                    {activeCount}
                  </span>
                )}
              </button>

              {/* BOOK APPOINTMENT Button */}
              <button
                onClick={handleBookClick}
                className="bg-secondary text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 hover:shadow-md px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 active:scale-95 focus:outline-none shadow-sm"
              >
                BOOK APPOINTMENT
              </button>
            </div>
          </div>

          {/* Bottom Row / Scrollable Links on Mobile/Tablet */}
          <div className="lg:hidden w-full overflow-x-auto scrollbar-none py-1.5 border-t border-gray-100/50">
            <div className="flex items-center justify-start sm:justify-center gap-5 min-w-max px-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={`#${link.targetId}`}
                  onClick={(e) => handleScrollTo(e, link.targetId, link.label)}
                  className={`text-[10px] sm:text-xs font-bold tracking-wider transition-colors duration-300 relative py-1 focus:outline-none ${
                    activeSection === link.label
                      ? 'text-secondary font-black'
                      : 'text-gray-600 hover:text-secondary'
                  }`}
                >
                  {link.label}
                  {activeSection === link.label && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
