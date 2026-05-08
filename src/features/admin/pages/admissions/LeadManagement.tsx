import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import {
  setSearchQuery, setClassFilter, openLeadDrawer
} from '../../../../store/slices/admissionSlice';
import CaptureLeadDrawer from '../../components/admissions/CaptureLeadDrawer';
import AdminLayout from '../../components/layout/AdminLayout';
import { Search, Filter, Phone, Plus, MessageSquare, Clock, Users } from 'lucide-react';
import { AdmissionLeadDTO } from '../../../../types/admission/lead.schema';
import { useHistory } from 'react-router';

const PIPELINE_COLUMNS = [
  { id: 'new', title: 'New Enquiries', color: 'bg-blue-500', bg: 'bg-blue-50/50' },
  { id: 'contacted', title: 'Contacted', color: 'bg-purple-500', bg: 'bg-purple-50/50' },
  { id: 'follow_up', title: 'Follow Up', color: 'bg-amber-500', bg: 'bg-amber-50/50' },
  { id: 'converted', title: 'Converted to App', color: 'bg-emerald-500', bg: 'bg-emerald-50/50' },
] as const;

const LeadManagement: React.FC = () => {
  const history = useHistory()
  const dispatch = useDispatch();

  // NOTE: If TS still complains about state.admission here, check your store.ts!
  const { leads, searchQuery, classFilter } = useSelector((state: RootState) => state.admission);

  // --- FILTERING ENGINE ---
  const filteredLeads = useMemo(() => {
    // Explicitly typed as AdmissionLeadDTO to prevent implicit 'any' errors
    return leads.filter((lead: AdmissionLeadDTO) => {
      const matchesSearch = lead.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.mobile.includes(searchQuery); // FIXED: 'mobile' instead of 'primaryMobile'
      const matchesClass = classFilter === 'ALL' || lead.interestedClassId === classFilter;
      const isNotClosed = lead.status !== 'closed';
      return matchesSearch && matchesClass && isNotClosed;
    });
  }, [leads, searchQuery, classFilter]);

  const uniqueClasses = useMemo(() => {
    // Explicitly typed parameter 'l'
    return Array.from(new Set(leads.map((l: AdmissionLeadDTO) => l.interestedClassId).filter(Boolean)));
  }, [leads]);

  return (
    <AdminLayout
      pageTitle="Lead CRM"
      pageDescription="Manage walk-ins, inquiries, and application conversions."
      breadcrumbs={[{ label: 'Admissions' }, { label: 'Lead CRM' }]}
      headerActions={
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(openLeadDrawer(''))}
            className="px-6 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Capture Lead
          </button>

          <button
            onClick={() => history.push('/admin/admissions/wizard')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
          >
            New Application
          </button>
        </div>
      }
    >

      {/* 1. FILTER & CONTROL BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">

        {/* Search */}
        <div className="flex-1 w-full md:w-96 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by parent name or mobile..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="w-full pl-9 pr-4 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg w-full md:w-auto">
            <Filter size={14} className="text-slate-500" />
            <select
              value={classFilter}
              onChange={(e) => dispatch(setClassFilter(e.target.value))}
              className="text-xs font-black text-slate-700 outline-none bg-transparent w-full cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              {uniqueClasses.map((c: any) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 2. KANBAN BOARD */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-6 min-w-[1000px] h-[calc(100vh-280px)] min-h-[500px]">

          {PIPELINE_COLUMNS.map((column) => {
            // Explicitly typed parameter 'l'
            const columnLeads = filteredLeads.filter((l: AdmissionLeadDTO) => l.status === column.id);

            return (
              <div key={column.id} className={`flex-1 flex flex-col rounded-2xl border border-slate-200 ${column.bg}`}>

                {/* Column Header */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">{column.title}</h4>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Column Cards (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {columnLeads.map((lead: AdmissionLeadDTO) => (
                    <div
                      key={lead.id}
                      onClick={() => dispatch(openLeadDrawer(lead.id || ''))}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
                    >

                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{lead.id}</p>
                          <h5 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {lead.parentName}
                          </h5>
                        </div>
                        <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                          {lead.interestedClassId || 'Unspecified'}
                        </span>
                      </div>

                      {/* Source & Remarks */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                          <Users size={10} /> {lead.source.replace('_', ' ')}
                        </span>
                        {lead.remarks && (
                          <span className="text-[10px] text-slate-400" title={lead.remarks}><MessageSquare size={12} /></span>
                        )}
                      </div>

                      {/* Operational Footer */}
                      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                          <Clock size={10} /> Just now
                        </div>

                        {/* Direct Call Action */}
                        <button
                          onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.mobile}`); }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg transition-colors border border-slate-100 hover:border-emerald-200"
                        >
                          <Phone size={12} /> <span className="text-[10px] font-black">{lead.mobile}</span>
                        </button>
                      </div>

                    </div>
                  ))}

                  {columnLeads.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-200/60 rounded-xl flex items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Leads</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <CaptureLeadDrawer />
    </AdminLayout>
  );
};

export default LeadManagement;