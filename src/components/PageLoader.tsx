import React, { useEffect, useState } from 'react';
import Logo from './Logo';

export default function PageLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate initial asset and font loading
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setLoading(false);
          }, 350); // Small delay for fade out
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 80);

    return () => clearInterval(progressInterval);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-out">
      <div className="flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated Logo */}
        <div className="relative mb-8 scale-110 md:scale-125">
          <div className="absolute inset-0 bg-secondary/15 rounded-full blur-2xl animate-pulse" />
          <Logo variant="color" size={52} />
        </div>

        {/* Clinical Waveform Loader */}
        <div className="relative w-48 h-10 mb-4 overflow-hidden">
          <svg className="w-full h-full stroke-secondary" viewBox="0 0 100 30" fill="none">
            <path
              d="M0 15H30L35 5L40 25L45 12L48 18L50 15H100"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="dash-animate"
              style={{
                strokeDasharray: '200',
                strokeDashoffset: '200',
                animation: 'dash 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite'
              }}
            />
          </svg>
          <style>{`
            @keyframes dash {
              to {
                stroke-dashoffset: 0;
              }
            }
          `}</style>
        </div>

        {/* Loading Progress Text */}
        <p className="font-mono text-xs uppercase tracking-widest text-primary/60 font-semibold mb-2">
          Clinical Systems Initializing
        </p>

        {/* Progress Bar Container */}
        <div className="w-48 h-1.5 bg-light-bg rounded-full overflow-hidden border border-gray-100 shadow-sm">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-150 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-secondary mt-1.5 font-bold">
          {Math.min(progress, 100)}%
        </span>
      </div>
    </div>
  );
}
