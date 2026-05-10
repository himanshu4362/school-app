import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { BookMarked, Barcode, ShieldAlert } from 'lucide-react';
import { RootState } from '../../../../store/store';
import AdminLayout from '../../components/layout/AdminLayout';
import { CatalogManager } from '../../components/library/CatalogManager';
import AllocationManager from '../../components/library/AllocationManager';

const LibraryAdminHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'ACCESSION'>('CATALOG');
  const { titles, copies, validationErrors } = useSelector((state: RootState) => state.library);

  return (
    <AdminLayout pageTitle="Library Central Command" pageDescription="Manage Master Catalogs and Physical Accession Inventories." breadcrumbs={[{ label: 'Library Hub' }, { label: 'Procurement' }]}>
      
      {validationErrors.length > 0 && (
        <div className="mb-6 bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl flex items-start gap-3 shadow-sm">
          <ShieldAlert className="text-rose-600 shrink-0 mt-0.5" size={20}/>
          <div>
            <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest">Library Policy Violation</h4>
            <ul className="mt-1 space-y-1">{validationErrors.map((err, idx) => <li key={idx} className="text-xs font-bold text-rose-700">{err.message}</li>)}</ul>
          </div>
        </div>
      )}

      {/* DOMAIN SEGREGATION TABS */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button onClick={() => setActiveTab('CATALOG')} className={`pb-3 text-sm font-black uppercase tracking-widest border-b-2 flex items-center gap-2 transition-all ${activeTab === 'CATALOG' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <BookMarked size={16}/> Catalog Domain (Titles)
        </button>
        <button onClick={() => setActiveTab('ACCESSION')} className={`pb-3 text-sm font-black uppercase tracking-widest border-b-2 flex items-center gap-2 transition-all ${activeTab === 'ACCESSION' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <Barcode size={16}/> Inventory Domain (Accession)
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
        {activeTab === 'CATALOG' ? (
          <CatalogManager titles={titles} />
        ) : (
          <AllocationManager titles={titles} copies={copies} />
        )}
      </div>

    </AdminLayout>
  );
};

export default LibraryAdminHub;