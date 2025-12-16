"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getDrawHistory, getPublicDrawStatus } from "../../../lib/api";
import { Loader2, Calendar, Trophy, ArrowRight, Hash } from "lucide-react";

import { io } from "socket.io-client";

export default function DrawHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Notification State
  const [liveNotification, setLiveNotification] = useState<{
    type: "SALES_STOPPED" | "RESULT";
    data?: any;
  } | null>(null);
  // Socket  and Initial Data Fetch
  useEffect(() => {
    // Initial Fetch
    fetchHistory();
    checkActiveStatus(); // Check if draw is currently stopped (persisted state)

    // Socket Connection
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Connected to Live Server");
    });

    // 1. Sales Stopped -> Show "Draw Starting"
    socket.on("salesStopped", (data) => {
      console.log("Sales Stopped Event:", data);
      setLiveNotification({
        type: "SALES_STOPPED",
        data,
      });
    });

    // 2. Draw Result -> Show Result and Refresh List
    socket.on("drawResult", (newDraw) => {
      console.log("New Draw Result:", newDraw);
      // Refresh list
      setHistory((prev) => [newDraw, ...prev]);
      // Show Live Banner
      setLiveNotification({
        type: "RESULT",
        data: newDraw,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchHistory = () => {
    getDrawHistory().then((res) => {
      if (res.success) {
        setHistory(res.history);
        // Check if a draw is very recent (optional implementation for persistent recentness on refresh)
        if (res.history.length > 0) {
          const latest = res.history[0];
          const diff =
            new Date().getTime() - new Date(latest.drawDateTime).getTime();
          if (diff < 60000) {
            // Only set if we don't have a notification yet (to avoid overwriting real-time flow)
            setLiveNotification({ type: "RESULT", data: latest });
          }
        }
      }
      setLoading(false);
    });
  };
  // Check Active Draw Status (for page load state)

  const checkActiveStatus = () => {
    getPublicDrawStatus()
      .then((res) => {
        if (res.success && res.draw && res.draw.status === "STOPPED") {
          // If we don't have a newer result notification, show Stopped banner
          setLiveNotification((prev) => {
            if (prev && prev.type === "RESULT") return prev; // Don't override result
            return { type: "SALES_STOPPED", data: res.draw };
          });
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="container-official max-w-5xl mx-auto px-4 md:px-6">
        {/* LIVE NOTIFICATION BANNER */}
        {liveNotification && (
          <div className="mb-12 animate-in fade-in zoom-in duration-500">
            {/* Type 1: SALES STOPPED / STARTING SOON */}
            {liveNotification.type === "SALES_STOPPED" && (
              <div className="bg-indigo-900 rounded-2xl shadow-2xl p-8 md:p-12 text-center border-b-8 border-indigo-600">
                <div className="inline-block bg-amber-400 text-indigo-900 font-bold px-4 py-1 rounded-full mb-4 animate-bounce">
                  ⏳ ACTIVE DRAW UPDATE
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-2">
                  SALES CLOSED
                </h2>
                <p className="text-indigo-200 text-xl">
                  The draw is about to begin. Prepare for results!
                </p>
                <div className="mt-8 flex justify-center">
                  <Loader2 className="animate-spin text-white" size={48} />
                </div>
              </div>
            )}

            {/* Type 2: ACTUAL RESULT */}
            {liveNotification.type === "RESULT" && liveNotification.data && (
              <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 md:p-12 relative overflow-hidden text-center">
                <div className="absolute top-0 w-full left-0 bg-rose-600 text-white text-xs font-bold py-1 uppercase tracking-widest animate-pulse">
                  🔴 Live Result Just In
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white mb-2 mt-4">
                  {liveNotification.data.drawName}
                </h2>
                <p className="text-slate-400 mb-8 font-mono">
                  {new Date(
                    liveNotification.data.drawDateTime
                  ).toLocaleString()}
                </p>

                <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
                  {liveNotification.data.winningNumbers.map(
                    (num: number, i: number) => (
                      <div
                        key={i}
                        className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-white flex items-center justify-center text-xl md:text-4xl font-black shadow-lg border-4 border-white/10 animate-bounce"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        {num}
                      </div>
                    )
                  )}
                </div>

                <Link
                  href={`/draw-history/${liveNotification.data.drawId}`}
                  className="inline-block bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors"
                >
                  View Full Details & Winners
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Draw History
            </h1>
            <p className="text-slate-500">
              Official archive of all past results
            </p>
          </div>
          <Link
            href="/fairness-and-transparency"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            How is this verified?
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-400" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No draws have been conducted yet.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((draw) => (
              <div
                key={draw._id}
                className="modern-card p-0 overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Date Section */}
                <div className="p-6 md:w-48 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Calendar size={12} /> Date
                  </div>
                  <p className="text-xl font-bold text-slate-800">
                    {new Date(draw.drawDateTime).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(draw.drawDateTime).getFullYear()}
                  </p>
                </div>

                {/* Numbers Section */}
                <div className="p-6 flex-1 flex flex-col justify-center items-center md:items-start border-b md:border-b-0 border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Trophy size={14} className="text-amber-500" /> Winning
                    Numbers
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {draw.winningNumbers.map((n: number) => (
                      <span
                        key={n}
                        className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm border border-indigo-700"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Section */}
                <div className="p-6 md:w-64 flex flex-col justify-center bg-white">
                  <div className="mb-4 hidden md:block">
                    <p className="text-xs text-slate-400 font-mono truncate bg-slate-50 p-1.5 rounded border border-slate-100 mb-1 flex items-center gap-2">
                      <Hash size={10} /> {draw.hashProof}
                    </p>
                  </div>
                  <Link
                    href={`/draw-history/${draw.drawId}`}
                    className="w-full py-2.5 rounded-lg border-2 border-slate-100 text-slate-600 font-bold text-sm flex items-center justify-center hover:border-indigo-600 hover:text-indigo-600 transition-all"
                  >
                    Verify Results <ArrowRight size={16} className="ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
