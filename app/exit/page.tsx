
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useFirestore, useAuth } from '@/firebase';
import { collection, query, where, getDocs, limit, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Mail, Scan, CheckCircle2, HelpCircle, User as UserIcon, Loader2 } from 'lucide-react';

export default function LibraryExit() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [view, setView] = useState<'exit' | 'success'>('exit');
  const [identifiedUser, setIdentifiedUser] = useState<any>(null);
  const [emailInput, setEmailInput] = useState('');
  const [rfidBuffer, setRfidBuffer] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // RFID Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'exit' || !e || !e.key) return;
      
      if (e.key === 'Enter') {
        if (rfidBuffer.length > 3) {
          handleExitProcess(rfidBuffer.trim(), 'rfid');
        }
        setRfidBuffer('');
      } else if (e.key && e.key.length === 1) {
        setRfidBuffer(prev => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rfidBuffer, view]);

  const handleExitProcess = async (identifier: string, type: 'email' | 'rfid') => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      let userQuery;
      if (type === 'email') {
        userQuery = query(collection(firestore, 'users'), where('email', '==', identifier), limit(1));
      } else {
        userQuery = query(collection(firestore, 'users'), where('rfidTag', '==', identifier), limit(1));
      }

      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Not Found",
          description: "No student record found for this identifier.",
        });
        setIsVerifying(false);
        return;
      }

      const userData = { ...userSnapshot.docs[0].data(), id: userSnapshot.docs[0].id };
      
      // Query visit logs for this user (Removing orderBy to avoid Index requirement)
      const logQuery = query(
        collection(firestore, 'visitLogs'),
        where('userId', '==', userData.id)
      );

      const logSnapshot = await getDocs(logQuery);
      if (!logSnapshot.empty) {
        // Find the most recent log WITHOUT a check-out time in memory
        const activeLogs = logSnapshot.docs
          .map(d => ({ id: d.id, ...d.data() as any }))
          .filter(log => !log.checkOutTime);
        
        if (activeLogs.length > 0) {
          // Sort in memory to avoid needing a Firestore composite index
          activeLogs.sort((a, b) => {
            const timeA = a.checkInTime instanceof Timestamp ? a.checkInTime.toMillis() : new Date(a.checkInTime).getTime();
            const timeB = b.checkInTime instanceof Timestamp ? b.checkInTime.toMillis() : new Date(b.checkInTime).getTime();
            return timeB - timeA;
          });

          const latestActiveLog = activeLogs[0];
          await updateDoc(doc(firestore, 'visitLogs', latestActiveLog.id), {
            checkOutTime: Timestamp.now()
          });
          
          setIdentifiedUser(userData);
          setView('success');
          
          setTimeout(() => {
            setView('exit');
            setIdentifiedUser(null);
            setEmailInput('');
            setIsVerifying(false);
          }, 5000);
        } else {
          toast({
            title: "No Active Session",
            description: "You don't have an active library visit to check out from.",
          });
          setIsVerifying(false);
          return;
        }
      } else {
        toast({
          variant: "destructive",
          title: "No History",
          description: "No visit history found for this account.",
        });
        setIsVerifying(false);
        return;
      }

    } catch (error: any) {
      console.error("Exit process error:", error);
      toast({
        variant: "destructive",
        title: "Exit Error",
        description: error.message || "Failed to log your exit.",
      });
      setIsVerifying(false);
    }
  };

  const handleGoogleSSO = async () => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user?.email) {
        await handleExitProcess(result.user.email, 'email');
      } else {
        setIsVerifying(false);
      }
    } catch (error: any) {
      console.error("Exit SSO error:", error);
      toast({
        variant: "destructive",
        title: "Auth Failed",
        description: error.message || "Google logout failed.",
      });
      setIsVerifying(false);
    }
  };

  if (view === 'success') {
    return (
      <div className="min-h-screen bg-[#E9F0FF] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-12 text-center space-y-6 rounded-[2.5rem] border-none shadow-2xl bg-white/80 backdrop-blur-xl">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-[#1A1C1E]">Goodbye!</h2>
          <p className="text-xl font-bold text-primary">{identifiedUser?.name}</p>
          <p className="text-[#6C757D]">Thank you for using the library. Come again!</p>
          <div className="pt-4">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full animate-[progress_5s_linear_forwards]" style={{ width: '0%' }} />
            </div>
            <p className="mt-4 text-xs text-[#6C757D] font-medium uppercase tracking-widest">Returning to Home in 5s...</p>
          </div>
        </Card>
        <style jsx>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E9F0FF] flex flex-col items-center justify-center p-4">
      <Card className="max-w-[720px] w-full bg-white/90 backdrop-blur-2xl border-none shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] rounded-[3rem] p-10 md:p-16 flex flex-col items-center text-center">
        
        <div className="mb-8 relative w-40 h-40 flex items-center justify-center">
           <Image 
             src="/neu.png" 
             alt="NEU Logo" 
             width={160} 
             height={160} 
             className="object-contain"
             priority
           />
        </div>

        <h1 className="text-5xl font-extrabold text-[#1A1C1E] mb-2 tracking-tight">Library Exit</h1>
        <p className="text-[#6C757D] text-lg mb-12">Please check out before leaving the premises</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
          <button 
            disabled={isVerifying}
            onClick={() => handleExitProcess('RFID-123', 'rfid')}
            className="group relative bg-[#4F81FF] hover:bg-[#3B71F2] transition-all duration-300 rounded-[2rem] p-8 text-white flex flex-col items-center justify-center space-y-4 shadow-lg hover:shadow-xl active:scale-95 overflow-hidden disabled:opacity-70"
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              {isVerifying ? <Loader2 className="w-8 h-8 animate-spin" /> : <Scan className="w-8 h-8" />}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-1">RFID Checkout</h3>
              <p className="text-white/80 text-sm">Tap student ID to log your exit</p>
            </div>
          </button>

          <button 
            disabled={isVerifying}
            onClick={handleGoogleSSO}
            className="group bg-white hover:bg-slate-50 transition-all duration-300 rounded-[2rem] p-8 border border-slate-100 text-[#1A1C1E] flex flex-col items-center justify-center space-y-4 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-70"
          >
            <div className="w-16 h-16 bg-[#E9F0FF] text-[#4F81FF] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              {isVerifying ? <Loader2 className="w-8 h-8 animate-spin" /> : <UserIcon className="w-8 h-8" />}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-1">Google Logout</h3>
              <p className="text-[#6C757D] text-sm">Sign out with university email</p>
            </div>
          </button>
        </div>

        <div className="w-full max-w-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[10px] font-bold tracking-widest text-[#6C757D] uppercase">Manual Logout</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C757D]" />
              <Input 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExitProcess(emailInput, 'email')}
                placeholder="Enter student email" 
                className="pl-12 h-14 bg-[#F8FAFF] border-none rounded-2xl text-lg focus-visible:ring-primary/20"
                disabled={isVerifying}
              />
            </div>
            <Button 
              disabled={isVerifying}
              onClick={() => handleExitProcess(emailInput, 'email')}
              className="w-full h-14 bg-[#0F172A] hover:bg-black text-white rounded-2xl text-lg font-semibold transition-all shadow-lg active:scale-[0.98]"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </div>
              ) : 'Confirm Exit'}
            </Button>
          </div>
        </div>
      </Card>

      <footer className="mt-12 w-full max-w-[720px] flex items-center justify-between px-6 text-[#6C757D] text-sm">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#4F81FF]" />
          <span>Leaving? Make sure all borrowed books are returned</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono bg-white/50 px-2 py-1 rounded">Kiosk ID: LIB-04-B (Exit)</span>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
