import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { X, Calendar, User, FileText, CheckCircle, XCircle } from 'lucide-react';
import { RootState } from '../../../../../store/store';
import { reviewLeaveRequest, selectLeaveRequest } from '../../../../../store/slices/leaveSlice';
import { updateEmployeeStatus } from '../../../../../store/slices/facultyDirectorySlice';

const typeLabels = {
  casual_leave: 'Casual Leave (CL)',
  sick_leave: 'Sick Leave (SL)',
  earned_leave: 'Earned Leave (EL)',
  maternity: 'Maternity Leave (ML)',
  lwp: 'Leave Without Pay (LWP)'
};

const LeaveReviewModal: React.FC = () => {
  const dispatch = useDispatch();
  const [note, setNote] = useState('');

  const selectedId = useSelector((state: RootState) => state.leave.selectedRequestId);
  const request = useSelector((state: RootState) => selectedId ? state.leave.requests[selectedId] : null);
  const employee = useSelector((state: RootState) => 
    request ? state.facultyDirectory.staff.find(s => s.id === request.employeeId) : null
  );

  if (!selectedId || !request || !employee) return null;

  const handleReview = (status: 'approved' | 'rejected') => {
    // 1. Update the Leave Ledger
    dispatch(reviewLeaveRequest({
      requestId: request.id,
      status,
      reviewerId: 'ADMIN-001', // Replace with Auth user later
      note
    }));

    // 2. THE CLOSED LOOP: If approved, auto-sync the Directory!
    if (status === 'approved') {
      dispatch(updateEmployeeStatus({ id: employee.id, status: 'on_leave' }));
    }

    // 3. Close the modal
    dispatch(selectLeaveRequest(null));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="text-indigo-600" /> Leave Request Review
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">ID: {request.id}</p>
          </div>
          <button onClick={() => dispatch(selectLeaveRequest(null))} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 overflow-y-auto space-y-8">
          
          {/* Employee Snapshot */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg overflow-hidden shadow-inner">
              {employee.profilePhoto ? <img src={employee.profilePhoto} alt="" className="w-full h-full object-cover"/> : employee.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">{employee.fullName}</h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{employee.employeeId} • {employee.departmentId}</p>
            </div>
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Leave Type</label>
              <p className="text-sm font-black text-indigo-600">{typeLabels[request.leaveType as keyof typeof typeLabels]}</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Duration</label>
              <p className="text-sm font-black text-slate-800">{request.totalDays} Days</p>
            </div>
            <div className="col-span-2 flex gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">From Date</label>
                <p className="text-sm font-black text-slate-800 flex items-center gap-1.5"><Calendar size={14} className="text-slate-400"/> {format(new Date(request.startDate), 'PPP')}</p>
              </div>
              <div className="flex-1 border-l border-slate-200 pl-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">To Date</label>
                <p className="text-sm font-black text-slate-800 flex items-center gap-1.5"><Calendar size={14} className="text-slate-400"/> {format(new Date(request.endDate), 'PPP')}</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Reason Provided</label>
            <p className="text-sm font-medium text-slate-700 bg-amber-50/50 p-4 rounded-xl border border-amber-100 leading-relaxed">
              "{request.reason}"
            </p>
          </div>

          {/* HR Actions */}
          {request.status === 'pending' && (
            <div className="pt-4 border-t border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">HR / Admin Notes (Optional)</label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add comments for the employee..."
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all min-h-[100px]"
              />
            </div>
          )}
        </div>

        {/* FOOTER */}
        {request.status === 'pending' ? (
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
            <button onClick={() => handleReview('rejected')} className="flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest border-2 border-rose-200 text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center gap-2">
              <XCircle size={16} /> Reject Leave
            </button>
            <button onClick={() => handleReview('approved')} className="flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest bg-emerald-500 text-white shadow-md hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
              <CheckCircle size={16} /> Approve & Auto-Sync
            </button>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              This request was {request.status} by {request.reviewedBy}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveReviewModal;