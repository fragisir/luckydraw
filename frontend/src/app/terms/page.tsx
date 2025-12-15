'use client';

import Link from 'next/link';
import { ShieldCheck, Scale, Gavel, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-900 py-16 text-center">
        <h1 className="text-4xl font-black text-white tracking-tight mb-4">Terms & Conditions</h1>
        <p className="text-slate-400 max-w-2xl mx-auto px-4">
          Please read these terms carefully before participating in Nepal Loto 6. By playing, you agree to be bound by these rules.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        
        {/* Section 1: Intro */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
               <Scale size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">1. Introduction</h2>
          </div>
          <p className="text-slate-600 leading-relaxed pl-14">
            Welcome to Nepal Loto 6. These Terms and Conditions constitute a legally binding agreement between you ("User") and Nepal Loto 6 ("Platform"). 
            The lottery is operated responsibly and adheres to transparency standards using cryptographic verification.
          </p>
        </section>

        {/* Section 2: Eligibility */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
               <CheckCircle2 size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">2. Eligibility</h2>
          </div>
          <ul className="space-y-3 pl-14 text-slate-600">
             <li className="flex gap-2">
               <span className="font-bold text-slate-900">•</span> You must be at least 18 years of age (or legal gambling age in your jurisdiction) to purchase tickets.
             </li>
             <li className="flex gap-2">
               <span className="font-bold text-slate-900">•</span> Employees of Nepal Loto 6 and their immediate family members are prohibited from participating to ensure fairness.
             </li>
             <li className="flex gap-2">
               <span className="font-bold text-slate-900">•</span> You warrant that your participation does not violate any local laws applicable to you.
             </li>
          </ul>
        </section>

        {/* Section 3: Game Rules */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
               <Gavel size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">3. Game Rules</h2>
          </div>
          <div className="pl-14 space-y-4 text-slate-600">
             <p>
               <strong>3.1 Ticket Purchase:</strong> Each ticket costs NPR 500. Users select 6 unique numbers from a pool of 1-20. Once purchased, tickets cannot be refunded or modified.
             </p>
             <p>
               <strong>3.2 Draw Process:</strong> Draws are conducted electronically using a cryptographically secure random number generator (CSPRNG). Results are final and immutable.
             </p>
             <p>
               <strong>3.3 Winning & Prizes:</strong> Prizes are awarded for matching 4, 5, or 6 numbers.
               <br/>- 6 Matches: Jackpot
               <br/>- 5 Matches: 2nd Prize
               <br/>- 4 Matches: 3rd Prize
             </p>
          </div>
        </section>

        {/* Section 4: Liability */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
               <ShieldCheck size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">4. Limitation of Liability</h2>
          </div>
          <p className="text-slate-600 leading-relaxed pl-14">
             Nepal Loto 6 is not liable for technical failures, internet connectivity issues, or unauthorized access to your account. 
             We reserve the right to cancel or void any draw in the event of a catastrophic system failure or security breach, in which case refunds will be issued.
          </p>
        </section>

         {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 mt-8">
           <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
           <div>
              <h4 className="font-bold text-amber-900">Responsible Gaming</h4>
              <p className="text-sm text-amber-800 mt-1">
                 Lottery games involve risk. Please play responsibly and within your means. If you suspect you have a gambling problem, please seek professional help immediately.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
