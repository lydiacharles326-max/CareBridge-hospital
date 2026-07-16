import React, { useState, useEffect } from 'react';
import Logo from './Logo';

interface NavbarProps {
  onOpenPortal: () => void;
  activeCount: number;
  currentPage: 'home' | 'booking';
  onPageChange: (page: 'home' | 'booking', targetSection?: string) => void;
}

export default function Navbar({ onOpenPortal, activeCount, currentPage, onPageChange }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('HOME');

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
            {/* Brand Logo */}
            <a href="#home" onClick={(e) => handleScrollTo(e, 'home', 'HOME')} className="focus:outline-none">
              <Logo variant="color" size={34} />
            </a>

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
