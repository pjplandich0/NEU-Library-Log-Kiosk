"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useFirestore, useAuth } from '@/firebase';
import { collection, query, where, getDocs, limit, doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Scan, CheckCircle2, User as UserIcon, Loader2, Shield } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LibraryExit() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [view, setView] = useState<'exit' | 'success'>('exit');
  const [identifiedUser, setIdentifiedUser] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const logo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const handleExitProcess = async (identifier: string, type: 'rfid' | 'google') => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      let userIdToLookup = null;
      let userData = null;

      if (type === 'google') {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        
        userIdToLookup = result.user.uid;
        
        // Try to get user data from firestore
        const userRef = doc(firestore, 'users', userIdToLookup);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          userData = { ...userSnap.data(), id: userSnap.id };
        } else {
          // Fallback if record not yet synced
          userData = { 
            id: userIdToLookup, 
            name: result.user.displayName || 'Visitor',
            email: result.user.email 
          };
        }
      } else {
        // RFID Path
        const userQ = query(collection(firestore, 'users'), where('rfidTag', '==', identifier), limit(1));
        const userSnap = await getDocs(userQ);
        
        if (userSnap.empty) {
          toast({ variant: "destructive", title: "Not Found", description: "RFID tag not recognized." });
          return;
        }

        userData = { ...userSnap.docs[0].data(), id: userSnap.docs[0].id };
        userIdToLookup = userData.id;
      }

      // Look for an active session (no check-out time) for the identified userId
      const logQ = query(collection(firestore, 'visitLogs'), where('userId', '==', userIdToLookup));
      const logSnap = await getDocs(logQ);
      
      const activeLog = logSnap.docs
        .map(d => ({ id: d.id, ...d.data() as any }))
        .filter(log => !log.checkOutTime)
        .sort((a, b) => {
          const timeA = a.checkInTime?.seconds || 0;
          const timeB = b.checkInTime?.seconds || 0;
          return timeB - timeA;
        })[0];

      if (activeLog) {
        await updateDoc(doc(firestore, 'visitLogs', activeLog.id), {
          checkOutTime: Timestamp.now()
        });
        setIdentifiedUser(userData);
        setView('success');
        setTimeout(() => {
          setView('exit');
          setIdentifiedUser(null);
        }, 5000);
      } else {
        toast({ title: "No Active Session", description: "You are not currently checked into the library." });
      }
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to process exit." });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAdminLogin = async () => {
    setIsVerifying(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      const adminRef = doc(firestore, 'admins', result.user.uid);
      const adminSnap = await getDoc(adminRef);

      const adminEmails = ['paolojhay.landicho@neu.edu.ph', 'jcesperanza@neu.edu.ph'];
      const isExplicitAdmin = adminEmails.includes(result.user.email || '');

      if (adminSnap.exists() || isExplicitAdmin) {
        window.location.href = '/admin';
      } else {
        toast({ 
          title: "Admin Access Denied", 
          description: "Your account is not registered as an administrator.",
          variant: "destructive"
        });
        setTimeout(() => setIsVerifying(false), 2000);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Admin Login Failed", description: error.message });
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
          <h2 className="text-3xl font-bold text-[#1A1C1E]">Goodbye! Come again.</h2>
          <p className="text-xl font-bold text-primary">{identifiedUser?.name}</p>
          <p className="text-[#6C757D]">Thank you for using the library. Have a safe trip!</p>
          <div className="pt-4">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full animate-[progress_5s_linear_forwards]" style={{ width: '0%' }} />
            </div>
          </div>
        </Card>
        <style jsx>{` @keyframes progress { from { width: 0%; } to { width: 100%; } } `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E9F0FF] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-8 right-8 z-50">
        <Button 
          variant="outline" 
          onClick={handleAdminLogin}
          className="rounded-full bg-white border-2 border-primary text-primary hover:bg-slate-50 transition-all shadow-md px-6 py-4 flex items-center gap-3 hover:scale-105"
        >
          {isVerifying ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Shield className="w-5 h-5 fill-primary/10" />
              <span className="font-bold tracking-wide uppercase text-xs">Admin Login</span>
            </>
          )}
        </Button>
      </div>

      <Card className="max-w-[720px] w-full bg-white/90 backdrop-blur-2xl border-none shadow-2xl rounded-[3rem] p-10 md:p-16 text-center flex flex-col items-center">
        {logo && (
          <div className="mb-8 relative w-32 h-32">
            <Image 
              src={logo.imageUrl} 
              alt={logo.description} 
              width={128} 
              height={128} 
              className="object-contain"
              priority
              data-ai-hint={logo.imageHint}
            />
          </div>
        )}
        <div className="mb-10 flex flex-col items-center justify-center w-full">
           <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tighter uppercase leading-none">
             NEW ERA UNIVERSITY
           </h2>
           <h2 className="text-2xl md:text-3xl font-bold text-[#1A1C1E] tracking-tight mt-1">
             LIBRARY
           </h2>
        </div>
        <h1 className="text-5xl font-extrabold text-[#1A1C1E] mb-2 tracking-tight">Library Exit</h1>
        <p className="text-[#6C757D] text-lg mb-12">Please check out before leaving</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <button onClick={() => handleExitProcess('RFID-PAOLO', 'rfid')} className="group bg-[#4F81FF] hover:bg-[#3B71F2] transition-all rounded-[2rem] p-8 text-white flex flex-col items-center space-y-2 shadow-lg active:scale-95 text-center text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              {isVerifying ? <Loader2 className="w-8 h-8 animate-spin" /> : <Scan className="w-8 h-8" />}
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-bold">RFID Checkout</h3>
              <p className="text-xs text-white/70">Tap card to leave</p>
            </div>
          </button>
          <button onClick={() => handleExitProcess('', 'google')} className="group bg-white hover:bg-slate-50 transition-all rounded-[2rem] p-8 border text-[#1A1C1E] flex flex-col items-center space-y-2 shadow-sm active:scale-95 text-center text-center">
            <div className="w-16 h-16 bg-[#E9F0FF] text-[#4F81FF] rounded-full flex items-center justify-center">
              {isVerifying ? <Loader2 className="w-8 h-8 animate-spin" /> : <UserIcon className="w-8 h-8" />}
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-bold">Google Logout</h3>
              <p className="text-xs text-[#6C757D]">Sign out of session</p>
            </div>
          </button>
        </div>
      </Card>
      <footer className="mt-8 text-[#6C757D] text-sm font-medium">Kiosk ID: LIB-EXT-01</footer>
      <Toaster />
    </div>
  );
}
