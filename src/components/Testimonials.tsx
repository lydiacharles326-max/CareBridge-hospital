import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { testimonials } from '../data';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoPlayRef = useRef<(() => void) | null>(null);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Keep a fresh reference to handleNext for autoplay
  useEffect(() => {
    autoPlayRef.current = handleNext;
  });

  // Autoplay loop
  useEffect(() => {
    const play = () => {
      if (autoPlayRef.current) autoPlayRef.current();
    };
    const interval = setInterval(play, 5500);
    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section id="testimonials" className="py-20 md:py-28 font-sans bg-[#F8FBFC] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
            PATIENT CARE RECOVERY JOURNEYS
          </span>
          <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-primary mt-3">
            Real Recovery Stories, <br />Empathetic Clinical Journeys.
          </h2>
          <div className="h-1.5 w-16 bg-secondary rounded-full mx-auto mt-5" />
        </div>

        {/* Carousel Slider Frame */}
        <div className="max-w-4xl mx-auto relative px-4 md:px-12">
          
          {/* Large Back Quote Watermark */}
          <div className="absolute top-[-40px] left-[-20px] md:left-[40px] opacity-[0.04] text-primary pointer-events-none">
            <Quote className="h-36 w-36 fill-current" />
          </div>

          {/* Testimonial Active Slider Card */}
          <div 
            className={`transition-all duration-500 ease-in-out transform ${
              isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <div className="bg-white rounded-[24px] border border-gray-100 p-8 md:p-12 card-shadow flex flex-col md:flex-row gap-8 md:gap-12 items-center">
              
              {/* Profile Photo frame */}
              <div className="relative shrink-0 w-24 h-24 md:w-36 md:h-36">
                {/* Visual decoration ring */}
                <div className="absolute inset-[-6px] rounded-full bg-secondary/20" />
                
                <img
                  src={currentTestimonial.image}
                  alt={currentTestimonial.name}
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-md"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Review copy text */}
              <div className="flex-1 text-left space-y-4">
                
                {/* Stars and Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#F1C40F]">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    {currentTestimonial.date}
                  </span>
                </div>

                {/* Content body */}
                <p className="text-gray-600 font-sans text-sm md:text-base leading-relaxed italic">
                  "{currentTestimonial.content}"
                </p>

                {/* Signee details */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-sans font-bold text-primary text-base">
                      {currentTestimonial.name}
                    </h4>
                    <span className="font-mono text-[10px] text-secondary uppercase tracking-widest font-bold mt-0.5 block">
                      {currentTestimonial.role}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Carousel Arrows */}
          <div className="flex justify-between items-center mt-8 md:mt-0 md:absolute md:top-1/2 md:-translate-y-1/2 md:inset-x-0">
            
            <button
              onClick={handlePrev}
              className="md:absolute md:left-[-16px] h-11 w-11 rounded-full bg-white border border-gray-100 text-primary hover:text-secondary hover:shadow-md hover:border-secondary/20 flex items-center justify-center transition-all focus:outline-none cursor-pointer"
              aria-label="Previous patient testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={handleNext}
              className="md:absolute md:right-[-16px] h-11 w-11 rounded-full bg-white border border-gray-100 text-primary hover:text-secondary hover:shadow-md hover:border-secondary/20 flex items-center justify-center transition-all focus:outline-none cursor-pointer"
              aria-label="Next patient testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

          </div>

          {/* Carousel Indicator Dots */}
          <div className="flex items-center justify-center gap-2.5 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (isAnimating) return;
                  setIsAnimating(true);
                  setCurrentIndex(index);
                  setTimeout(() => setIsAnimating(false), 500);
                }}
                className={`h-2 transition-all duration-300 rounded-full focus:outline-none cursor-pointer ${
                  currentIndex === index ? 'w-6 bg-secondary' : 'w-2 bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
