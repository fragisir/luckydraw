'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  startSales,
  stopSales,
  runSpecificDraw, 
  getAllDraws, 
  getDrawAnalytics, 
  getAllTickets, 
  getTicketStats 
} from '../../../lib/api';
import { 
  CreditCard, Users, Trophy, Ticket, Play, LayoutDashboard, RefreshCw, 
  AlertTriangle, CheckCircle2, PauseCircle, PlayCircle, BarChart2, PieChart as PieChartIcon, Calendar, Clock, Lock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dataLoading, setDataLoading] = useState(false);
  
  // Data
  const [stats, setStats] = useState<any>(null);
  const [draws, setDraws] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedDrawId, setSelectedDrawId] = useState<string | null>(null);

  // Status
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [processingDrawId, setProcessingDrawId] = useState<string | null>(null);
  
  // Countdown State
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pendingDrawId, setPendingDrawId] = useState<string | null>(null);

  const [pollFailures, setPollFailures] = useState(0);

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(() => {
        if (pollFailures < 3) fetchInitialData(true);
    }, 10000); 
    return () => clearInterval(interval);
  }, [pollFailures]);

  useEffect(() => {
    if (selectedDrawId) fetchAnalytics(selectedDrawId);
  }, [selectedDrawId]);

  // Countdown Effect
  useEffect(() => {
     if (countdown === null) return;
     
     if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
     } else {
        // Countdown finished, execute draw
        if (pendingDrawId) executeDraw(pendingDrawId);
     }
  }, [countdown, pendingDrawId]);

  const fetchInitialData = async (silent = false) => {
    if (!silent) setDataLoading(true);
    try {
      const [ticketsRes, statsRes, drawsRes] = await Promise.all([
        getAllTickets(),
        getTicketStats(),
        getAllDraws()
      ]);

      if (ticketsRes.success) setTickets(ticketsRes.tickets || []);
      if (statsRes.success) setStats(statsRes.stats);
      if (drawsRes.success) {
        setDraws(drawsRes.draws || []);
        if (drawsRes.draws.length > 0 && !selectedDrawId) {
           setSelectedDrawId(drawsRes.draws[0]._id);
        }
      }
      setPollFailures(0); // Reset on success
    } catch (err) {
      console.error('Data fetch error:', err);
      if (silent) setPollFailures(prev => prev + 1);
    } finally {
      if (!silent) setDataLoading(false);
    }
  };

  const fetchAnalytics = async (drawId: string) => {
    try {
      const res = await getDrawAnalytics(drawId);
      if (res.success) setAnalytics(res);
    } catch (err) {
      console.error('Analytics error:', err);
    }
  };

  // ACTIONS
  const handleStartSales = async () => {
    try {
      const res = await startSales();
      if (res.success) {
        setMessage(res.message);
        fetchInitialData();
      } else setError(res.message);
    } catch (err: any) {
      setError('Failed to start sales');
    }
  };

  const handleStopSales = async () => {
    if (!confirm('Are you sure you want to STOP sales? Users will not be able to buy tickets.')) return;
    try {
      const res = await stopSales();
      if (res.success) {
        setMessage(res.message);
        fetchInitialData();
      } else setError(res.message);
    } catch (err: any) {
      setError('Failed to stop sales');
    }
  };

  const handleRunDraw = (drawId: string) => {
    if (!confirm('Are you sure you want to RUN the draw? This will generate winners and close the draw.')) return;
    setPendingDrawId(drawId);
    setCountdown(5);
  };

  const executeDraw = async (drawId: string) => {
    setCountdown(null);
    setProcessingDrawId(drawId);
    try {
      const res = await runSpecificDraw(drawId);
      if (res.success) {
        setMessage('Draw executed successfully! Redirecting...');
        // Redirect to history page using the historyId from response
        if (res.historyId) {
            router.push(`/draw-history/${res.historyId}`);
        } else {
            // Fallback if historyId missing (old backend version?)
            fetchInitialData(); 
            if (selectedDrawId === drawId) fetchAnalytics(drawId);
        }
      } else {
        setError(res.message);
        setProcessingDrawId(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Execution failed');
      setProcessingDrawId(null);
    }
  };

  // Find Active Draw (Open or Stopped)
  const activeDraw = draws.find(d => d.status === 'OPEN' || d.status === 'STOPPED');

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg">Admin Dashboard</h1>
            <p className="text-xs text-slate-500">Lifecycle Control</p>
          </div>
        </div>
        
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
           <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={14} />} label="Controls" />
           <TabButton active={activeTab === 'draws'} onClick={() => setActiveTab('draws')} icon={<Calendar size={14} />} label="History" />
           <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart2 size={14} />} label="Analytics" />
        </div>

        <div className="flex items-center gap-3">
           <Link href="/" className="text-sm text-slate-500 hover:text-indigo-600">View Site</Link>
           <button onClick={() => fetchInitialData(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
             <RefreshCw size={18} className={dataLoading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        
        {/* Messages */}
        {message && <Alert type="success" msg={message} close={() => setMessage('')} />}
        {error && <Alert type="error" msg={error} close={() => setError('')} />}

        {/* --- MAIN CONTROLS (Dashboard) --- */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in space-y-8">
             
             {/* Lifecycle Control Card */}
             <div className="modern-card p-8 border-t-8 border-t-indigo-600">
                <div className="flex justify-between items-start mb-8">
                   <div>
                     <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Active Draw Status</h2>
                     <p className="text-slate-500 mt-1">Manage the current draw lifecycle.</p>
                   </div>
                   {activeDraw ? (
                      <span className={`px-4 py-2 rounded-full font-bold text-sm border ${
                        activeDraw.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'
                      }`}>
                        {activeDraw.status === 'OPEN' ? '🟢 SALES OPEN' : '🔴 SALES STOPPED'}
                      </span>
                   ) : (
                      <span className="px-4 py-2 rounded-full font-bold text-sm bg-slate-100 text-slate-500">INACTIVE</span>
                   )}
                </div>

                {/* Control Buttons */}
                <div className="grid md:grid-cols-2 gap-6">
                   {!activeDraw && (
                      <button onClick={handleStartSales} className="btn-modern-primary py-6 text-xl shadow-xl flex flex-col items-center justify-center gap-2">
                         <PlayCircle size={32} /> START NEW DRAW
                         <span className="text-xs font-normal opacity-80">Open ticket sales for a new draw</span>
                      </button>
                   )}

                   {activeDraw && activeDraw.status === 'OPEN' && (
                      <button onClick={handleStopSales} className="bg-rose-600 text-white rounded-xl py-6 text-xl font-bold shadow-xl hover:bg-rose-700 transition flex flex-col items-center justify-center gap-2">
                         <PauseCircle size={32} /> STOP SALES
                         <span className="text-xs font-normal opacity-80">Close sales to prepare for draw</span>
                      </button>
                   )}

                   {activeDraw && activeDraw.status === 'STOPPED' && (
                      <>
                        <button onClick={handleStartSales} className="bg-emerald-500 text-white rounded-xl py-6 text-lg font-bold shadow-md hover:bg-emerald-600 transition flex items-center justify-center gap-2">
                           <PlayCircle size={24} /> RESUME SALES
                        </button>
                        
                        <button 
                           onClick={() => handleRunDraw(activeDraw._id)}
                           disabled={processingDrawId === activeDraw._id || (activeDraw.totalTickets === 0)}
                           className={`
                             rounded-xl py-6 text-xl font-bold shadow-xl flex flex-col items-center justify-center gap-2 transition-all
                             ${processingDrawId === activeDraw._id || activeDraw.totalTickets === 0
                               ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                               : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02]'
                             }
                           `}
                        >
                           {processingDrawId === activeDraw._id ? <RefreshCw className="animate-spin" size={32} /> : <Play size={32} fill="currentColor" />}
                           {processingDrawId === activeDraw._id ? 'PROCESSING...' : 'RUN DRAW'}
                           <span className="text-xs font-normal opacity-80">
                             {activeDraw.totalTickets === 0 ? 'Wait for ticket sales' : `Execute draw for ${activeDraw.totalTickets} tickets`}
                           </span>
                        </button>
                      </>
                   )}
                </div>

                {/* Current Draw Info */}
                {activeDraw && (
                  <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 text-center">
                     <div>
                       <p className="text-xs font-bold text-slate-400 uppercase">Current Draw</p>
                       <p className="font-bold text-slate-800">{activeDraw.drawName}</p>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 uppercase">Tickets Sold</p>
                       <p className="font-bold text-indigo-600 text-xl">{activeDraw.totalTickets || 0}</p>
                     </div>
                  </div>
                )}
             </div>

             {/* Stats Row */}
             <div className="grid grid-cols-3 gap-4">
                <StatCard title="Total Revenue" value={`$${(stats?.paid || 0) * 4}`} icon={<CreditCard size={18} />} color="emerald" />
                <StatCard title="Total Winners" value={stats?.winners || 0} icon={<Trophy size={18} />} color="amber" />
                <StatCard title="Past Draws" value={draws.filter(d => d.status === 'DRAWN').length} icon={<RefreshCw size={18} />} color="blue" />
             </div>
          </div>
        )}

        {/* --- HISTORY TAB --- */}
        {activeTab === 'draws' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Draw History</h2>
            <div className="modern-card overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                    <tr>
                      <th className="px-6 py-3">Draw Name</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Winning Numbers</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {draws.filter(d => d.status === 'DRAWN').map(d => (
                      <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-slate-800">{d.drawName}</td>
                        <td className="px-6 py-3 text-slate-500">{new Date(d.updatedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-3 font-mono text-indigo-600 font-bold">
                          {d.winningNumbers && d.winningNumbers.length > 0 
                             ? d.winningNumbers.join(', ') 
                             : d.winningTicketNumber}
                        </td>
                        <td className="px-6 py-3"><span className="badge bg-slate-100 text-slate-600">COMPLETED</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        )}

        {/* --- ANALYTICS TAB --- */}
        {activeTab === 'analytics' && (
           <div className="animate-fade-in space-y-8">
              <div className="modern-card p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                 <div>
                    <h2 className="text-xl font-bold text-slate-800">Draw Analytics</h2>
                    <p className="text-sm text-slate-500">Deep dive into ticket sales and winning numbers.</p>
                 </div>
                 <select 
                   className="w-full md:w-64 p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   onChange={(e) => setSelectedDrawId(e.target.value)}
                   value={selectedDrawId || ''}
                 >
                   {draws.map(d => (
                     <option key={d._id} value={d._id}>{d.drawName} ({d.status === 'OPEN' ? '🟢 Open' : d.status === 'STOPPED' ? '🔴 Stopped' : '🏁 Drawn'})</option>
                   ))}
                 </select>
              </div>

              {analytics && (
                <>
                <div className="grid lg:grid-cols-2 gap-8">
                   {/* Number Frequency Chart */}
                   <div className="modern-card p-8">
                      <div className="mb-6">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                          <BarChart2 className="text-indigo-600" size={20} /> Number Frequency
                        </h3>
                        <p className="text-xs text-slate-400">Frequency of each number (1-20) in ticket selection.</p>
                      </div>
                      <div className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.numberFrequency}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                               <XAxis dataKey="number" tick={{fontSize: 12}} />
                               <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                               <RechartsTooltip 
                                 cursor={{fill: '#f1f5f9'}}
                                 contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                               />
                               <Bar dataKey="count" name="Times Picked" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   
                   {/* Winners/Prize Distribution */}
                   <div className="modern-card p-8">
                      <div className="mb-6">
                         <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                           <PieChartIcon className="text-emerald-600" size={20} /> Prize Distribution
                         </h3>
                         <p className="text-xs text-slate-400">Breakdown of winning tickets by tier.</p>
                      </div>
                      <div className="h-[300px] w-full flex items-center justify-center">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                               <Pie
                                  data={analytics.prizeDistribution}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={100}
                                  paddingAngle={5}
                                  dataKey="value"
                               >
                                  {analytics.prizeDistribution.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill || ['#F59E0B', '#10B981', '#3B82F6', '#94a3b8'][index % 4]} />
                                  ))}
                               </Pie>
                               <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                               <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </div>

                {/* Ticket List Table */}
                <div className="modern-card overflow-hidden">
                    <div className="p-6 border-b border-slate-100 mb-4">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                           <Ticket className="text-blue-600" size={20} /> Ticket Report
                        </h3>
                        <p className="text-xs text-slate-400">Detailed list of all participating tickets and their results.</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                          <tr>
                            <th className="px-6 py-3">Ticket #</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Selected Numbers</th>
                            <th className="px-6 py-3 text-center">Matches</th>
                            <th className="px-6 py-3">Prize Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {analytics.tickets?.sort((a:any, b:any) => {
                             // Sort winners first
                             const matchA = a.selectedNumbers.filter((n:number) => analytics.winningNumbers.includes(n)).length;
                             const matchB = b.selectedNumbers.filter((n:number) => analytics.winningNumbers.includes(n)).length;
                             return matchB - matchA;
                          }).map((t: any) => {
                             const matches = t.selectedNumbers.filter((n:number) => analytics.winningNumbers.includes(n)).length;
                             let prize = { label: 'No Prize', bg: 'bg-slate-100 text-slate-500' };
                             if (matches === 6) prize = { label: '🏆 JACKPOT', bg: 'bg-amber-100 text-amber-700 border border-amber-200' };
                             else if (matches === 5) prize = { label: '🥈 2nd Prize', bg: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
                             else if (matches === 4) prize = { label: '🥉 3rd Prize', bg: 'bg-blue-100 text-blue-700 border border-blue-200' };

                             return (
                                <tr key={t._id} className={`hover:bg-slate-50 ${matches >= 4 ? 'bg-indigo-50/30' : ''}`}>
                                  <td className="px-6 py-4 font-mono text-xs">{t.ticketNumber}</td>
                                  <td className="px-6 py-4">
                                    <div className="font-medium text-slate-800">{t.name}</div>
                                    <div className="text-xs text-slate-400">{t.email}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                     <div className="flex gap-1 flex-wrap">
                                        {t.selectedNumbers.map((num:number) => {
                                           const isMatch = analytics.winningNumbers.includes(num);
                                           return (
                                             <span key={num} className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${isMatch ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>
                                               {num}
                                             </span>
                                           )
                                        })}
                                     </div>
                                  </td>
                                  <td className="px-6 py-4 text-center font-bold text-slate-700">{matches}/6</td>
                                  <td className="px-6 py-4">
                                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${prize.bg}`}>
                                       {prize.label}
                                     </span>
                                  </td>
                                </tr>
                             )
                          })}
                          {(!analytics.tickets || analytics.tickets.length === 0) && (
                             <tr><td colSpan={5} className="p-8 text-center text-slate-400">No tickets found for this draw.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                </div>
                </>
              )}
           </div>
        )}

      </div>
        {/* Countdown Overlay */}
        {countdown !== null && (
           <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-fade-in">
              <div className="text-9xl font-black font-mono mb-8 tabular-nums animate-pulse">
                {countdown}
              </div>
           </div>
        )}
      </div>

  );
}

// Helpers
function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
    >
      {icon} {label}
    </button>
  )
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = { emerald: 'bg-emerald-50', blue: 'bg-blue-50', amber: 'bg-amber-50', indigo: 'bg-indigo-50' };
  return (
    <div className="stat-card p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
       <div className="flex justify-between items-start">
         <div>
           <p className="text-xs text-slate-400 font-bold uppercase">{title}</p>
           <h3 className="text-xl font-black text-slate-800">{value}</h3>
         </div>
         <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
       </div>
    </div>
  )
}

function Alert({ type, msg, close }: any) {
  return (
    <div className={`p-4 rounded-xl border flex items-center gap-3 ${type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
       {type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
       <span className="text-sm font-medium flex-grow">{msg}</span>
       <button onClick={close} className="opacity-50 hover:opacity-100">×</button>
    </div>
  )
}
