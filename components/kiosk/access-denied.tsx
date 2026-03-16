
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Headset, 
  Ban,
  Clock,
  Calendar as CalendarIcon,
  Info
} from 'lucide-react';
import { format } from 'date-fns';

interface AccessDeniedProps {
  onReturnHome: () => void;
  kioskId?: string;
}

export function AccessDenied({ onReturnHome, kioskId = "LIB-SEC-0421" }: AccessDeniedProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#E9F0FF] flex flex-col items-center justify-center p-4">
      <Card className="max-w-[720px] w-full bg-white/95 backdrop-blur-2xl border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[3rem] p-12 md:p-20 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Logo Section */}
        <div className="mb-8 relative w-32 h-32">
           <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
             <Image 
               src="/neu.png" 
               alt="NEU Logo" 
               width={100} 
               height={100} 
               className="object-contain"
             />
           </div>
        </div>

        <div className="space-y-2 mb-12">
          <h2 className="text-xs font-bold tracking-[0.2em] text-[#1A1C1E] uppercase">Central Library Systems</h2>
        </div>

        {/* Access Denied Icon */}
        <div className="w-24 h-24 bg-[#E03131] rounded-full flex items-center justify-center mb-8 shadow-lg shadow-red-200">
          <Ban className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-5xl font-extrabold text-[#1A1C1E] mb-6">Access Denied</h1>
        <p className="text-[#6C757D] text-xl mb-8 max-w-md">
          You are currently restricted from library access.
        </p>

        <div className="w-24 h-[2px] bg-[#FFD8D8] mb-10" />

        <p className="text-[#6C757D] text-sm italic mb-12 max-w-sm leading-relaxed">
          Please see the librarian at the front desk for more information regarding your account status.
        </p>

        <div className="flex flex-col gap-6 w-full max-w-sm">
          <Button 
            onClick={onReturnHome}
            className="h-16 bg-[#1A1C1E] hover:bg-black text-white rounded-2xl text-lg font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl"
          >
            <Home className="w-5 h-5" />
            Return to Home
          </Button>

          <button className="flex items-center justify-center gap-2 text-[#6C757D] hover:text-[#1A1C1E] font-bold text-sm transition-colors py-2">
            <Headset className="w-4 h-4" />
            Request Remote Assistance
          </button>
        </div>
      </Card>

      {/* Footer Branding */}
      <footer className="mt-12 w-full max-w-[720px] flex items-center justify-between px-4 text-[#6C757D] text-[11px] font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#E03131] rounded-full flex items-center justify-center">
            <Info className="w-3 h-3 text-white" />
          </div>
          <span>Kiosk ID: {kioskId}</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#4F81FF]" />
            <span>{format(currentTime, 'HH:mm a')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#4F81FF]" />
            <span>{format(currentTime, 'MMM dd, yyyy')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
