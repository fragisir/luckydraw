'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Helper for active link styles
  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href;
    return (
      <Link 
        href={href} 
        className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
          active 
            ? 'bg-indigo-50 text-indigo-700' 
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      {/* Top Trust Bar */}
      <div className="bg-indigo-600 text-white text-[10px] md:text-xs font-bold py-1.5 text-center tracking-wide">
         OFFICIAL NEPAL NATIONAL LOTTERY • SECURE • TRANSPARENT
      </div>

      <div className="container-official max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
            <img src="/logo.png" alt="Loto Logo" className="h-10 w-auto relative z-10" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-black text-slate-800 leading-none tracking-tight group-hover:text-indigo-700 transition-colors">
              NEPAL LOTO <span className="text-rose-500">6</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Official System</p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1 bg-white border border-slate-100 p-1 rounded-full shadow-sm">
           <NavLink href="/" label="Home" />
           <NavLink href="/buy" label="Buy Ticket" />
           <NavLink href="/search" label="Verify" />
           <NavLink href="/draw-history" label="Results" />
        </div>

        {/* Action / Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
            <ShieldCheck size={14} /> Admin
          </Link>
          
          <Link href="/buy" className="hidden md:inline-flex btn-modern-action py-2 px-5 text-sm shadow-md shadow-rose-200">
            Play Now
          </Link>

          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-4 shadow-xl flex flex-col gap-2 animate-in slide-in-from-top-5">
           <Link href="/" className="p-3 font-bold text-slate-700 hover:bg-indigo-50 rounded-xl" onClick={() => setIsOpen(false)}>Home</Link>
           <Link href="/buy" className="p-3 font-bold text-slate-700 hover:bg-indigo-50 rounded-xl" onClick={() => setIsOpen(false)}>Buy Ticket</Link>
           <Link href="/search" className="p-3 font-bold text-slate-700 hover:bg-indigo-50 rounded-xl" onClick={() => setIsOpen(false)}>Check Results</Link>
           <Link href="/draw-history" className="p-3 font-bold text-slate-700 hover:bg-indigo-50 rounded-xl" onClick={() => setIsOpen(false)}>History</Link>
           <Link href="/buy" className="mt-2 w-full btn-modern-action text-center" onClick={() => setIsOpen(false)}>
             Play Now
           </Link>
        </div>
      )}
    </nav>
  );
}
