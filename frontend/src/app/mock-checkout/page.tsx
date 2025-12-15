'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, Lock, ArrowLeft, Loader2, Landmark, QrCode, Smartphone } from 'lucide-react';
import Link from 'next/link';

function MockCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ticketNumber = searchParams.get('ticket_number');
  const amount = searchParams.get('amount') || '400';

  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'CARD' | 'BANK' | 'QR'>('CARD');
  const [cardNumber, setCardNumber] = useState('');

  const handlePay = () => {
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      router.push(`/success?ticket_number=${ticketNumber}`);
    }, 2000);
  };

  // Format currency (NPR for local feel, or USD as per current)
  // Converting 400 cents USD to approx NPR for display if needed, but keeping USD for now or switching to NPR 500
  const displayAmount = method === 'CARD' ? '$4.00' : 'NPR 500.00';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans text-slate-600">
      
      {/* Left Panel: Summary */}
      <div className="w-full md:w-1/2 bg-slate-50 p-8 md:p-12 border-r border-slate-200 flex flex-col">
        <div className="mb-8">
          <Link href="/buy" className="text-slate-400 hover:text-slate-800 flex items-center gap-2 text-sm font-bold">
            <ArrowLeft size={16} /> Cancel
          </Link>
        </div>

        <div className="flex-grow">
          <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Pay Nepal Loto 6</p>
          <h1 className="text-4xl text-slate-900 font-black mb-8">{displayAmount}</h1>

          <div className="space-y-4">
             <div className="flex gap-4 items-start">
                <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center justify-center p-2">
                   <img src="/logo.png" className="w-full h-full object-contain opacity-80" alt="Logo" />
                </div>
                <div>
                   <h3 className="font-bold text-slate-800">Standard Ticket</h3>
                   <p className="text-sm text-slate-500">Draw Entry: One-time payment</p>
                   <p className="text-xs text-slate-400 mt-1 font-mono">{ticketNumber}</p>
                </div>
             </div>
          </div>
        </div>
        
        <div className="mt-8 text-xs text-slate-400 flex items-center gap-2">
          Powered by <span className="font-bold text-slate-600">DEMO PAY</span> 
          <span className="bg-slate-200 px-1 rounded text-[10px]">TEST MODE</span>
        </div>
      </div>

      {/* Right Panel: Payment Form */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Select Payment Method</h2>

          {/* Payment Method Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            <button 
              onClick={() => setMethod('CARD')}
              className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center gap-2 transition-all ${method === 'CARD' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <CreditCard size={20} /> Card
            </button>
            <button 
              onClick={() => setMethod('BANK')}
              className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center gap-2 transition-all ${method === 'BANK' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <Landmark size={20} /> Bank
            </button>
            <button 
              onClick={() => setMethod('QR')}
              className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center gap-2 transition-all ${method === 'QR' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <QrCode size={20} /> QR Pay
            </button>
          </div>

          <div className="space-y-6">
            
            {/* CARD FORM */}
            {method === 'CARD' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 block">Card Information</label>
                  <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-2">
                        <CreditCard size={18} className="text-slate-400" />
                        <input 
                          placeholder="Card number" 
                          className="w-full outline-none placeholder-slate-300 font-mono text-slate-700"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div className="flex divide-x divide-slate-100">
                        <input placeholder="MM / YY" className="w-1/2 px-4 py-3 bg-white outline-none placeholder-slate-300 font-mono text-slate-700" />
                        <input placeholder="CVC" className="w-1/2 px-4 py-3 bg-white outline-none placeholder-slate-300 font-mono text-slate-700" />
                      </div>
                  </div>
                </div>
                <div className="bg-indigo-50 text-indigo-800 text-xs p-3 rounded border border-indigo-100">
                  Accepting Visa, Mastercard, and UnionPay.
                </div>
              </div>
            )}

            {/* BANK TRANSFER */}
            {method === 'BANK' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                    <p className="font-bold text-slate-700 mb-2">ConnectIPS / Bank Credentials</p>
                    <select className="w-full p-2 border border-slate-200 rounded-lg mb-2">
                      <option>Nabil Bank</option>
                      <option>Global IME</option>
                      <option>NIC Asia</option>
                      <option>Siddhartha Bank</option>
                    </select>
                    <input placeholder="Username" className="w-full p-2 border border-slate-200 rounded-lg mb-2" />
                    <input type="password" placeholder="Password" className="w-full p-2 border border-slate-200 rounded-lg" />
                 </div>
                 <div className="flex items-center gap-2 text-xs text-slate-500">
                   <ShieldCheck size={12} className="text-emerald-500" /> Secure 256-bit encryption
                 </div>
              </div>
            )}

            {/* QR PAY */}
            {method === 'QR' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 text-center">
                 <div className="bg-white p-6 rounded-xl border-2 border-dashed border-slate-200 inline-block">
                    <div className="w-48 h-48 bg-slate-900 rounded-lg flex items-center justify-center text-white mb-4 relative overflow-hidden">
                       <QrCode size={100} />
                       <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-indigo-500/30"></div>
                    </div>
                    <p className="font-bold text-slate-800">Scan with eSewa / Khalti</p>
                 </div>
                 <p className="text-sm text-slate-500 max-w-xs mx-auto">
                   Open your mobile wallet app and scan the code above to pay instantly.
                 </p>
              </div>
            )}

            <button 
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : `Pay ${displayAmount}`}
            </button>
            
          </div>
        </div>
      </div>

    </div>
  );
}

export default function MockCheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MockCheckoutContent />
    </Suspense>
  )
}
