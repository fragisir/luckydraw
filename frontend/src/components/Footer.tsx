import Link from 'next/link';
import { Facebook, Twitter, Instagram, Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="container-official max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
              <span className="font-black text-xl text-slate-800 tracking-tight">NEPAL LOTO 6</span>
            </div>
            <p className="text-slate-500 leading-relaxed mb-6 max-w-sm text-sm">
              The modern, transparent way to play the lottery. Built with cryptographic fairness and government-grade security, designed for everyone.
            </p>
            <div className="flex gap-4">
              <SocialLink icon={<Facebook size={18} />} />
              <SocialLink icon={<Twitter size={18} />} />
              <SocialLink icon={<Instagram size={18} />} />
              <SocialLink icon={<Github size={18} />} />
            </div>
          </div>

          <div>
             <h5 className="font-bold text-slate-800 mb-4 text-sm">Game</h5>
             <ul className="space-y-3 text-sm text-slate-500">
               <li><Link href="/buy" className="hover:text-indigo-600 transition-colors">Buy Ticket</Link></li>
               <li><Link href="/draw-history" className="hover:text-indigo-600 transition-colors">Draw Results</Link></li>
               <li><Link href="/search" className="hover:text-indigo-600 transition-colors">Check Status</Link></li>
               <li><Link href="/calculate-odds" className="hover:text-indigo-600 transition-colors">Winning Odds</Link></li>
             </ul>
          </div>

          <div>
             <h5 className="font-bold text-slate-800 mb-4 text-sm">Support</h5>
             <ul className="space-y-3 text-sm text-slate-500">
               <li><Link href="/fairness-and-transparency" className="hover:text-indigo-600 transition-colors">Fairness Policy</Link></li>
               <li><Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
               <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
               <li><a href="#" className="hover:text-indigo-600 transition-colors">Help Center</a></li>
             </ul>
          </div>

        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
          <p>© 2025 Nepal Loto 6. All rights reserved.</p>
          <div className="flex items-center gap-1 mt-2 md:mt-0">
            <span>Developed by</span>  <span>Roshan Basnet</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ icon }: any) {
  return (
    <a href="#" className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
      {icon}
    </a>
  );
}
