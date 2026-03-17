"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { doc, collection, setDoc, query, orderBy, deleteDoc, getDocs, Timestamp } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { DashboardSidebar, type AdminTab } from '@/components/dashboard/dashboard-sidebar';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { TrafficCharts } from '@/components/dashboard/traffic-charts';
import { VisitorTable } from '@/components/dashboard/visitor-table';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { User, Visitor, DashboardStats, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, 
  RefreshCcw, 
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  ArrowLeftRight,
  Filter
} from 'lucide-react';

export default function AdminDashboard() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isAdminPromoting, setIsAdminPromoting] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');

  // Filters
  const [reasonFilter, setReasonFilter] = useState<string>('All');
  const [collegeFilter, setCollegeFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  
  // RBAC Check
  const adminDocRef = useMemoFirebase(() => user ? doc(firestore, 'admins', user.uid) : null, [firestore, user]);
  const { data: adminRole, isLoading: isAdminCheckLoading } = useDoc(adminDocRef);

  const isExplicitAdmin = user?.email === 'paolojhay.landicho@neu.edu.ph' || user?.email === 'jcesperanza@neu.edu.ph';
  const hasAdminAccess = !!adminRole || isExplicitAdmin;

  // Real Firestore Data
  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users = [] } = useCollection<User>(usersQuery);

  const logsQuery = useMemoFirebase(() => query(collection(firestore, 'visitLogs'), orderBy('checkInTime', 'desc')), [firestore]);
  const { data: rawLogs = [] } = useCollection<any>(logsQuery);

  // Transform and Filter Visitors
  const allVisitors: Visitor[] = useMemo(() => (rawLogs || []).map(log => ({
    id: log.id,
    userId: log.userId,
    name: log.name || 'Unknown',
    program: log.program || 'N/A',
    college: log.college || 'N/A',
    role: log.role || 'Student',
    reason: log.reasonForVisit,
    timestamp: log.checkInTime instanceof Timestamp 
      ? log.checkInTime.toDate() 
      : log.checkInTime instanceof Date ? log.checkInTime : new Date(log.checkInTime),
    checkOutTime: log.checkOutTime instanceof Timestamp 
      ? log.checkOutTime.toDate() 
      : log.checkOutTime instanceof Date ? log.checkOutTime : (log.checkOutTime ? new Date(log.checkOutTime) : undefined),
    device: log.deviceType || 'Kiosk'
  })), [rawLogs]);

  const filteredVisitors = useMemo(() => {
    return allVisitors.filter(v => {
      const matchesReason = reasonFilter === 'All' || v.reason === reasonFilter;
      const matchesCollege = collegeFilter === 'All' || v.college === collegeFilter;
      const matchesRole = roleFilter === 'All' || 
                         (roleFilter === 'Employee' ? (v.role === 'Professor' || v.role === 'Staff') : v.role === roleFilter);
      const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           v.program.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesReason && matchesCollege && matchesRole && matchesSearch;
    });
  }, [allVisitors, reasonFilter, collegeFilter, roleFilter, searchQuery]);

  const now = new Date();
  const stats: DashboardStats = useMemo(() => ({
    totalVisitors: filteredVisitors.length,
    dailyCount: filteredVisitors.filter(v => v.timestamp.toDateString() === now.toDateString()).length,
    weeklyCount: filteredVisitors.filter(v => (now.getTime() - v.timestamp.getTime()) < 604800000).length,
    monthlyCount: filteredVisitors.filter(v => (now.getTime() - v.timestamp.getTime()) < 2592000000).length,
    activeNow: filteredVisitors.filter(v => !v.checkOutTime).length,
    bounceRate: '24.8%',
    avgSession: '45m'
  }), [filteredVisitors]);

  const handlePromoteSelf = async () => {
    if (!user) return;
    setIsAdminPromoting(true);
    try {
      await setDoc(doc(firestore, 'admins', user.uid), {
        role: 'super-admin',
        grantedAt: new Date().toISOString(),
        email: user.email,
        name: user.displayName || 'Administrator'
      });
      toast({ title: "Role Initialized", description: "You now have administrative access." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Initialization Error", description: error.message || "Failed to create admin record." });
    } finally {
      setIsAdminPromoting(false);
    }
  };

  const seedSampleData = async () => {
    setIsSeeding(true);
    try {
      const sampleUsers: Partial<User>[] = [
        {
          id: 'paolo-id',
          name: 'Paolo Jhay Landicho',
          email: 'paolojhay.landicho@neu.edu.ph',
          program: 'BS Information Technology',
          college: 'College of Computer Studies',
          role: 'Student',
          rfidTag: 'RFID-PAOLO',
          isBlocked: false
        },
        {
          id: 'esperanza-id',
          name: 'JC Esperanza',
          email: 'jcesperanza@neu.edu.ph',
          program: 'Faculty',
          college: 'Administration',
          role: 'Professor',
          rfidTag: 'RFID-ESPERANZA',
          isBlocked: false
        },
        {
          id: 'jhun-id',
          name: 'Jhun Balimbing',
          email: 'jhunbalimbing@gmail.com',
          program: 'Academic Faculty',
          college: 'College of Arts and Sciences',
          role: 'Professor',
          rfidTag: 'RFID-JHUN',
          isBlocked: false
        },
        {
          id: 'juan-id',
          name: 'Juan Dela Cruz',
          email: 'juan@neu.edu.ph',
          program: 'BS Computer Science',
          college: 'College of Computer Studies',
          role: 'Student',
          rfidTag: 'RFID-123',
          isBlocked: false
        }
      ];

      for (const u of sampleUsers) {
        await setDoc(doc(firestore, 'users', u.id!), {
          ...u,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      const adminEmails = ['paolojhay.landicho@neu.edu.ph', 'jcesperanza@neu.edu.ph'];
      if (user && adminEmails.includes(user.email || '')) {
        await setDoc(doc(firestore, 'admins', user.uid), {
          role: 'super-admin',
          grantedAt: new Date().toISOString(),
          email: user.email,
          name: user.displayName || 'Administrator'
        });
      }

      toast({ title: "Database Synchronized", description: "All records and roles have been updated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleToggleBlock = (userId: string) => {
    const userToBlock = users?.find(u => u.id === userId);
    if (!userToBlock) return;
    const newState = !userToBlock.isBlocked;
    const userRef = doc(firestore, 'users', userId);
    updateDocumentNonBlocking(userRef, { isBlocked: newState, updatedAt: new Date().toISOString() });
    toast({
      title: newState ? "User Blocked" : "User Unblocked",
      description: `${userToBlock.name} status updated.`,
      variant: newState ? "destructive" : "default"
    });
  };

  if (isUserLoading || (user && isAdminCheckLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium animate-pulse">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasAdminAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] p-4">
        <Card className="max-w-md w-full text-center p-12 border-none shadow-2xl rounded-[2rem]">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Access Restricted</h2>
          <p className="text-muted-foreground mb-8">
            This dashboard is reserved for authorized library administrators.
          </p>
          <div className="space-y-4">
            {user ? (
              <div className="space-y-3">
                <Button 
                  onClick={handlePromoteSelf} 
                  disabled={isAdminPromoting} 
                  className="w-full h-12 rounded-xl gap-2 bg-primary hover:bg-primary/90"
                >
                  {isAdminPromoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Register as Administrator
                </Button>
                <p className="text-[10px] text-muted-foreground">Logged in as: {user.email}</p>
              </div>
            ) : (
              <p className="text-sm text-red-500 font-semibold mb-4">Please log in via the Kiosk first.</p>
            )}
            <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full h-12 rounded-xl">
              Return to Kiosk
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const renderFilterBar = () => (
    <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mr-2">
        <Filter className="w-4 h-4" />
        FILTERS
      </div>
      
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Reason</p>
        <Select value={reasonFilter} onValueChange={setReasonFilter}>
          <SelectTrigger className="w-[140px] h-9 rounded-lg">
            <SelectValue placeholder="All Reasons" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Reasons</SelectItem>
            <SelectItem value="Study">Study</SelectItem>
            <SelectItem value="Research">Research</SelectItem>
            <SelectItem value="Borrow/Return">Borrow</SelectItem>
            <SelectItem value="Meeting">Meeting</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">College</p>
        <Select value={collegeFilter} onValueChange={setCollegeFilter}>
          <SelectTrigger className="w-[180px] h-9 rounded-lg">
            <SelectValue placeholder="All Colleges" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Colleges</SelectItem>
            <SelectItem value="College of Computer Studies">Computer Studies</SelectItem>
            <SelectItem value="College of Engineering">Engineering</SelectItem>
            <SelectItem value="College of Nursing">Nursing</SelectItem>
            <SelectItem value="College of Business">Business</SelectItem>
            <SelectItem value="College of Arts and Sciences">Arts and Sciences</SelectItem>
            <SelectItem value="Administration">Administration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Account Type</p>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px] h-9 rounded-lg">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Roles</SelectItem>
            <SelectItem value="Student">Students</SelectItem>
            <SelectItem value="Employee">Employees (Staff/Prof)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        variant="ghost" 
        size="sm" 
        className="mt-5 text-xs text-primary hover:bg-primary/5"
        onClick={() => {
          setReasonFilter('All');
          setCollegeFilter('All');
          setRoleFilter('All');
          setSearchQuery('');
        }}
      >
        Clear Filters
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {renderFilterBar()}
            <StatsCards stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <TrafficCharts activeFilter={timeFilter} onFilterChange={setTimeFilter} />
               <Card className="border-none shadow-sm h-full">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Live Visitor Feed</CardTitle>
                    <CardDescription>Filtered activity in the library</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 px-6">
                    <div className="space-y-4">
                      {filteredVisitors.slice(0, 5).map((v) => (
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
                              <p className="text-[10px] text-muted-foreground">{v.role} • {v.college}</p>
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
              visitors={filteredVisitors} 
              users={users || []} 
              onToggleBlock={handleToggleBlock}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        );
      case 'visitors':
        return (
          <div className="animate-in fade-in duration-500">
            {renderFilterBar()}
            <VisitorTable 
              visitors={filteredVisitors} 
              users={users || []} 
              onToggleBlock={handleToggleBlock}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold">System Settings</h2>
            <div className="max-w-2xl space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Database Synchronization</CardTitle>
                  <CardDescription>Configure roles including Professors, Staff, and Administrators.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Update All Profiles</p>
                      <p className="text-sm text-muted-foreground">Sync roles for Paolo, JC Esperanza, and Jhun Balimbing.</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={seedSampleData} 
                      disabled={isSeeding}
                      className="gap-2"
                    >
                      {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                      Sync System
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return <div className="p-20 text-center text-muted-foreground">Detailed view coming soon for {activeTab}...</div>;
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
            <p className="text-[#6C757D]">Logged in as: {user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border flex items-center gap-2 text-sm font-medium text-green-600">
              <ShieldCheck className="w-4 h-4" />
              Verified Administrator
            </div>
          </div>
        </header>

        {renderContent()}
      </main>
      <Toaster />
    </div>
  );
}
