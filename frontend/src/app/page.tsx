'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Ticket, Search, BarChart3, Lock, Award, History } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 border-b border-slate-200 pt-10 pb-16 md:py-24">
        <div className="container-official max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            
            <div className="md:w-1/2 text-center md:text-left">
              <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-6">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Official National Lottery
              </span>
              
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
                Play Fair.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">
                  Win Big.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-500 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
                The first cryptographically secure lottery system in Nepal. 
                transparent, auditable, and built for trust.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/buy" className="btn-modern-primary text-lg px-8 py-4">
                  Buy Ticket - $4.00
                </Link>
                <Link href="/draw-history" className="btn-modern-outline text-lg px-8 py-4 bg-white">
                  Check Results
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center md:justify-start gap-6 text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-2"><Lock size={16} /> Secure Stripe Payment</div>
                <div className="flex items-center gap-2"><ShieldCheck size={16} /> Verified Fair</div>
              </div>
            </div>

            {/* Visual Card */}
            <div className="md:w-1/2 w-full px-4 md:px-0">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                
                <div className="relative bg-white border border-slate-100 rounded-2xl p-8 shadow-xl">
                  <div className="absolute top-0 right-0 p-4">
                     <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                       <Ticket size={24} />
                     </div>
                  </div>
                  
                  <div className="mb-8">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Jackpot</p>
                     <p className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                       $50,000<span className="text-2xl text-slate-300 align-top">+</span>
                     </p>
                     <p className="text-sm text-slate-500 mt-2 font-medium">Draw runs every Friday at 8:00 PM</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                     <div>
                       <p className="text-sm font-bold text-slate-700 mb-1">Winner Takes All</p>
                       <p className="text-xs text-slate-500">Single Draw Format</p>
                     </div>
                     <div>
                       <p className="text-sm font-bold text-slate-700 mb-1">Odds 1:38,760</p>
                       <p className="text-xs text-slate-500">Pick 6 of 20</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-white">
        <div className="container-official max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Nepal Loto?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We've reimagined the lottery experience to be completely honest and transparent.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<History className="text-indigo-600" />}
              title="Transparent History"
              desc="Access the complete history of every draw, winner, and ticket sold. Nothing is hidden."
            />
            <FeatureCard 
              icon={<Award className="text-rose-600" />}
              title="Provably Fair"
              desc="Our winner selection uses verifiable cryptography. You can audit the code yourself."
            />
            <FeatureCard 
              icon={<Search className="text-amber-500" />}
              title="Instant Verification"
              desc="Check your ticket status instantly. Winners are notified immediately via email."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all group">
      <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform text-2xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}
