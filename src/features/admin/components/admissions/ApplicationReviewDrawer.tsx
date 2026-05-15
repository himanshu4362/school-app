import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { X, CheckCircle, ShieldAlert, FileText, UserCheck, GraduationCap } from 'lucide-react';
import { closeReviewDrawer, updateApplicationState } from '../../../../store/slices/admissionSlice';
import api from '../../../../services/api';

const ApplicationReviewDrawer: React.FC = () => {
    const dispatch = useDispatch();
    const { isReviewDrawerOpen, selectedApplicationId, applications } = useSelector((state: RootState) => state.admission);
    const [isProcessing, setIsProcessing] = useState(false);

    const app = applications.find(a => a._id === selectedApplicationId);

    if (!isReviewDrawerOpen || !app) return null;

    // 🟢 Engine 1: Approve Application
    const handleApprove = async () => {
        try {
            setIsProcessing(true);
            const res = await api.patch(`/api/admissions/applications/${app._id}/status`, {
                status: 'APPROVED',
                remarks: 'All documents verified and approved by Admin.'
            });
            if (res.data.success) {
                dispatch(updateApplicationState({ id: app._id, updates: { status: 'APPROVED' } }));
                alert("Application Approved!");
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to approve.");
        } finally {
            setIsProcessing(false);
        }
    };

    // 🟢 Engine 2: Atomic Enrollment (Generates STU ID & Roll No)
    const handleEnroll = async () => {
        try {
            setIsProcessing(true);
            const res = await api.post(`/api/admissions/applications/${app._id}/enroll`);
            if (res.data.success) {
                dispatch(updateApplicationState({ id: app._id, updates: { status: 'ENROLLED' } }));
                alert(`Student Enrolled Successfully!\nEnrollment ID: ${res.data.data.enrollmentNumber}\nRoll No: ${res.data.data.rollNumber}`);
                dispatch(closeReviewDrawer()); // Close it to see the updated table
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Enrollment Failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => dispatch(closeReviewDrawer())} />

            <div className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-drawer z-50 flex flex-col transition-transform duration-300 ease-in-out border-l border-slate-200 translate-x-0`}>
                
                {/* HEADER */}
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">{app.applicationNumber}</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Application Review</p>
                    </div>
                    <button onClick={() => dispatch(closeReviewDrawer())} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl"><X size={20} /></button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    
                    {/* Status Banner */}
                    {app.status === 'APPROVED' && (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-800">
                            <CheckCircle size={20} className="text-emerald-500" />
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest">Application Approved</h4>
                                <p className="text-xs mt-0.5">Ready for final seat allocation and enrollment.</p>
                            </div>
                        </div>
                    )}
                    {app.status === 'ENROLLED' && (
                        <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center gap-3 text-purple-800">
                            <GraduationCap size={20} className="text-purple-500" />
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest">Student Enrolled</h4>
                                <p className="text-xs mt-0.5">Identity sequence generated. Seat consumed.</p>
                            </div>
                        </div>
                    )}

                    {/* Student Info */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Student Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm font-bold text-slate-700">
                            <div>
                                <p className="text-[9px] text-slate-400 uppercase">Name</p>
                                <p>{app.studentProfile?.firstName} {app.studentProfile?.lastName}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 uppercase">Target Class</p>
                                <p>{app.appliedGradeId?.name} {app.preferredSectionId ? `(${app.preferredSectionId.name})` : ''}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 uppercase">Gender</p>
                                <p className="capitalize">{app.studentProfile?.gender}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 uppercase">Government ID</p>
                                <p className="text-emerald-600 flex items-center gap-1"><ShieldAlert size={12} /> Secured in Vault</p>
                            </div>
                        </div>
                    </div>

                    {/* Guardians Info */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Primary Guardian</h3>
                        {app.guardians?.filter((g: any) => g.isPrimaryContact).map((g: any, i: number) => (
                            <div key={i} className="text-sm font-bold text-slate-700">
                                <p>{g.fullName} <span className="text-[10px] text-slate-400 uppercase ml-2">({g.relation})</span></p>
                                <p className="text-blue-600 text-xs mt-1">📞 +91 {g.mobile}</p>
                            </div>
                        ))}
                    </div>

                    {/* Documents */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Uploaded Documents</h3>
                        <div className="space-y-2">
                            {app.documents?.map((doc: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <FileText size={16} className="text-blue-500" />
                                        {doc.documentType.replace('_', ' ')}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                                        {doc.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS (The Engine Triggers) */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0 space-y-3">
                    {app.status === 'SUBMITTED' || app.status === 'DOCUMENT_PENDING' ? (
                        <button onClick={handleApprove} disabled={isProcessing} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black text-sm shadow-xl hover:bg-slate-800 transition-all flex justify-center items-center gap-2">
                            <UserCheck size={16} /> {isProcessing ? 'Processing...' : 'Verify & Approve Application'}
                        </button>
                    ) : app.status === 'APPROVED' ? (
                        <button onClick={handleEnroll} disabled={isProcessing} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all flex justify-center items-center gap-2">
                            <GraduationCap size={16} /> {isProcessing ? 'Generating...' : 'Confirm Enrollment & Generate ID'}
                        </button>
                    ) : (
                        <button disabled className="w-full py-3.5 bg-slate-200 text-slate-400 rounded-xl font-black text-sm cursor-not-allowed">
                            Process Completed
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default ApplicationReviewDrawer;