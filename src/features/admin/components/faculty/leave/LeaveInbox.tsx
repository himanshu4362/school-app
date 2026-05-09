import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, formatDistanceToNow } from 'date-fns';
import { Filter, Search, Calendar, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { RootState } from '../../../../../store/store';
import { selectFilteredLeaveInbox } from '../../../../../store/selectors/leaveSelectors';
import { setLeaveFilter, selectLeaveRequest } from '../../../../../store/slices/leaveSlice';

const LeaveInbox: React.FC = () => {
  const dispatch = useDispatch();
  const filter = useSelector((state: RootState) => state.leave.filterStatus);
  const inbox = useSelector(selectFilteredLeaveInbox);

  // UI Helpers
  const statusColors = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
    cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  const typeLabels = {
    casual_leave: 'Casual Leave (CL)',
    sick_leave: 'Sick Leave (SL)',
    earned_leave: 'Earned Leave (EL)',
    maternity: 'Maternity Leave (ML)',
    lwp: 'Leave Without Pay (LWP)'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2 p-1 bg-slate-50 rounded-xl overflow-x-auto no-scrollbar">
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => dispatch(setLeaveFilter(f as any))}
              className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm hidden lg:block">
          <Search className="absolute left-4 top-3 text-slate-400" size={16} />
          <input type="text" placeholder="Search by name or ID..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-sm font-bold transition-all outline-none" />
        </div>
      </div>

      {/* INBOX LIST */}
      {inbox.length === 0 ? (
        <div className="bg-white p-20 rounded-[2.5rem] border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto"><FileText size={40}/></div>
          <h3 className="text-xl font-black text-slate-900">Inbox is Empty</h3>
          <p className="text-sm font-medium text-slate-400">No {filter !== 'all' ? filter : ''} leave requests found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {inbox.map(request => (
            <div 
              key={request.id}
              onClick={() => dispatch(selectLeaveRequest(request.id))}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between group"
            >
              {/* Employee Info */}
              <div className="flex gap-4 w-full lg:w-1/3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 overflow-hidden shrink-0">
                  {request.employeePhoto ? <img src={request.employeePhoto} alt="" className="w-full h-full object-cover"/> : request.employeeName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{request.employeeName}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{request.employeeCode} • {request.department}</p>
                </div>
              </div>

              {/* Leave Info */}
              <div className="flex-1 w-full flex flex-col md:flex-row gap-6 items-start md:items-center justify-between pl-0 lg:pl-6 lg:border-l border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> {typeLabels[request.leaveType as keyof typeof typeLabels]}</span>
                  <p className="text-xs font-black text-slate-700">
                    {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd')}
                    <span className="ml-2 text-slate-400">({request.totalDays} Days)</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applied</p>
                    <p className="text-[11px] font-black text-slate-600 flex items-center gap-1"><Clock size={12}/> {formatDistanceToNow(new Date(request.appliedAt))} ago</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${statusColors[request.status as keyof typeof statusColors]}`}>
                    {request.status}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveInbox;