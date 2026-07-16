import React, { useState } from 'react';
import { 
  ArrowUp, Mail, Facebook, Twitter, Linkedin, Instagram, 
  Clock, ShieldAlert, Heart, ArrowRight, CheckCircle2 
} from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollTo = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      const offset = el.offsetTop - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return;

    setSubLoading(true);
    setTimeout(() => {
      setSubLoading(false);
      setSubscribed(true);
      setEmail('');
    }, 1000);
  };

  return (
    <footer className="bg-primary text-white pt-20 pb-10 font-sans relative overflow-hidden">
      
      {/* Background Accent glow */}
      <div className="absolute right-[-10%] bottom-[-10%] w-60 h-60 rounded-full bg-secondary/15 blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        
        {/* Top Segment: Brand logo and Newsletter */}
        <div className="grid lg:grid-cols-12 gap-12 pb-16 border-b border-white/10 items-center">
          
          {/* Logo brand intro */}
          <div className="lg:col-span-5 flex flex-col items-start text-left space-y-4">
            <Logo variant="light" size={42} />
            <p className="text-white/60 text-sm max-w-sm leading-relaxed">
              CareBridge Hospital delivers compassionate, world-class healthcare. Our board-certified specialists utilize state-of-the-art medical diagnostics to build healthier futures daily.
            </p>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-7 bg-white/5 border border-white/10 p-6 md:p-8 rounded-[24px] w-full text-left space-y-4">
            <div>
              <h4 className="font-sans font-bold text-base">Subscribe to CareBridge Pulse Newsletter</h4>
              <p className="text-white/60 text-xs mt-1">Get monthly healthcare tips, clinical journals, and community wellness updates.</p>
            </div>

            {subscribed ? (
              <div className="flex items-center gap-2.5 p-3.5 bg-[#2ECC71]/10 border border-[#2ECC71]/20 rounded-2xl text-[#2ECC71]">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-xs font-semibold">Thank you! You are subscribed to our monthly health briefings.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/40" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-11 pr-4 py-3.5 bg-white/10 border border-white/10 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subLoading}
                  className="bg-secondary hover:bg-secondary/90 text-white px-6 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {subLoading ? (
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Middle Segment: 4 Columns Directory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-16 text-left">
          
          {/* Col 1: Social handles and emergency contact */}
          <div className="space-y-6">
            <h4 className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
              Emergency Hotlines
            </h4>
            <div className="space-y-3.5">
              <div className="flex items-center gap-2.5 text-xs text-white/80">
                <ShieldAlert className="h-4.5 w-4.5 text-red-400 animate-pulse shrink-0" />
                <span>Trauma Command (24/7):</span>
              </div>
              <a href="tel:+2348039009111" className="block font-sans font-extrabold text-xl text-red-400 hover:underline leading-none">
                +234 (803) 900-9111
              </a>
              <p className="text-white/40 text-[11px] leading-relaxed">
                For ambulance dispatch, stroke protocols, or acute poisoning emergencies.
              </p>
            </div>

            {/* Social media buttons */}
            <div className="flex items-center gap-3.5 pt-2">
              <a href="#" className="h-9 w-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-secondary hover:border-secondary hover:bg-secondary/15 transition-all">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-secondary hover:border-secondary hover:bg-secondary/15 transition-all">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-secondary hover:border-secondary hover:bg-secondary/15 transition-all">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-secondary hover:border-secondary hover:bg-secondary/15 transition-all">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-6">
            <h4 className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
              Hospital Navigator
            </h4>
            <div className="flex flex-col gap-3.5 text-sm text-white/70">
              <button onClick={() => handleScrollTo('home')} className="hover:text-secondary text-left transition-colors font-medium">Home</button>
              <button onClick={() => handleScrollTo('about')} className="hover:text-secondary text-left transition-colors font-medium font-sans">About Center</button>
              <button onClick={() => handleScrollTo('services')} className="hover:text-secondary text-left transition-colors font-medium">Clinical Services</button>
              <button onClick={() => handleScrollTo('doctors')} className="hover:text-secondary text-left transition-colors font-medium">Medical Board</button>
              <button onClick={() => handleScrollTo('why-us')} className="hover:text-secondary text-left transition-colors font-medium">Why CareBridge</button>
              <button onClick={() => handleScrollTo('appointment')} className="hover:text-secondary text-left transition-colors font-medium">Book Consult</button>
            </div>
          </div>

          {/* Col 3: Specialties */}
          <div className="space-y-6">
            <h4 className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
              Clinical Departments
            </h4>
            <div className="flex flex-col gap-3.5 text-sm text-white/70">
              <button onClick={() => handleScrollTo('services')} className="hover:text-secondary text-left transition-colors font-medium">General Consultation</button>
              <button onClick={() => handleScrollTo('services')} className="hover:text-secondary text-left transition-colors font-medium">Cardiology Center</button>
              <button onClick={() => handleScrollTo('services')} className="hover:text-secondary text-left transition-colors font-medium">Pediatric Pavilion</button>
              <button onClick={() => handleScrollTo('services')} className="hover:text-secondary text-left transition-colors font-medium">Neurological Sciences</button>
              <button onClick={() => handleScrollTo('services')} className="hover:text-secondary text-left transition-colors font-medium">Orthopedic Surgery</button>
              <button onClick={() => handleScrollTo('services')} className="hover:text-secondary text-left transition-colors font-medium">Clinical Pharmacy</button>
            </div>
          </div>

          {/* Col 4: Facility Hours */}
          <div className="space-y-6">
            <h4 className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
              Operating Schedule
            </h4>
            <div className="space-y-4 text-xs text-white/80 font-sans">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-semibold text-white">Emergency Trauma:</span>
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 font-bold border border-red-500/10 rounded font-mono">
                  24 HOURS
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-semibold text-white">Specialist Clinics:</span>
                <span className="font-mono text-white/60">Mon - Fri: 8AM - 8PM</span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-semibold text-white">Clinical Lab Center:</span>
                <span className="font-mono text-white/60">Sat - Sun: 9AM - 5PM</span>
              </div>

              <div className="flex items-center justify-between pb-2">
                <span className="font-semibold text-white">Integrated Pharmacy:</span>
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 font-bold border border-green-500/10 rounded font-mono">
                  24 HOURS
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Segment: HIPAA & Copyright */}
        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/40">
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
            <span>© 2026 CareBridge Hospital Inc. All Rights Reserved.</span>
            <div className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-secondary fill-secondary" />
              <span>Certified HIPAA Complaint Secure Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Charter</a>
            <a href="#" className="hover:text-white transition-colors">Billing Policy</a>
            
            {/* Float Scroll Top Button */}
            <button
              onClick={handleScrollTop}
              className="h-10 w-10 rounded-full bg-white/5 hover:bg-secondary border border-white/10 hover:border-secondary flex items-center justify-center text-white/70 hover:text-white shadow transition-all focus:outline-none cursor-pointer"
              title="Scroll to Top"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
}
