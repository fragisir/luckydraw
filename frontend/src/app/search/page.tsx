'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchTicket } from '../../../lib/api';
import { Loader2, Search, CheckCircle2, XCircle, Clock, PartyPopper, Hash, RefreshCcw, SkipForward } from 'lucide-react';

function SearchComponent() {
  const searchParams = useSearchParams();
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Animation States
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const revealTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const q = searchParams.get('ticket');
    if (q) {
      setTicketNumber(q);
      handleSearch(q);
    }
  }, [searchParams]);

  // Clean up timer
  useEffect(() => {
    return () => { if(revealTimer.current) clearTimeout(revealTimer.current); };
  }, []);

  const handleSearch = async (query = ticketNumber) => {
    if (!query) return;
    setLoading(true);
    setError('');
    setTicket(null);
    setIsRevealing(false);
    setRevealedIndex(-1);

    try {
      const res = await searchTicket(query);
      if (res.success) {
        setTicket(res.ticket);
        
        // Start animation ONLY if draw is complete
        if (res.ticket.drawStatus === 'DRAWN' && res.ticket.winningNumbers?.length > 0) {
           startRevealSequence(res.ticket.winningNumbers.length);
        }
      } else {
        setError('Ticket number not found in our records.');
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Ticket number not found. Please check your spelling.');
      } else {
        setError('System unavailable. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const startRevealSequence = (total: number) => {
    setIsRevealing(true);
    setRevealedIndex(0);
    
    // Recursive timeout for sequencing
    let current = 0;
    const step = () => {
      revealTimer.current = setTimeout(() => {
        setRevealedIndex(prev => {
          const next = prev + 1;
          if (next < total) {
             step(); // Schedule next
             return next;
          } else {
             setIsRevealing(false); // Done
             return next;
          }
        });
      }, 5000); // 5-second delay as requested
    };
    step();
  };

  const skipAnimation = () => {
    if(revealTimer.current) clearTimeout(revealTimer.current);
    setRevealedIndex(6); // Show all
    setIsRevealing(false);
  };

  // Helper to check match
  const isMatch = (num: number) => ticket?.matches && ticket.winningNumbers.includes(num);

  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-20 flex flex-col items-center p-4">
      <div className="max-w-2xl w-full">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
            <Search className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">Check Your Ticket</h1>
          <p className="text-slate-500">Enter your 16-character Ticket ID to verify results.</p>
        </div>

        <div className="modern-card p-2 mb-8 flex items-center relative shadow-lg">
          <input 
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
            placeholder="NPL6-202X-..."
            className="flex-grow bg-transparent border-none px-6 py-4 text-lg font-mono text-slate-800 placeholder-slate-300 focus:ring-0 outline-none uppercase tracking-wide"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={() => handleSearch()}
            disabled={loading || isRevealing}
            className="btn-modern-primary m-1 !py-3 !px-6"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Check'}
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-100 flex items-center animate-fade-in mb-6">
            <XCircle className="w-5 h-5 mr-3 flex-shrink-0" /> {error}
          </div>
        )}

        {ticket && (
          <div className="modern-card overflow-hidden animate-slide-up">
            
            {/* 1. Header Area: Draw Status */}
            <div className={`
              py-6 px-8 text-center flex flex-col items-center justify-center border-b border-slate-100
              ${ticket.drawStatus === 'DRAWN' ? 'bg-indigo-50' : 'bg-slate-100'}
            `}>
              {ticket.drawStatus === 'PENDING' ? (
                 <>
                   <Clock className="w-10 h-10 mb-2 text-slate-400" />
                   <h2 className="text-xl font-bold text-slate-700">Draw Pending</h2>
                   <p className="text-sm text-slate-500">Results will be available after the draw.</p>
                 </>
              ) : isRevealing ? (
                 <>
                   <RefreshCcw className="w-10 h-10 mb-2 text-indigo-600 animate-spin" />
                   <h2 className="text-xl font-bold text-indigo-900">Live Draw Reveal</h2>
                   <p className="text-sm text-indigo-600">Revealing winning numbers...</p>
                 </>
              ) : (
                 <>
                   {ticket.prizeTier === 'JACKPOT' && <PartyPopper className="w-12 h-12 text-amber-500 mb-2 animate-bounce" />}
                   <h2 className="text-2xl font-black uppercase tracking-widest text-slate-800">
                     {ticket.prizeTier.replace('_', ' ')}
                   </h2>
                   <p className="text-sm font-bold text-slate-500">
                     {ticket.matches}/6 Matches Found
                   </p>
                 </>
              )}
            </div>

            <div className="p-8 space-y-8">
              
              {/* 2. Winning Numbers Animation Area */}
              {ticket.drawStatus === 'DRAWN' && (
                <div>
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Winning Numbers</h3>
                     {isRevealing && (
                       <button onClick={skipAnimation} className="text-xs font-bold text-indigo-600 flex items-center hover:underline">
                         <SkipForward size={12} className="mr-1" /> Skip Animation
                       </button>
                     )}
                   </div>
                   
                   <div className="flex flex-wrap justify-center gap-3">
                     {ticket.winningNumbers.map((num: number, i: number) => {
                       const isVisible = i <= revealedIndex;
                       return (
                         <div 
                           key={i} 
                           className={`
                             w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-700
                             ${isVisible 
                               ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg scale-100 rotate-0' 
                               : 'bg-slate-100 text-transparent scale-50 rotate-180'}
                           `}
                         >
                           {num}
                         </div>
                       );
                     })}
                   </div>
                </div>
              )}

              {/* 3. User Selection & Matches */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">Your Ticket Numbers</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {ticket.selectedNumbers.map((num: number) => {
                    const isWinningMatch = isMatch(num) && (revealedIndex >= ticket.winningNumbers.indexOf(num)); // Only highlight if revealed
                    // Actually checking indexOf is tricky if not sorted same. 
                    // Simpler: highlight if isMatch AND (revealedIndex === 6 OR !isRevealing).
                    // Or for perfect sync: highlight when *that specific number* appears in the winning set. 
                    // Since winning set is revealed one by one, we can check if `num` exists in `ticket.winningNumbers.slice(0, revealedIndex + 1)`
                    
                    const revealedWinners = ticket.winningNumbers.slice(0, revealedIndex + 1);
                    const isConfirmedMatch = revealedWinners.includes(num);

                    return (
                      <div 
                        key={num} 
                        className={`
                          w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center font-bold text-lg border-2 transition-all duration-500
                          ${isConfirmedMatch
                             ? 'border-emerald-500 bg-emerald-50 text-emerald-700 scale-110 shadow-emerald-200 shadow-md' 
                             : 'border-slate-100 bg-white text-slate-600'}
                        `}
                      >
                         {num}
                         {isConfirmedMatch && <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-0.5"><CheckCircle2 size={12} /></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Ticket Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-6">
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Owner</label>
                    <p className="font-semibold text-slate-800">{ticket.name}</p>
                 </div>
                 <div className="text-right">
                    <label className="text-xs font-bold text-slate-400 uppercase">Ticket ID</label>
                    <p className="font-mono text-slate-600">{ticket.ticketNumber}</p>
                 </div>
                 {ticket.paymentStatus && (
                  <div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${ticket.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {ticket.paymentStatus}
                    </span>
                  </div>
                 )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center bg-slate-50"><Loader2 className="animate-spin text-indigo-500" /></div>}>
      <SearchComponent />
    </Suspense>
  )
}
