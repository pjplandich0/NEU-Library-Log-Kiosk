"use client";

import React, { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, setDoc, query, orderBy, deleteDoc, getDocs, Timestamp } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { DashboardSidebar, type AdminTab } from '@/components/dashboard/dashboard-sidebar';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { TrafficCharts } from '@/components/dashboard/traffic-charts';
import { VisitorTable } from '@/components/dashboard/visitor-table';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { User, Visitor, DashboardStats } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Loader2, 
  Download, 
  Trash2, 
  RefreshCcw, 
  ShieldCheck,
  Calendar,
  FileBarChart
} from 'lucide-react';
import { exportVisitorsToPDF } from '@/lib/pdf-export';

export default function AdminDashboard() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  
  // Real Firestore Data
  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users = [] } = useCollection<User>(usersQuery);

  const logsQuery = useMemoFirebase(() => query(collection(firestore, 'visitLogs'), orderBy('checkInTime', 'desc')), [firestore]);
  const { data: rawLogs = [] } = useCollection<any>(logsQuery);

  // Transform logs for table
  const visitors: Visitor[] = (rawLogs || []).map(log => ({
    id: log.id,
    userId: log.userId,
    name: log.name || 'Unknown',
    program: log.program || 'N/A',
    reason: log.reasonForVisit,
    timestamp: log.checkInTime instanceof Timestamp 
      ? log.checkInTime.toDate() 
      : log.checkInTime instanceof Date ? log.checkInTime : new Date(log.checkInTime),
    checkOutTime: log.checkOutTime instanceof Timestamp 
      ? log.checkOutTime.toDate() 
      : log.checkOutTime instanceof Date ? log.checkOutTime : (log.checkOutTime ? new Date(log.checkOutTime) : undefined),
    device: log.deviceType || 'Kiosk'
  }));

  const now = new Date();
  const stats: DashboardStats = {
    totalVisitors: visitors.length,
    dailyCount: visitors.filter(v => v.timestamp.toDateString() === now.toDateString()).length,
    weeklyCount: visitors.filter(v => (now.getTime() - v.timestamp.getTime()) < 604800000).length,
    monthlyCount: visitors.filter(v => (now.getTime() - v.timestamp.getTime()) < 2592000000).length,
    activeNow: visitors.filter(v => !v.checkOutTime).length, // Strictly based on missing checkOutTime
    bounceRate: '24.8%',
    avgSession: '45m'
  };

  const seedSampleData = async () => {
    setIsSeeding(true);
    try {
      const activeUserRef = doc(firestore, 'users', 'sample-active-id');
      await setDoc(activeUserRef, {
        id: 'sample-active-id',
        name: 'Juan Dela Cruz',
        email: 'juan@neu.edu.ph',
        program: 'BS Computer Science',
        rfidTag: 'RFID-123',
        isBlocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const blockedUserRef = doc(firestore, 'users', 'sample-blocked-id');
      await setDoc(blockedUserRef, {
        id: 'sample-blocked-id',
        name: 'Maria Santos',
        email: 'maria@neu.edu.ph',
        program: 'BS Nursing',
        rfidTag: 'RFID-999',
        isBlocked: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const paoloRef = doc(firestore, 'users', 'paolo-id');
      await setDoc(paoloRef, {
        id: 'paolo-id',
        name: 'Paolo Jhay Landicho',
        email: 'paolojhay.landicho@neu.edu.ph',
        program: 'BS Information Technology',
        rfidTag: 'RFID-PAOLO',
        isBlocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast({
        title: "Database Seeded",
        description: "Updated student records updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Seeding Failed",
        description: error.message,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const clearLogs = async () => {
    if (!confirm('Are you sure you want to clear all visit logs? This cannot be undone.')) return;
    setIsClearing(true);
    try {
      const logsSnapshot = await getDocs(collection(firestore, 'visitLogs'));
      const deletions = logsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletions);
      toast({ title: "Logs Cleared", description: "All visitor history has been wiped." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsClearing(false);
    }
  };

  const handleToggleBlock = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    if (!user) return;

    const newState = !user.isBlocked;
    const userRef = doc(firestore, 'users', userId);
    
    updateDocumentNonBlocking(userRef, {
      isBlocked: newState,
      updatedAt: new Date().toISOString()
    });

    toast({
      title: newState ? "User Blocked" : "User Unblocked",
      description: `${user.name} status updated.`,
      variant: newState ? "destructive" : "default"
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <StatsCards stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <TrafficCharts activeFilter={timeFilter} onFilterChange={setTimeFilter} />
               <Card className="border-none shadow-sm h-full">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Recent Visits</CardTitle>
                    <CardDescription>Live feed of latest check-ins</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 px-6">
                    <div className="space-y-4">
                      {visitors.slice(0, 5).map((v) => (
                        <div key={v.id} className="flex items-center justify-between py-3 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {v.name.charAt(0)}
                              </div>
                              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${v.checkOutTime ? 'bg-slate-300' : 'bg-green-500'}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{v.name}</p>
                              <p className="text-xs text-muted-foreground">{v.program}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-slate-500">{v.reason}</p>
                            <p className="text-[10px] text-muted-foreground">{v.checkOutTime ? 'Logged Out' : 'Active'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
               </Card>
            </div>
            <VisitorTable 
              visitors={visitors.slice(0, 10)} 
              users={users || []} 
              onToggleBlock={handleToggleBlock}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold">Detailed Traffic Analysis</h2>
            <TrafficCharts activeFilter={timeFilter} onFilterChange={setTimeFilter} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-none shadow-sm">
                 <p className="text-sm font-medium text-muted-foreground">Active Inside</p>
                 <h3 className="text-xl font-bold mt-2 text-primary">{stats.activeNow} Students</h3>
              </Card>
              <Card className="p-6 border-none shadow-sm">
                 <p className="text-sm font-medium text-muted-foreground">Most Common Reason</p>
                 <h3 className="text-xl font-bold mt-2">Individual Study</h3>
              </Card>
              <Card className="p-6 border-none shadow-sm">
                 <p className="text-sm font-medium text-muted-foreground">Today's Visits</p>
                 <h3 className="text-xl font-bold mt-2 text-green-600">+{stats.dailyCount}</h3>
              </Card>
            </div>
          </div>
        );
      case 'visitors':
        return (
          <div className="animate-in fade-in duration-500">
            <VisitorTable 
              visitors={visitors} 
              users={users || []} 
              onToggleBlock={handleToggleBlock}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold">Reports & Data Export</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    Full Visitor Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-sm mb-6">
                    Export the entire history of library visits as a formatted PDF report. This includes student details, visit reasons, and timestamps.
                  </p>
                  <Button onClick={() => exportVisitorsToPDF(visitors)} className="w-full gap-2">
                    <FileBarChart className="w-4 h-4" />
                    Generate PDF Report
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Daily Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-sm mb-6">
                    Export activity specifically for today ({new Date().toLocaleDateString()}). Useful for daily security reviews.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => exportVisitorsToPDF(visitors.filter(v => v.timestamp.toDateString() === new Date().toDateString()))}
                    className="w-full gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Today's Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold">System Settings</h2>
            <div className="max-w-2xl space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Database Management</CardTitle>
                  <CardDescription>Actions related to library records and sample data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Reset Test Records</p>
                      <p className="text-sm text-muted-foreground">Restore Juan, Maria, and Paolo test users.</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={seedSampleData} 
                      disabled={isSeeding}
                      className="gap-2"
                    >
                      {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                      Sync Users
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-red-900">Clear All Visit Logs</p>
                      <p className="text-sm text-red-700">Delete all history from the visitLogs collection.</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={clearLogs} 
                      disabled={isClearing}
                      className="gap-2"
                    >
                      {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Purge Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Access Control</CardTitle>
                  <CardDescription>Global security and kiosk configuration.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold">Live Security Verification</p>
                        <p className="text-sm text-muted-foreground">Automatic block checking is currently active.</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">ACTIVE</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex bg-[#F7F8FC] min-h-screen">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#212529]">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className="text-[#6C757D]">NEU Library Management System</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border flex items-center gap-2 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Kiosk Systems Active
            </div>
          </div>
        </header>

        {renderContent()}
      </main>
      <Toaster />
    </div>
  );
}
