import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { faqs } from '../data';

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>('faq-1'); // Open first by default

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 md:py-28 font-sans bg-white">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-secondary font-bold">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-primary mt-3">
            Got Questions? <br />We Have Clinical Answers.
          </h2>
          <div className="h-1.5 w-16 bg-secondary rounded-full mx-auto mt-5" />
        </div>

        {/* Accordion Stack */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-[#F8FBFC] rounded-[24px] border transition-all duration-300 overflow-hidden card-shadow ${
                  isOpen 
                    ? 'border-secondary/25 shadow-md shadow-secondary/5' 
                    : 'border-gray-100 hover:border-gray-200 shadow-xs'
                }`}
              >
                {/* Header Question Bar */}
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full py-5 px-6 md:px-8 flex items-center justify-between gap-4 text-left focus:outline-none cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <HelpCircle className={`h-5 w-5 shrink-0 transition-colors ${isOpen ? 'text-secondary' : 'text-gray-400'}`} />
                    <span className="font-sans font-bold text-sm md:text-base text-gray-800">
                      {faq.question}
                    </span>
                  </div>
                  <div className={`h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180 bg-secondary/15 border-secondary/10 text-secondary' : ''}`}>
                    <ChevronDown className="h-4.5 w-4.5" />
                  </div>
                </button>

                {/* Dropdown Content with smooth sliding animation using pure CSS height transition */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[300px] border-t border-gray-100/50' : 'max-h-0'
                  }`}
                >
                  <div className="p-6 md:p-8 text-xs md:text-sm text-gray-500 leading-relaxed font-sans bg-white/80">
                    {faq.answer}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Portal redirect prompt */}
        <div className="text-center mt-12 text-xs text-gray-400">
          Have secondary inquiries about clinical histories or payments?{' '}
          <a href="#contact" className="text-secondary font-bold hover:underline">
            Reach our administrative coordinators
          </a>
        </div>

      </div>
    </section>
  );
}
