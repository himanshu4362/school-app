import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { TrendingUp, AlertTriangle, BookMarked, Layers, ArrowDownRight, ArrowUpRight, Search, Filter } from 'lucide-react';
import { RootState } from '../../../../store/store';
import AdminLayout from '../../components/layout/AdminLayout';

const LibraryAnalyticsHub: React.FC = () => {
  const { titles, copies, transactions } = useSelector((state: RootState) => state.library);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'MOST_BORROWED' | 'HIGHEST_ATTRITION' | 'NEWEST'>('MOST_BORROWED');

  // ==========================================
  // ANALYTICS ENGINE (V1: Memoized Computation)
  // Note: In V2, this will hit a DailyLibraryMetrics snapshot table.
  // ==========================================
  const inventoryStats = useMemo(() => {
    return Object.values(titles).map(title => {
      const titleCopies = Object.values(copies).filter(c => c.titleId === title.id);
      
      const procuredQty = titleCopies.length;
      const shelfQty = titleCopies.filter(c => c.status === 'AVAILABLE' || c.status === 'RESERVED').length;
      const borrowedQty = titleCopies.filter(c => c.status === 'ISSUED').length;
      
      // Damage & Write-off metrics
      const damagedQty = titleCopies.filter(c => c.condition === 'DAMAGED').length;
      const lostQty = titleCopies.filter(c => c.status === 'LOST' || c.status === 'WITHDRAWN' || c.status === 'DECOMMISSIONED').length;
      const totalAttrition = damagedQty + lostQty;
      const attritionRate = procuredQty > 0 ? ((totalAttrition / procuredQty) * 100).toFixed(1) : '0.0';

      // Circulation Velocity (Trend)
      const historicalIssues = transactions.filter(t => t.type === 'ISSUE' && titleCopies.some(c => c.id === t.copyId)).length;

      return {
        ...title,
        procuredQty,
        shelfQty,
        borrowedQty,
        damagedQty,
        lostQty,
        totalAttrition,
        attritionRate: parseFloat(attritionRate),
        historicalIssues
      };
    });
  }, [titles, copies, transactions]);

  // Filtering & Sorting
  const filteredAndSortedStats = useMemo(() => {
    let result = inventoryStats;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q));
    }

    switch (sortBy) {
      case 'MOST_BORROWED':
        return result.sort((a, b) => b.historicalIssues - a.historicalIssues);
      case 'HIGHEST_ATTRITION':
        return result.sort((a, b) => b.attritionRate - a.attritionRate);
      default:
        return result;
    }
  }, [inventoryStats, searchQuery, sortBy]);

  // Global KPIs
  const totalBooks = Object.values(copies).length;
  const totalIssued = Object.values(copies).filter(c => c.status === 'ISSUED').length;
  const totalDamaged = Object.values(copies).filter(c => c.condition === 'DAMAGED').length;
  const totalLost = Object.values(copies).filter(c => ['LOST', 'WITHDRAWN'].includes(c.status)).length;

  return (
    <AdminLayout pageTitle="Library Analytics & Inventory" pageDescription="Master ledger of all procured assets, circulation velocity, and inventory attrition." breadcrumbs={[{ label: 'Library Hub' }, { label: 'Analytics' }]}>
      
      {/* ========================================== */}
      {/* TOP LEVEL KPIs */}
      {/* ========================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0"><Layers size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Procured</p>
            <h3 className="text-2xl font-black text-slate-900">{totalBooks}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0"><BookMarked size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Currently Borrowed</p>
            <h3 className="text-2xl font-black text-slate-900">{totalIssued}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0"><AlertTriangle size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Damaged Stock</p>
            <h3 className="text-2xl font-black text-slate-900">{totalDamaged}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-rose-200 bg-rose-50/50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-200 text-rose-700 rounded-2xl flex items-center justify-center shrink-0"><TrendingUp size={24} className="rotate-180"/></div>
          <div>
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Lost / Written Off</p>
            <h3 className="text-2xl font-black text-rose-900">{totalLost}</h3>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MASTER INVENTORY TABLE */}
      {/* ========================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-260px)]">
        
        {/* TOOLBAR */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center shrink-0">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Search inventory by title or author..." 
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 shadow-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter size={16} className="text-slate-400"/>
            <select 
              value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="w-full md:w-48 p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 shadow-sm appearance-none"
            >
              <option value="MOST_BORROWED">Most Borrowed</option>
              <option value="HIGHEST_ATTRITION">Highest Attrition</option>
              <option value="NEWEST">Newly Added</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-white sticky top-0 z-10 shadow-sm ring-1 ring-slate-100">
              <tr>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-12 text-center">#</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product / Title</th>
                <th className="p-4 text-[10px] font-black text-indigo-500 uppercase tracking-widest text-center bg-indigo-50/30">Procured</th>
                <th className="p-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center bg-emerald-50/30">Shelf</th>
                <th className="p-4 text-[10px] font-black text-amber-500 uppercase tracking-widest text-center bg-amber-50/30">Borrowed</th>
                <th className="p-4 text-[10px] font-black text-rose-500 uppercase tracking-widest text-center bg-rose-50/30">Damaged / Lost</th>
                <th className="p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Attrition Rate</th>
                <th className="p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Total Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedStats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <Layers size={32} className="mx-auto mb-3 opacity-20"/>
                    <p className="text-sm font-bold">No inventory records found.</p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedStats.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-xs font-bold text-slate-400 text-center">{idx + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1543005128-d1b1502c6fd7?q=80&w=200&auto=format&fit=crop'} alt="cover" className="w-8 h-10 object-cover rounded shadow-sm border border-slate-200" />
                        <div>
                          <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{item.title}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{item.author} • {item.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-black text-indigo-700 bg-indigo-50/10">{item.procuredQty}</td>
                    <td className="p-4 text-center font-black text-emerald-600 bg-emerald-50/10">{item.shelfQty}</td>
                    <td className="p-4 text-center font-black text-amber-600 bg-amber-50/10">{item.borrowedQty}</td>
                    <td className="p-4 text-center bg-rose-50/10">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.totalAttrition > 0 ? 'bg-rose-100 text-rose-700' : 'text-slate-400'}`}>
                        {item.totalAttrition} ( {item.damagedQty}D / {item.lostQty}L )
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`flex items-center justify-center gap-1 text-[11px] font-black ${item.attritionRate > 10 ? 'text-rose-600' : item.attritionRate > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {item.attritionRate}% {item.attritionRate > 10 && <ArrowUpRight size={12}/>}
                      </span>
                    </td>
                    <td className="p-4 text-center font-black text-slate-700">{item.historicalIssues}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LibraryAnalyticsHub;