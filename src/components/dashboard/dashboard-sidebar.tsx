
"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Library
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type AdminTab = 'dashboard' | 'analytics' | 'visitors' | 'reports' | 'settings';

interface DashboardSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const navItems: { icon: any; label: string; id: AdminTab }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: BarChart3, label: 'Analytics', id: 'analytics' },
  { icon: Users, label: 'Visitors', id: 'visitors' },
  { icon: FileText, label: 'Reports', id: 'reports' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

export function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  return (
    <div className="w-64 border-r bg-white h-screen fixed left-0 top-0 flex flex-col z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg">
          <Library className="text-white h-6 w-6" />
        </div>
        <span className="font-headline font-bold text-lg tracking-tight">NEU Library</span>
      </div>
      
      <div className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full justify-start gap-3 h-11 transition-all duration-200",
              activeTab === item.id 
                ? "bg-accent text-primary font-semibold" 
                : "text-muted-foreground hover:bg-slate-50"
            )}
          >
            <item.icon className={cn("h-5 w-5", activeTab === item.id ? "text-primary" : "text-muted-foreground")} />
            {item.label}
          </Button>
        ))}
      </div>

      <div className="p-4 border-t mt-auto">
        <Button 
          variant="ghost" 
          onClick={() => window.location.href = '/'}
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Exit to Kiosk
        </Button>
      </div>
    </div>
  );
}
