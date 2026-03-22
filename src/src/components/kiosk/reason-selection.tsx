
"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Microscope, 
  Users, 
  ClipboardList,
  Bell,
  User as UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReasonSelectionProps {
  user: { name: string; program?: string };
  onSelect: (reason: string) => void;
  onCancel: () => void;
}

const reasons = [
  { 
    id: 'study', 
    label: 'Study', 
    description: 'Quiet individual workspace', 
    icon: BookOpen,
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50"
  },
  { 
    id: 'research', 
    label: 'Research', 
    description: 'Access archives & journals', 
    icon: Microscope,
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-50"
  },
  { 
    id: 'borrow', 
    label: 'Borrow/Return', 
    description: 'Manage your library loans', 
    icon: ClipboardList,
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50"
  },
  { 
    id: 'meeting', 
    label: 'Meeting', 
    description: 'Group collaboration', 
    icon: Users,
    colorClass: "text-indigo-600",
    bgClass: "bg-indigo-50"
  },
];

export function ReasonSelection({ user, onSelect, onCancel }: ReasonSelectionProps) {
  return (
    <div className="min-h-screen bg-[#EBF2FF] flex flex-col">
      {/* Top Navbar */}
      <header className="w-full px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#1A1C1E] text-lg">Library Portal</span>
        </div>
        <div className="flex items-center gap-6 text-[#6C757D]">
          <Bell className="w-6 h-6 cursor-pointer hover:text-[#1A1C1E] transition-colors" />
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center cursor-pointer">
            <UserIcon className="w-6 h-6" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 -mt-12">
        <Card className="max-w-[1000px] w-full bg-white/80 backdrop-blur-3xl border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[3rem] p-12 md:p-20">
          <div className="mb-14">
            <h1 className="text-5xl font-extrabold text-[#1A1C1E] mb-3">Reason for Visit</h1>
            <p className="text-[#6C757D] text-xl font-medium opacity-80">Please select the primary purpose of your visit today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {reasons.map((reason) => (
              <button
                key={reason.id}
                onClick={() => onSelect(reason.label)}
                className="group flex flex-col items-center justify-center p-10 rounded-[2.5rem] bg-white border border-slate-50 hover:border-primary/20 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.06)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-center min-h-[300px]"
              >
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center mb-10 transition-all duration-300 group-hover:scale-110 shadow-sm",
                  reason.bgClass
                )}>
                  <reason.icon className={cn("w-12 h-12", reason.colorClass)} />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1C1E] mb-2">{reason.label}</h3>
                <p className="text-[#6C757D] text-sm leading-relaxed max-w-[140px]">{reason.description}</p>
              </button>
            ))}
          </div>

          <Button 
            variant="outline"
            onClick={() => onSelect('Other')}
            className="w-full h-20 bg-white border-slate-100 text-[#1A1C1E] rounded-[1.25rem] text-xl font-bold hover:bg-slate-50 hover:border-slate-200 shadow-sm transition-all mb-16"
          >
            Other Purpose
          </Button>

          {/* Progress Section */}
          <div className="space-y-4">
            <p className="text-[#4F81FF] font-black text-sm tracking-widest uppercase">Step 2 of 4</p>
            <div className="flex justify-between items-end">
              <h2 className="text-3xl font-black text-[#1A1C1E]">Almost there!</h2>
              <span className="text-[#6C757D] text-lg font-bold opacity-60">50% Complete</span>
            </div>
            <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-[#4F81FF] rounded-full transition-all duration-500" style={{ width: '50%' }} />
            </div>
          </div>
        </Card>
      </main>

      {/* Decorative Bottom Icons */}
      <div className="flex justify-center gap-12 pb-12 opacity-20 grayscale pointer-events-none">
        <ClipboardList className="w-12 h-12" />
        <BookOpen className="w-12 h-12" />
        <Microscope className="w-12 h-12" />
      </div>
    </div>
  );
}
