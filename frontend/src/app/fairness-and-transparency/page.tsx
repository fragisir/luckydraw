"use client";

import Link from "next/link";
import {
  Shield,
  Lock,
  FileCode,
  CheckCircle2,
  Server,
  Terminal,
} from "lucide-react";

export default function FairnessPage() {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header Section */}
      <section className="bg-white border-b border-slate-200 py-16 md:py-20">
        <div className="container-official max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-100">
            <Shield className="w-3 h-3" />
            <span>Provably Fair Architecture</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Trust, Verify, then{" "}
            <span className="text-indigo-600">Trust Again.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            We assume you don't trust us. That's why we built a lottery system
            where every draw is cryptographically verifiable by anyone.
          </p>
        </div>
      </section>

      <div className="container-official max-w-5xl mx-auto px-6 py-16">
        {/* Core Pillars */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="modern-card p-8">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-6">
              <Lock size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">
              Immutable History
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Once a draw happens, its fingerprint (hash) is permanently
              recorded. We cannot change past results without breaking the
              cryptographic chain.
            </p>
          </div>
          <div className="modern-card p-8">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <Server size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">
              Hardware RNG
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              We use Node.js `crypto.randomBytes`, a standard for cryptographic
              security, ensuring the winning numbers are truly random and
              unpredictable.
            </p>
          </div>
          <div className="modern-card p-8">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
              <FileCode size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">
              Open Algorithm
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              The "lucky" ticket isn't picked by a person. It's picked by an
              open-source Fisher-Yates shuffle algorithm that you can audit
              below.
            </p>
          </div>
        </div>

        {/* Verification Snippet */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Terminal size={200} textAnchor="middle" className="text-white" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Verify it Yourself
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Use this Node.js script to independently verify any draw. You
                just need the <strong>Draw ID</strong>, <strong>Seed</strong>,
                and <strong>Winner</strong> from our public history page.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-slate-300">
                  <CheckCircle2 className="text-emerald-500 mr-3" size={20} />
                  <span>Verifies data integrity</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <CheckCircle2 className="text-emerald-500 mr-3" size={20} />
                  <span>Detects tampering instantly</span>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  href="/draw-history"
                  className="inline-flex items-center bg-white text-slate-900 font-bold py-3 px-6 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  Get Draw Data
                </Link>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 font-mono text-xs md:text-sm">
              <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="ml-2 text-slate-500">verify_draw.js</span>
              </div>
              <div className="p-6 text-slate-300 overflow-x-auto">
                <pre>{`const crypto = require('crypto');

// Inputs from Public History Page

const drawId = "d1-uuid-example"; 
const seed = "a1b2c3d4...";  // Seed used for RNG
const winner = "NPL6-2025-XXXX"; // Winning Ticket
const publishedHash = "8f43..."; // Published Hash

// Reconstruct & Hash
const data = \`\${drawId}|\${seed}|\${winner}\`;
const calcHash = crypto
  .createHash('sha256')
  .update(data)
  .digest('hex');

if (calcHash === publishedHash) {
  console.log("✅ MATCH: Draw is Fair");
} else {
  console.error("❌ ERROR: Data Mismatch");
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
