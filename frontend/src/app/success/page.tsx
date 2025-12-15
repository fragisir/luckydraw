'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Download, ArrowRight, Ticket, Mail } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const ticketNumber = searchParams.get('ticket_number'); // Note: backend usually sends this in URL

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Success Animation Card */}
        <div className="modern-card text-center p-8 md:p-12 relative overflow-hidden border-t-8 border-t-emerald-500">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg-pattern.svg')] opacity-5 pointer-events-none"></div>
          
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" strokeWidth={3} />
          </div>

          <h1 className="text-3xl font-black text-slate-800 mb-2">Payment Successful!</h1>
          <p className="text-slate-500 mb-8">You are officially entered into the draw.</p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 relative">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Official Ticket
            </div>
            
            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Ticket Number</p>
            <p className="text-2xl font-mono font-bold text-indigo-600 tracking-wider">
              {ticketNumber || 'Generating...'}
            </p>
          </div>

          <div className="space-y-3 mb-8 text-left">
            <div className="flex items-start">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3 text-indigo-600 shrink-0">
                <Mail size={18} />
              </div>
              <div>
                 <p className="text-sm font-bold text-slate-800">Check your Email</p>
                 <p className="text-xs text-slate-500">We've sent a PDF copy of your ticket and receipt.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link 
              href={ticketNumber ? `/search?ticket=${ticketNumber}` : '/search'}
              className="w-full btn-modern-primary"
            >
              Verify My Ticket
            </Link>
            <Link 
              href="/"
              className="w-full btn-modern-outline border-none shadow-none text-slate-500 hover:bg-slate-50"
            >
              Back to Home
            </Link>
          </div>

        </div>
        
        <p className="text-center text-xs text-slate-400 mt-6">
          System ID: {Math.random().toString(36).substring(7).toUpperCase()} • Time: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
