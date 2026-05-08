import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { setActiveJob, openCandidateDrawer } from '../../../../store/slices/recruitmentSlice';
import AdminLayout from '../../components/layout/AdminLayout';
import CandidateDrawer from '../../components/faculty/recruitment/CandidateDrawer';
import { Briefcase, Plus, Users, IndianRupee, Mail, Phone, ChevronRight } from 'lucide-react';

const PIPELINE_COLUMNS = [
  { id: 'applied', title: 'Applied', color: 'bg-slate-500', border: 'border-slate-200' },
  { id: 'shortlisted', title: 'Shortlisted', color: 'bg-blue-500', border: 'border-blue-200' },
  { id: 'demo_scheduled', title: 'Demo Scheduled', color: 'bg-purple-500', border: 'border-purple-200' },
  { id: 'interviewing', title: 'Interviewing', color: 'bg-amber-500', border: 'border-amber-200' },
  { id: 'offer_processing', title: 'Offer Stage', color: 'bg-emerald-500', border: 'border-emerald-200' },
  { id: 'hired_pending_conversion', title: 'Ready To Hire', color: 'bg-indigo-500', border: 'border-indigo-200' },
] as const;

const RecruitmentPipeline: React.FC = () => {
  const dispatch = useDispatch();
  const { jobs, candidates, activeJobId } = useSelector((state: RootState) => state.recruitment);

  // Filter candidates strictly for the currently selected job
  const activeCandidates = useMemo(() => {
    return candidates.filter(c => c.jobId === activeJobId && c.pipelineState !== 'talent_pool');
  }, [candidates, activeJobId]);

  const activeJob = jobs.find(j => j.id === activeJobId);

  return (
    <AdminLayout 
      pageTitle="Talent Acquisition" 
      pageDescription="Manage applicant pipeline and candidate evaluations."
      breadcrumbs={[{ label: 'HR & Faculty' }, { label: 'Recruitment' }]}
      headerActions={
        <button 
          onClick={() => dispatch(openCandidateDrawer(''))}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Add Candidate
        </button>
      }
    >
      {/* 1. JOB SELECTOR BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Briefcase size={20} /></div>
          <div className="flex-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Active Vacancy</label>
            <select 
              value={activeJobId || ''} 
              onChange={(e) => dispatch(setActiveJob(e.target.value))}
              className="w-full text-sm font-bold bg-transparent outline-none cursor-pointer"
            >
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.targetRole} ({job.status})</option>
              ))}
            </select>
          </div>
        </div>
        
        {activeJob && (
          <div className="hidden md:flex gap-6 pr-4 border-l border-slate-100 pl-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</p>
              <p className="text-sm font-bold text-slate-800">₹{activeJob.budgetMin} - ₹{activeJob.budgetMax}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicants</p>
              <p className="text-sm font-bold text-slate-800">{activeCandidates.length} Active</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. THE KANBAN BOARD */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-[1200px] h-[calc(100vh-280px)] min-h-[500px]">
          {PIPELINE_COLUMNS.map((column) => {
            const columnCandidates = activeCandidates.filter(c => c.pipelineState === column.id);

            return (
              <div key={column.id} className={`flex-1 flex flex-col rounded-2xl border bg-slate-50/50 ${column.border}`}>
                
                {/* Column Header */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${column.color}`} />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">{column.title}</h4>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {columnCandidates.length}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {columnCandidates.map((candidate) => (
                    <div 
                      key={candidate.id}
                      onClick={() => dispatch(openCandidateDrawer(candidate.id || ''))}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                          {candidate.firstName} {candidate.lastName}
                        </h5>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {candidate.source.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-1.5 mb-3">
                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                          <Phone size={10}/> {candidate.mobile}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 truncate">
                          <Mail size={10}/> {candidate.email}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          <IndianRupee size={10}/> 
                          {candidate.offeredSalarySnapshot ? `Offered: ${candidate.offeredSalarySnapshot}` : `Exp: ${candidate.expectedSalary || 'N/A'}`}
                        </div>
                        {column.id === 'hired_pending_conversion' && (
                          <div className="text-[10px] font-black text-indigo-600 flex items-center gap-1 animate-pulse">
                            Convert <ChevronRight size={12}/>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {columnCandidates.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-200/60 rounded-xl flex items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Empty</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <CandidateDrawer />
    </AdminLayout>
  );
};

export default RecruitmentPipeline;