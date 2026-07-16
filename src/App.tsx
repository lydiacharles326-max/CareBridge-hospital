/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import PageLoader from './components/PageLoader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Trust from './components/Trust';
import About from './components/About';
import Services from './components/Services';
import Doctors from './components/Doctors';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import AppointmentForm from './components/AppointmentForm';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AuthPortal from './components/AuthPortal';
import { Appointment } from './types';

export default function App() {
  // Portal sliding drawer state
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  
  // Tally indicator for navbar notifications
  const [activeCount, setActiveCount] = useState(0);
  
  // Syncing trigger to force refresh storage read
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Simple state routing for home vs separate booking page
  const [currentPage, setCurrentPage] = useState<'home' | 'booking'>('home');

  // Auto-routing parameters to pre-fill the appointment form
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('');

  // Synchronize localStorage with full-stack MongoDB Server
  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        // 1. Fetch live appointments from Express server on mount
        const res = await fetch('/api/appointments');
        if (res.ok) {
          const serverAppts = await res.json();
          if (serverAppts && serverAppts.length > 0) {
            localStorage.setItem('carebridge_appointments', JSON.stringify(serverAppts));
            // Force tally update
            setRefreshTrigger(prev => prev + 1);
          }
        }
      } catch (err) {
        console.error('Error syncing initial appointments from MongoDB backend:', err);
      }
    };

    syncWithBackend();

    // 2. Intercept localStorage.setItem to sync client updates back to server
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, [key, value]);

      if (key === 'carebridge_appointments') {
        try {
          const newAppts: Appointment[] = JSON.parse(value);
          // Sync each item to the server asynchronously
          newAppts.forEach(async (appt) => {
            try {
              // Call PUT endpoint to update; if not found (status 404), create it
              const putRes = await fetch(`/api/appointments/${appt.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appt)
              });
              if (putRes.status === 404) {
                await fetch('/api/appointments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(appt)
                });
              }
            } catch (syncErr) {
              console.error(`Failed to sync appointment ${appt.id} to server:`, syncErr);
            }
          });
        } catch (parseErr) {
          console.error('Failed to parse appointments during storage intercept:', parseErr);
        }
      }
    };

    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, []);

  // Fetch count of active non-cancelled appointments on mount / update
  useEffect(() => {
    const stored = localStorage.getItem('carebridge_appointments');
    if (stored) {
      try {
        const appts: Appointment[] = JSON.parse(stored);
        const active = appts.filter(a => a.status !== 'cancelled').length;
        setActiveCount(active);
      } catch (e) {
        console.error(e);
      }
    }
  }, [refreshTrigger, isPortalOpen]);

  const handleAppointmentBooked = () => {
    // Increment trigger to sync active tallies
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePageChange = (page: 'home' | 'booking', targetSection?: string) => {
    setCurrentPage(page);
    if (page === 'home') {
      if (targetSection) {
        setTimeout(() => {
          const el = document.getElementById(targetSection);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectDepartment = (deptName: string) => {
    setSelectedDept(deptName);
    setSelectedDoc(''); // Reset doctor override
    handlePageChange('booking');
  };

  const handleSelectDoctor = (doctorName: string, deptName: string) => {
    setSelectedDoc(doctorName);
    setSelectedDept(deptName);
    handlePageChange('booking');
  };

  return (
    <div className="relative min-h-screen bg-white text-charcoal antialiased overflow-x-hidden font-sans selection:bg-secondary/20 selection:text-primary">
      
      {/* 1. Custom Preloading Curtain */}
      <PageLoader />

      {/* 2. CareBridge Master Auth & Clinical Portal */}
      <AuthPortal 
        isOpen={isPortalOpen} 
        onClose={() => setIsPortalOpen(false)} 
        onNavigateToBooking={() => handlePageChange('booking')}
      />

      {/* 3. Transparent Sticky Navigation */}
      <Navbar 
        onOpenPortal={() => setIsPortalOpen(true)} 
        activeCount={activeCount} 
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Main Landing Sections (With ~80px-100px vertical layout rhythmic margins) */}
      <main className="flex flex-col">
        
        {currentPage === 'home' ? (
          <>
            {/* 4. Large Hero Banner & Interactive badging */}
            <Hero onBookClick={() => handlePageChange('booking')} />

            {/* 5. Count-Up Statistics & Local Standard Operation Clock */}
            <Trust />

            {/* 6. About CareBridge - JCI Accreditations, Mission & Core Values */}
            <About />

            {/* 7. Clinical Services Board & Detail Modals (Saves Auto-routing) */}
            <Services onSelectDepartment={handleSelectDepartment} />

            {/* 8. Medical Board Specialists & Ratings */}
            <Doctors onSelectDoctor={handleSelectDoctor} />

            {/* 9. Why Choose Us - Bento style competitive features */}
            <WhyChooseUs />

            {/* 10. Patient Recovery Journey Testimonials Carousel */}
            <Testimonials />

            {/* 12. FAQ Accordion panel */}
            <FAQ />

            {/* 13. Coordinates Directory & Location Map Drawer */}
            <Contact />
          </>
        ) : (
          <div className="pt-24 min-h-[calc(100vh-140px)] flex flex-col justify-center bg-[#F8FBFC]/50">
            {/* 11. HIPAA Secure Triage Booking Form (Dynamic Syncing) */}
            <AppointmentForm 
              selectedDept={selectedDept}
              selectedDoc={selectedDoc}
              onAppointmentBooked={handleAppointmentBooked}
              onOpenPortal={() => setIsPortalOpen(true)}
              onBackToHome={() => handlePageChange('home')}
            />
          </div>
        )}

      </main>

      {/* 14. Foot map index & newsletter subscription */}
      <Footer />

    </div>
  );
}
