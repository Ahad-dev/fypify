"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";

export default function LoadingScreen() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Loading Content */}
      <div className="relative z-10 text-center animate-fade-in">
        <div className="mb-8 animate-bounce-in">
          <Logo size="xl" />
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-neutral-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-xl font-semibold text-neutral-900">
            Loading<span className="inline-block w-8 text-left">{dots}</span>
          </p>
          <p className="text-sm text-neutral-500">Please wait while we set things up</p>
        </div>
      </div>
    </div>
  );
}

